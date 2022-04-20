use axum::{
    extract::{
        ws::{Message, WebSocket},
        WebSocketUpgrade,
    },
    response::IntoResponse,
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
            match msg {
                Message::Text(t) => {
                    println!("client sent str: {:?}", t);
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
        }
    }
}

#[cfg(test)]
mod test {}
