use axum::{
    extract::ws::Message,
    http::StatusCode,
    response::{sse::Event, IntoResponse},
    Extension, Json,
};
use serde::Deserialize;
use ulid::Ulid;

use crate::app::{Connection, ConnectionState};

#[derive(Deserialize)]
pub struct NotifyConnectionsRequest {
    connection_id: String,
    message: String,
}

pub async fn notify_connection(
    Json(request): Json<NotifyConnectionsRequest>,
    Extension(connection_state): Extension<ConnectionState>,
) -> impl IntoResponse {
    match Ulid::from_string(&request.connection_id) {
        Ok(connection_ulid) => {
            if let Some(connection) = connection_state.read().await.get(&connection_ulid) {
                match connection {
                    Connection::WebSocket(v) => {
                        // FIXME: don't unwrap
                        v.resp_channel
                            .send(Message::Text(request.message.clone()))
                            .unwrap();
                    }
                    Connection::SSE(v) => {
                        // FIXME: don't unwrap
                        v.resp_channel
                            .send(Event::default().data(request.message.clone()))
                            .unwrap();
                    }
                };
                StatusCode::OK
            } else {
                StatusCode::BAD_REQUEST
            }
        }
        _ => StatusCode::BAD_REQUEST,
    }
}
