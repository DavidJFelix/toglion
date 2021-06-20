# TogLion

A thing for feature flags management.

## What are we building?

Websocket chatroom that handles feature flag updates. Listens for updates and
re-renders anything in its tree if it gets an update.

## Packages

- `api`: receives the website updates and passes them on to clients
- `client`: library for consuming feature flags
- `dashboard`: hosted dashboard which allows you to sign in and toggle feature
  flags
- `types`: common types shared between other packages

## Tooling

- Monorepo
  - Yarn Workspaces
  - `preconstruct` for building library
  - `@manypkg/cli` for command runner
