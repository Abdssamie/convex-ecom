import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const productStatus = v.union(
  v.literal("draft"),
  v.literal("proposed"),
  v.literal("published"),
  v.literal("rejected"),
);

const orderStatus = v.union(
  v.literal("pending"),
  v.literal("completed"),
  v.literal("draft"),
  v.literal("archived"),
  v.literal("canceled"),
  v.literal("requires_action"),
);

const paymentCollectionStatus = v.union(
  v.literal("not_paid"),
  v.literal("awaiting"),
  v.literal("authorized"),
  v.literal("partially_authorized"),
  v.literal("canceled"),
  v.literal("failed"),
  v.literal("partially_captured"),
  v.literal("completed"),
);

const attemptStatus = v.union(
  v.literal("created"),
  v.literal("failed"),
  v.literal("succeeded"),
);

export default defineSchema({
  products: defineTable({
    title: v.string(),
    handle: v.string(),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    status: productStatus,
    isGiftcard: v.boolean(),
    discountable: v.boolean(),
    externalId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_handle", ["handle"])
    .index("by_status", ["status"]),

  variants: defineTable({
    productId: v.id("products"),
    title: v.string(),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    allowBackorder: v.boolean(),
    manageInventory: v.boolean(),
    variantRank: v.number(),
    thumbnail: v.optional(v.string()),
    inventoryItemId: v.optional(v.id("inventoryItems")),
    metadata: v.optional(v.any()),
  })
    .index("by_product", ["productId"])
    .index("by_sku", ["sku"])
    .index("by_inventory_item", ["inventoryItemId"]),

  prices: defineTable({
    variantId: v.id("variants"),
    title: v.optional(v.string()),
    currencyCode: v.string(),
    /** Amount in the smallest currency unit (e.g. cents). */
    amount: v.number(),
    minQuantity: v.optional(v.number()),
    maxQuantity: v.optional(v.number()),
  })
    .index("by_variant", ["variantId"])
    .index("by_variant_and_currency_code", ["variantId", "currencyCode"]),

  inventoryItems: defineTable({
    sku: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    requiresShipping: v.boolean(),
    thumbnail: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_sku", ["sku"]),

  locations: defineTable({
    name: v.string(),
    /** Stable id from an external WMS, ERP, or OMS. */
    externalId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_name", ["name"])
    .index("by_external_id", ["externalId"]),

  inventoryLevels: defineTable({
    inventoryItemId: v.id("inventoryItems"),
    locationId: v.id("locations"),
    stockedQuantity: v.number(),
    reservedQuantity: v.number(),
    incomingQuantity: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_inventory_item_id", ["inventoryItemId"])
    .index("by_inventory_item_id_and_location_id", [
      "inventoryItemId",
      "locationId",
    ]),

  customers: defineTable({
    /** Auth provider subject or other stable customer identity key. */
    userId: v.string(),
    email: v.optional(v.string()),
    companyName: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    hasAccount: v.boolean(),
    metadata: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),

  carts: defineTable({
    customerId: v.optional(v.id("customers")),
    regionId: v.optional(v.string()),
    salesChannelId: v.optional(v.string()),
    email: v.optional(v.string()),
    currencyCode: v.string(),
    locale: v.optional(v.string()),
    /** Milliseconds since epoch when checkout finished; unset while the cart is open. */
    completedAt: v.optional(v.number()),
    subtotal: v.number(),
    shippingTotal: v.number(),
    total: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_customer", ["customerId"])
    .index("by_currency_code", ["currencyCode"]),

  /**
   * Optional display snapshot fields support richer checkout UIs; minimal flows
   * may only persist variant id and line totals until those fields are filled.
   */
  cartItems: defineTable({
    cartId: v.id("carts"),
    variantId: v.id("variants"),
    quantity: v.number(),
    unitPrice: v.number(),
    total: v.number(),
    productId: v.optional(v.id("products")),
    title: v.optional(v.string()),
    variantTitle: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    variantSku: v.optional(v.string()),
    requiresShipping: v.optional(v.boolean()),
    isTaxInclusive: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  })
    .index("by_cart", ["cartId"])
    .index("by_variant", ["variantId"])
    .index("by_cart_and_variant", ["cartId", "variantId"]),

  orders: defineTable({
    customerId: v.optional(v.id("customers")),
    cartId: v.id("carts"),
    regionId: v.optional(v.string()),
    salesChannelId: v.optional(v.string()),
    email: v.optional(v.string()),
    currencyCode: v.string(),
    locale: v.optional(v.string()),
    status: orderStatus,
    paymentStatus: paymentCollectionStatus,
    total: v.number(),
    canceledAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  })
    .index("by_customer", ["customerId"])
    .index("by_cart", ["cartId"]),

  payments: defineTable({
    cartId: v.id("carts"),
    orderId: v.optional(v.id("orders")),
    providerId: v.string(),
    status: paymentCollectionStatus,
    amount: v.number(),
    currencyCode: v.string(),
    paymentIntentId: v.optional(v.string()),
    clientSecret: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_cart", ["cartId"])
    .index("by_payment_intent", ["paymentIntentId"]),

  paymentAttempts: defineTable({
    paymentId: v.id("payments"),
    status: attemptStatus,
    error: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_payment", ["paymentId"]),
});
