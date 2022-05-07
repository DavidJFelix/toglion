FROM rust:1.60 as dependency-cache

ARG CARGO_CHEF_VERSION=0.1.35

WORKDIR /opt

# Create a blank project to allow for fetch
RUN cargo init

# Copy the dependencies over to build them
COPY ./Cargo.toml ./Cargo.lock ./

RUN cargo fetch

FROM dependency-cache as release-build

# Combine with our source
COPY . .
RUN cargo build --release

FROM gcr.io/distroless/cc as production

WORKDIR /opt
COPY --from=release-build /opt/target/release/event-gateway ./

CMD ["/opt/event-gateway"]
