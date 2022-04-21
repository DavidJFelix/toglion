use std::{collections::HashMap, sync::Arc};

use axum::{extract::ws::Message, response::sse::Event};
use tokio::sync::{mpsc, Mutex, RwLock};
use ulid::Ulid;

pub type ULIDGenerator = Arc<Mutex<ulid::Generator>>;
pub type ConnectionState = Arc<RwLock<HashMap<Ulid, Connection>>>;

pub enum Connection {
    WebSocket(WSConnectionState),
    SSE(SSEConnectionState),
}

pub struct WSConnectionState {
    pub resp_channel: mpsc::UnboundedSender<Message>,
}

pub struct SSEConnectionState {
    pub resp_channel: mpsc::UnboundedSender<Event>,
}
