mod settings;
// use settings::Settings;

use axum::{
    routing::{get, post},
    Extension, Router,
};
use futures::future;
use std::net::SocketAddr;
use tower_http::trace::{DefaultMakeSpan, TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod app;
mod management;
mod sse;
mod websocket;

#[tokio::main]
async fn main() -> Result<(), &'static str> {
    let connection_state = app::ConnectionState::default();
    let ulid_generator = app::ULIDGenerator::default();
    let aws_config = aws_config::load_from_env().await;
    let db_client = aws_sdk_dynamodb::Client::new(&aws_config);
    // let server_config = Settings::new().unwrap();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "example_websockets=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // build our application with some routes
    let ulid_generator1 = ulid_generator.clone();
    let connection_state1 = connection_state.clone();
    let db_client1 = db_client.clone();
    // let server_config1 = server_config.clone();
    let client_app = Router::new()
        .route("/ws", get(websocket::ws_handler))
        .route("/sse", get(sse::sse_handler))
        .layer(Extension(ulid_generator1))
        .layer(Extension(connection_state1))
        .layer(Extension(db_client1))
        // .layer(Extension(server_config1))
        // logging so we can see whats going on
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        );

    let connection_state2 = connection_state.clone();
    let db_client2 = db_client.clone();
    let mgmt_app = Router::new()
        .route("/notify-connection", post(management::notify_connection))
        .layer(Extension(connection_state2))
        .layer(Extension(db_client2))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        );

    // run it with hyper
    let client_addr = SocketAddr::from(([0, 0, 0, 0], 3030));
    let mgmt_addr = SocketAddr::from(([0, 0, 0, 0], 3031));

    tracing::debug!("listening on {}", client_addr);
    tracing::debug!("listening on {}", mgmt_addr);

    let client_server = axum::Server::bind(&client_addr).serve(client_app.into_make_service());

    let mgmt_server = axum::Server::bind(&mgmt_addr).serve(mgmt_app.into_make_service());

    match future::try_join(client_server, mgmt_server).await {
        Err(_) => Result::Err("Broke"),
        _ => Result::Ok(()),
    }

    // let mut sig_hup = signal(SignalKind::hangup()).unwrap();
    // let mut sig_term = signal(SignalKind::terminate()).unwrap();
    // let mut sig_int = signal(SignalKind::interrupt()).unwrap();

    // tokio::select! {
    //     _ = signal::ctrl_c() => {}
    //     _ = sig_hup.recv() => {}
    //     _ = sig_term.recv() => {}
    //     _ = sig_int.recv() => {}
    // }
}
