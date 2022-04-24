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
use tracing::{event, Level};
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
    event!(Level::DEBUG, "websocket, ulid = {}", ulid.to_string());
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
    match msg {
        Message::Text(_) => {
            event!(Level::DEBUG, "client sent str");
            let msg_str = if let Ok(s) = msg.to_text() {
                s
            } else {
                return;
            };
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
        Message::Binary(_) => {
            event!(Level::DEBUG, "client sent binary data");
        }
        Message::Ping(_) => {
            event!(Level::DEBUG, "socket ping");
        }
        Message::Pong(_) => {
            event!(Level::DEBUG, "socket pong");
        }
        Message::Close(_) => {
            event!(Level::DEBUG, "client disconnected");
        }
    }
}

#[cfg(test)]
mod test {}
