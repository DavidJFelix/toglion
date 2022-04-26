use axum::{
    response::sse::{Event, KeepAlive, Sse},
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

    let (chan_sender, chan_receiver) = mpsc::unbounded_channel();
    let chan_receiver_stream = UnboundedReceiverStream::from(chan_receiver);

    connection_state.write().await.insert(
        connection_id,
        Connection::SSE(SSEConnectionState {
            resp_channel: chan_sender,
        }),
    );

    let stream = chan_receiver_stream.map(|msg| Ok(msg));

    Sse::new(stream).keep_alive(
        KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("ping"),
    )
}

#[cfg(test)]
mod test {}
