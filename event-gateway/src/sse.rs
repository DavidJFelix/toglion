use axum::{
    response::sse::{Event, Sse},
    Extension,
};
use futures::stream::Stream;
use std::{convert::Infallible, time::Duration};
use tokio::sync::mpsc;
use tokio_stream::{wrappers::UnboundedReceiverStream, StreamExt};
use tracing::{event, Level};

use crate::app::{Connection, ConnectionState, SSEConnectionState, ULIDGenerator};

pub async fn sse_handler(
    Extension(ulid_generator): Extension<ULIDGenerator>,
    Extension(connection_state): Extension<ConnectionState>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let connection_id = ulid_generator.lock().await.generate().unwrap();
    event!(Level::DEBUG, "sse, ulid = {}", connection_id.to_string());

    let (chan_responder, chan_requester) = mpsc::unbounded_channel();
    let chan_requester_stream = UnboundedReceiverStream::from(chan_requester);

    connection_state.write().await.insert(
        connection_id,
        Connection::SSE(SSEConnectionState {
            resp_channel: chan_responder,
        }),
    );

    let stream = chan_requester_stream.map(|msg| Ok(msg));

    Sse::new(stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("ping"),
    )
}

#[cfg(test)]
mod test {}
