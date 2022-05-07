### DEPENDENCY CACHE ###
# Fetch dependencies and cache them locally
FROM rust:1.60 as dependency-cache

WORKDIR /opt

# Create a blank project to allow for fetch
RUN cargo init

# Copy the dependencies over to build them
COPY ./Cargo.toml ./Cargo.lock ./

RUN cargo fetch --locked

### DEV ###
# Rely on a volume mount and run the container in dev mode
FROM dependency-cache as dev

EXPOSE 3030
EXPOSE 3031

RUN cargo install cargo-watch
CMD ["cargo", "watch", "-x", "run"]


### RELEASE BUILD ###
# Build for distribution (sans debug symbols)
FROM dependency-cache as release-build

# Combine with our source
COPY . .
RUN cargo build --release

FROM gcr.io/distroless/cc as production

WORKDIR /opt
COPY --from=release-build /opt/target/release/event-gateway ./

CMD ["/opt/event-gateway"]
