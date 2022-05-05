FROM rust:1.60 as build-cache

WORKDIR /opt
COPY ./Cargo.toml ./Cargo.toml ./
COPY ./src ./src

CMD [ "cargo", "build" ]

FROM gcr.io/distroless/cc as production