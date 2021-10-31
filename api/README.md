# Toglion API

The Toglion API handles both endpoints for both the internal web application and external web applications consuming Toglion feature flags.
Generally, external applications consume unauthenticated endpoints that pass client id as plaintext, however, external applications could potentially automate changing feature flag values if desired.

## API Design

The primary API is a GraphQL HTTP API that uses both a POST url for query/mutation and a websocket for query/mutation/subscription.

**Note: ** An additional RPC API may be added in the future for realtime serverside integrations.

## Operational Concerns

Operators of the API may want to keep an eye on a number of different limits and metrics for operation.
The infrastructure folder has attempted to make some of these concerns codified into observations, metrics and autoscaling groups, however, some of them are hard limits which cannot automatically be accounted for.

### Lambda

AWS Lambda is the primary service layer for Toglion.
Lambda recieves events from DynamoDB and API Gateway (both REST and WebSockets)

#### Quotas

- Concurrent executions
- Elastic Network Interfaces

#### Metrics

- Account Concurrent Executions
- Unreserved concurrent Executions
- Per Lambda:
  - Run Duration
  - Error Rate
