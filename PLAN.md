# Convex Commerce Component Plan (MVP)

This document specifies an MVP Convex component for commerce: modular domains,
explicit state, and clear write paths while following Convex practices and
component authoring guidelines. It targets production use.

## Goals

- Provide a stable MVP for core commerce flows.
- Model cart, catalog, inventory, payment, and order as separate concerns.
- Use Stripe Payment Intents with deterministic state transitions and webhook
  reconciliation.
- Support multi-currency pricing and essential inventory management.

## Non-Goals (MVP)

- Tax calculation.
- Promotions/discounts.
- Advanced shipping rate engines or fulfillment integrations.
- Multi-warehouse allocation rules beyond a single default location.

## Guiding Principles (Convex Best Practices)

- **Separation of concerns**: queries read, mutations write, actions handle
  external APIs.
- **Deterministic writes**: mutations avoid nondeterministic logic.
- **Stable public API**: expose a minimal, versioned API surface via component
  exports.
- **Security at the edge**: enforce customer ownership in all read/write
  operations.
- **Schema-driven consistency**: explicit schema for every collection with
  strict types.

## Domain Boundaries

- **Cart**: purchase context (line items, customer link, currency, totals). An
  open cart has no `completedAt`; completion is recorded as a timestamp.
- **Catalog**: products, variants, and per-variant prices by `currencyCode`.
- **Inventory**: stock items and per-location levels (stocked, reserved,
  incoming).
- **Payments**: provider-scoped records with a payment-collection-style status
  lifecycle and optional intent metadata for Stripe.
- **Orders**: link to originating cart, order status, and payment status.

## MVP Scope

- Catalog: products and variants.
- Pricing: per-variant prices by currency code (minor units).
- Inventory: track levels and decrement on order placement (when implemented).
- Cart: create and update line items, compute totals.
- Checkout: PaymentIntent, confirm payment, finalize order (when implemented).

## Data Model (Convex Collections)

See `src/component/schema.ts` for the source of truth. At a high level:

- **products** — merchandising, handle, status, gift card and discount flags.
- **variants** — SKU, inventory flags, optional link to **inventoryItems**.
- **prices** — `variantId`, `currencyCode`, `amount`, optional quantity bands.
- **inventoryItems** / **inventoryLevels** / **locations** — stock context.
- **customers** — identity, contact fields, `hasAccount`.
- **carts** — `currencyCode`, `completedAt`, denormalized totals.
- **cartItems** — variant, quantity, line pricing; optional display snapshots.
- **orders** — status, `paymentStatus`, `currencyCode`, `canceledAt`.
- **payments** / **paymentAttempts** — provider and audit trail.

## State Machines (intended)

**Cart**

- Open until `completedAt` is set (checkout finished).

**Payment collection status** (on orders / payments)

- Values such as `not_paid` → `awaiting` → `authorized` / `completed` / `failed`
  / `canceled` (see schema union).

**Order**

- Values such as `pending`, `completed`, `draft`, `canceled`, etc. (see schema
  union).

## API Surface

**Queries**

- `listProducts(currencyCode)`
- `getProduct(handle, currencyCode)` (planned)
- `getCart(cartId)`
- `getOrder(orderId)` (planned)
- `listOrdersByCustomer()` (planned)

**Mutations**

- `createCart(currencyCode)`
- `addItem(cartId, variantId, quantity)`
- `updateItem(cartItemId, quantity)`
- `removeItem(cartItemId)`
- `setCustomer(cartId, customerId)`
- `setShipping(cartId, shippingMethodId?)` (planned)
- `recalculateCart(cartId)` (internal)

**Actions (server-only, planned)**

- `createOrUpdatePaymentIntent(cartId)`
- `stripeWebhookHandler(rawBody, signature)`
- `finalizeOrderFromPaymentIntent(paymentIntentId)`

## Stripe Payment Intents Flow

1. Create or reuse a PaymentIntent for the cart total with `metadata.cartId`.
2. Store `paymentIntentId` and `clientSecret` in `payments`.
3. Client confirms PaymentIntent.
4. Webhook validates signature and updates payment status.
5. On `payment_intent.succeeded`:
   - Verify cart still open.
   - Create order.
   - Adjust inventory.
   - Set cart `completedAt`.

## Inventory Strategy

- Validate availability at order finalization.
- Adjust stock on payment success only.
- Backorders only when the variant allows it.

## Multi-Currency Strategy

- Cart `currencyCode` is fixed at creation.
- Totals use currency-specific price rows.
- Store prices as integer minor units.

## Auth & Security

- Use Convex Auth for customer identity where applicable.
- Enforce ownership on cart and order reads/writes.
- Keep Stripe secret keys only in actions.

## Idempotency

- Not part of the MVP.

## Component Authoring Principles

- Component exports only public functions.
- Internal tables and helpers are not exposed.
- Versioned API surface; plan for migrations.
- Example app demonstrates the happy path only.

## Testing & Verification

- Happy path: cart → PaymentIntent → webhook → order.
- Payment failure path.
- Idempotent replay path.
- Inventory oversell prevention.
