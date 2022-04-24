use axum::{
    extract::{
        ws::{Message, WebSocket},
        WebSocketUpgrade,
    },
    response::{sse::Event, IntoResponse},
    Extension, TypedHeader,
};
use futures::{SinkExt, StreamExt, TryFutureExt};
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;
use ulid::Ulid;

use crate::app::{Connection, ConnectionState, ULIDGenerator, WSConnectionState};

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    user_agent: Option<TypedHeader<headers::UserAgent>>,
    Extension(ulid_generator): Extension<ULIDGenerator>,
    Extension(connection_state): Extension<ConnectionState>,
) -> impl IntoResponse {
    if let Some(TypedHeader(user_agent)) = user_agent {
        println!("`{}` connected", user_agent.as_str());
    }
    // TODO: i guess handle this?
    let ulid = ulid_generator.lock().await.generate().unwrap();

    ws.on_upgrade(move |socket| handle_socket(socket, ulid, connection_state))
}

async fn handle_socket(socket: WebSocket, connection_id: Ulid, connection_state: ConnectionState) {
    let (mut ws_responder, mut ws_requester) = socket.split();
    let (chan_responder, chan_requester) = mpsc::unbounded_channel();
    let mut chan_requester_stream = UnboundedReceiverStream::from(chan_requester);

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

    connection_state.write().await.insert(
        connection_id,
        Connection::WebSocket(WSConnectionState {
            resp_channel: chan_responder,
        }),
    );
    while let Some(msg) = ws_requester.next().await {
        if let Ok(msg) = msg {
            echo(connection_id, msg, &connection_state).await;
        }
    }
}

async fn echo(connection_id: Ulid, msg: Message, connection_state: &ConnectionState) {
    let msg_str = if let Ok(s) = msg.to_text() {
        s
    } else {
        return;
    };

    match msg {
        Message::Text(_) => {
            println!("client sent str");
        }
        Message::Binary(_) => {
            println!("client sent binary data");
        }
        Message::Ping(_) => {
            println!("socket ping");
        }
        Message::Pong(_) => {
            println!("socket pong");
        }
        Message::Close(_) => {
            println!("client disconnected");
            return;
        }
    }

    let new_msg = format!("#{}: {}", connection_id, msg_str);

    for (_, connection) in connection_state.read().await.iter() {
        match connection {
            Connection::WebSocket(v) => {
                // FIXME: don't unwrap
                v.resp_channel.send(Message::Text(new_msg.clone())).unwrap();
            }
            Connection::SSE(v) => {
                // FIXME: don't unwrap
                v.resp_channel
                    .send(Event::default().data(new_msg.clone()))
                    .unwrap();
            }
        };
    }
}

#[cfg(test)]
mod test {}
