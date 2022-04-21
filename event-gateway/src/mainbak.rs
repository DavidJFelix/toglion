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
