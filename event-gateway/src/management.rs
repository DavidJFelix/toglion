use axum::{
    extract::ws::Message,
    response::{sse::Event, Html},
    Extension,
};

use crate::app::{Connection, ConnectionState};

pub async fn handle_mgmt(
    Extension(connection_state): Extension<ConnectionState>,
) -> Html<&'static str> {
    let new_msg = format!("#management: hello");

    for (_, connection) in connection_state.read().await.iter() {
        match connection {
            Connection::WebSocket(v) => {
                v.resp_channel.send(Message::Text(new_msg.clone()));
            }
            Connection::SSE(v) => {
                v.resp_channel.send(Event::default().data(new_msg.clone()));
            }
            _ => {}
        };
    }

    // FIXME: figure out how to return nothing here
    Html("<h1>Hello, World!</h1>")
}
