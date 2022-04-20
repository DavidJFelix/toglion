use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc,
    },
};

use futures_util::{future, SinkExt, Stream, StreamExt, TryFutureExt};
use tokio::{
    signal::{
        self,
        unix::{signal, SignalKind},
    },
    sync::{mpsc, RwLock},
};
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::{
    sse::Event,
    ws::{Message, WebSocket, Ws},
    Filter,
};
extern crate pretty_env_logger;

// FIXME: make this use ULID instead
static NEXT_CONNECTION_ID: AtomicUsize = AtomicUsize::new(1);
type WSClientConnections = Arc<RwLock<HashMap<usize, mpsc::UnboundedSender<Message>>>>;

#[tokio::main]
async fn main() {
    pretty_env_logger::init();
    let log = warp::log("event-gateway::api");

    let mut sig_hup = signal(SignalKind::hangup()).unwrap();
    let mut sig_term = signal(SignalKind::terminate()).unwrap();
    let mut sig_int = signal(SignalKind::interrupt()).unwrap();

    // FIXME: figure out how to do this without the clone and 2 filters
    let ws_client_connections = WSClientConnections::default();
    let ws_client_connections2 = ws_client_connections.clone();
    let sse_client_connections = ws_client_connections.clone();
    let ws_client_connections_filter = warp::any().map(move || ws_client_connections.clone());
    let ws_client_connections_filter2 = warp::any().map(move || ws_client_connections2.clone());
    let sse_client_connections_filter = warp::any().map(move || sse_client_connections.clone());

    let client_routes = warp::path("ws")
        // The `ws()` filter will prepare Websocket handshake...
        .and(warp::ws())
        .and(ws_client_connections_filter)
        .map(|ws: warp::ws::Ws, ws_client_connections| {
            // This will call our function if the handshake succeeds.
            ws.on_upgrade(move |websocket| on_connect(websocket, ws_client_connections))
        })
        .or(warp::path("sse")
            .and(warp::get())
            .and(sse_client_connections_filter)
            .map(async |sse_client_connections| {
                let event_stream = user_connected(sse_client_connections).await;
                warp::sse::reply(warp::sse::keep_alive().stream(event_stream))
            }))
        .with(log);

    let mgmt_routes = warp::path("mgmt")
        .and(ws_client_connections_filter2)
        .and_then(handle_mgmt_request)
        .with(log);

    let client_server = warp::serve(client_routes).run(([127, 0, 0, 1], 3030));
    let mgmt_server = warp::serve(mgmt_routes).run(([127, 0, 0, 1], 3031));

    future::join(client_server, mgmt_server).await;

    tokio::select! {
        _ = signal::ctrl_c() => {}
        _ = sig_hup.recv() => {}
        _ = sig_term.recv() => {}
        _ = sig_int.recv() => {}
    }
}

async fn user_connected(users: WSClientConnections) {
    // Use a counter to assign a new unique ID for this user.
    let my_id = NEXT_CONNECTION_ID.fetch_add(1, Ordering::Relaxed);

    // Use an unbounded channel to handle buffering and flushing of messages
    // to the event source...
    let (tx, rx) = mpsc::unbounded_channel();
    let rx = UnboundedReceiverStream::new(rx);

    // tx.send(Message::UserId(my_id))
    //     // rx is right above, so this cannot fail
    //     .unwrap();

    // Save the sender in our list of connected users.
    users.write().await.insert(my_id, tx);

    // Convert messages into Server-Sent Events and return resulting stream.
    rx.map(|msg| -> Result<Event, _> {
        match msg {
            _ => Ok(Event::default().data("hello")),
        }
    })
}

async fn on_connect(websocket: WebSocket, ws_client_connections: WSClientConnections) {
    let connection_id = NEXT_CONNECTION_ID.fetch_add(1, Ordering::Relaxed);

    let (mut ws_responder, mut ws_requester) = websocket.split();
    let (chan_responder, chan_requester) = mpsc::unbounded_channel();
    let mut chan_requester_stream = UnboundedReceiverStream::from(chan_requester);

    // When we get a message over the channel, send it out the ws responder
    tokio::task::spawn(async move {
        while let Some(message) = chan_requester_stream.next().await {
            ws_responder
                .send(message)
                .unwrap_or_else(|e| {
                    eprintln!("websocket send error: {}", e);
                })
                .await;
        }
    });

    ws_client_connections
        .write()
        .await
        .insert(connection_id, chan_responder);

    // When we get a message over the websocket, process it
    while let Some(result) = ws_requester.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("websocket error: {}", e);
                break;
            }
        };
        handle_connection_request(connection_id, msg, &ws_client_connections).await;
    }
}

// FIXME: Rename
async fn handle_connection_request(
    connection_id: usize,
    msg: Message,
    ws_client_connections: &WSClientConnections,
) {
    // FIXME: don't just echo -- handle the subscription
    // Skip any non-Text messages...
    let msg = if let Ok(s) = msg.to_str() {
        s
    } else {
        return;
    };

    let new_msg = format!("#{}: {}", connection_id, msg);

    // New message from this user, send it to everyone else (except same uid)...
    for (&id, chan_responder) in ws_client_connections.read().await.iter() {
        if connection_id == id {
            if let Err(_disconnected) = chan_responder.send(Message::text(new_msg.clone())) {
                // The tx is disconnected, our `user_disconnected` code
                // should be happening in another task, nothing more to
                // do here.
            }
        }
    }
}

// FIXME: make this take a connection id
async fn handle_mgmt_request(
    ws_client_connections: WSClientConnections,
) -> Result<Box<dyn warp::Reply>, warp::Rejection> {
    // New message from this user, send it to everyone else (except same uid)...
    for (&id, chan_responder) in ws_client_connections.read().await.iter() {
        let new_msg = format!("mgmt: hello, #{}", id);
        if let Err(_disconnected) = chan_responder.send(Message::text(new_msg.clone())) {
            // The tx is disconnected, our `user_disconnected` code
            // should be happening in another task, nothing more to
            // do here.
        }
    }
    Ok(Box::new("Hello, World!"))
}

// LATER:
// TODO: handle shutdown by flushing and disconnecting
// TODO: handle health for cluster management

// (user) -(ws)-> [ event-gateway/public 3030 ] -(https)-> [ DynamoDb/ws-connections  | subscriptions ]
// [ DynamoDB/flags :: OnChange Stream ] -(http-api)-> [ Lambda/process DynamoDB ] -> (https) -> [ event-gateway/management 3031 ] -(ws)-> (user)
