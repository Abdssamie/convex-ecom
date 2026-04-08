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

const addressRole = v.union(v.literal("shipping"), v.literal("billing"));

const promotionType = v.union(v.literal("standard"), v.literal("buyget"));

const promotionStatus = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("inactive"),
);

const applicationMethodType = v.union(
  v.literal("fixed"),
  v.literal("percentage"),
);

const applicationMethodTargetType = v.union(
  v.literal("order"),
  v.literal("shipping_methods"),
  v.literal("items"),
);

const applicationMethodAllocation = v.union(
  v.literal("each"),
  v.literal("across"),
  v.literal("once"),
);

const promotionRuleOperator = v.union(
  v.literal("gte"),
  v.literal("lte"),
  v.literal("gt"),
  v.literal("lt"),
  v.literal("eq"),
  v.literal("ne"),
  v.literal("in"),
);

const priceListStatus = v.union(v.literal("active"), v.literal("draft"));

const priceListType = v.union(v.literal("sale"), v.literal("override"));

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

  priceLists: defineTable({
    title: v.string(),
    description: v.string(),
    status: priceListStatus,
    type: priceListType,
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    rulesCount: v.optional(v.number()),
    metadata: v.optional(v.any()),
  })
    .index("by_status", ["status"])
    .index("by_status_and_starts_at_and_ends_at", [
      "status",
      "startsAt",
      "endsAt",
    ]),

  priceListRules: defineTable({
    priceListId: v.id("priceLists"),
    attribute: v.string(),
    value: v.optional(v.any()),
  })
    .index("by_price_list_id", ["priceListId"])
    .index("by_attribute", ["attribute"]),

  prices: defineTable({
    variantId: v.id("variants"),
    title: v.optional(v.string()),
    currencyCode: v.string(),
    /** Amount in the smallest currency unit (e.g. cents). */
    amount: v.number(),
    minQuantity: v.optional(v.number()),
    maxQuantity: v.optional(v.number()),
    /**
     * `null` = base catalog price; otherwise scoped to a price list.
     * Use index `by_variant_currency_and_price_list_id` for deterministic lookups.
     */
    priceListId: v.union(v.null(), v.id("priceLists")),
  })
    .index("by_variant", ["variantId"])
    .index("by_variant_and_price_list_id", ["variantId", "priceListId"])
    .index("by_variant_and_currency_code", ["variantId", "currencyCode"])
    .index("by_variant_currency_and_price_list_id", [
      "variantId",
      "currencyCode",
      "priceListId",
    ])
    .index("by_price_list_id", ["priceListId"]),

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
    .index("by_location_id", ["locationId"])
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

  regions: defineTable({
    name: v.string(),
    currencyCode: v.string(),
    automaticTaxes: v.boolean(),
    metadata: v.optional(v.any()),
  })
    .index("by_currency_code", ["currencyCode"])
    .index("by_name", ["name"]),

  regionCountries: defineTable({
    regionId: v.id("regions"),
    /** ISO 3166-1 alpha-2 */
    countryCode: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_region_and_country_code", ["regionId", "countryCode"])
    .index("by_region", ["regionId"])
    .index("by_country_code", ["countryCode"]),

  salesChannels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    isDisabled: v.boolean(),
    metadata: v.optional(v.any()),
  })
    .index("by_name", ["name"])
    .index("by_is_disabled", ["isDisabled"]),

  /**
   * Tax jurisdiction (country / province), optionally nested under a parent region.
   */
  taxRegions: defineTable({
    /** ISO 3166-1 alpha-2 */
    countryCode: v.string(),
    provinceCode: v.optional(v.string()),
    parentTaxRegionId: v.optional(v.id("taxRegions")),
    /** External tax provider id when applicable. */
    providerId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_country_code", ["countryCode"])
    .index("by_country_code_and_province_code", ["countryCode", "provinceCode"])
    .index("by_parent_tax_region_id", ["parentTaxRegionId"]),

  taxRates: defineTable({
    taxRegionId: v.id("taxRegions"),
    /** Percentage rate (e.g. 20 for 20%); null or omitted for rule-only behavior. */
    rate: v.optional(v.union(v.null(), v.number())),
    code: v.string(),
    name: v.string(),
    isDefault: v.boolean(),
    isCombinable: v.boolean(),
    metadata: v.optional(v.any()),
  })
    .index("by_tax_region_id", ["taxRegionId"])
    .index("by_tax_region_id_and_code", ["taxRegionId", "code"]),

  promotionCampaigns: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_name", ["name"]),

  promotions: defineTable({
    code: v.string(),
    isAutomatic: v.boolean(),
    isTaxInclusive: v.boolean(),
    limit: v.optional(v.number()),
    used: v.number(),
    type: promotionType,
    status: promotionStatus,
    campaignId: v.optional(v.id("promotionCampaigns")),
    metadata: v.optional(v.any()),
  })
    .index("by_code", ["code"])
    .index("by_status", ["status"])
    .index("by_is_automatic", ["isAutomatic"])
    .index("by_campaign_id", ["campaignId"]),

  promotionApplicationMethods: defineTable({
    promotionId: v.id("promotions"),
    type: applicationMethodType,
    targetType: applicationMethodTargetType,
    allocation: applicationMethodAllocation,
    /** Fixed amount (smallest currency unit) or percentage points, per type. */
    value: v.number(),
    currencyCode: v.optional(v.string()),
    maxQuantity: v.optional(v.number()),
  }).index("by_promotion_id", ["promotionId"]),

  promotionConditions: defineTable({
    promotionId: v.id("promotions"),
    attribute: v.string(),
    operator: promotionRuleOperator,
    value: v.optional(v.any()),
  }).index("by_promotion_id", ["promotionId"]),

  carts: defineTable({
    customerId: v.optional(v.id("customers")),
    regionId: v.optional(v.id("regions")),
    salesChannelId: v.optional(v.id("salesChannels")),
    priceListId: v.optional(v.id("priceLists")),
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
    regionId: v.optional(v.id("regions")),
    salesChannelId: v.optional(v.id("salesChannels")),
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
    .index("by_cart", ["cartId"])
    .index("by_region_id", ["regionId"])
    .index("by_sales_channel_id", ["salesChannelId"]),

  /**
   * Snapshot addresses for an order (shipping / billing). Optional cartId supports
   * capturing addresses before the order row exists.
   */
  orderAddresses: defineTable({
    role: addressRole,
    orderId: v.optional(v.id("orders")),
    cartId: v.id("carts"),
    customerId: v.optional(v.id("customers")),
    company: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    address1: v.optional(v.string()),
    address2: v.optional(v.string()),
    city: v.optional(v.string()),
    /** ISO 3166-1 alpha-2 */
    countryCode: v.optional(v.string()),
    province: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_order_id", ["orderId"])
    .index("by_order_id_and_role", ["orderId", "role"])
    .index("by_cart_id", ["cartId"])
    .index("by_customer_id", ["customerId"]),

  /**
   * Order line snapshot (Medusa OrderItem + line detail); separate from cartItems.
   */
  orderItems: defineTable({
    orderId: v.id("orders"),
    version: v.number(),
    variantId: v.id("variants"),
    quantity: v.number(),
    unitPrice: v.number(),
    compareAtUnitPrice: v.optional(v.number()),
    fulfilledQuantity: v.number(),
    deliveredQuantity: v.number(),
    shippedQuantity: v.number(),
    returnRequestedQuantity: v.number(),
    returnReceivedQuantity: v.number(),
    returnDismissedQuantity: v.number(),
    writtenOffQuantity: v.number(),
    productId: v.optional(v.id("products")),
    title: v.optional(v.string()),
    variantTitle: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    variantSku: v.optional(v.string()),
    requiresShipping: v.optional(v.boolean()),
    isTaxInclusive: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  })
    .index("by_order_id", ["orderId"])
    .index("by_order_id_and_version", ["orderId", "version"])
    .index("by_variant_id", ["variantId"]),

  orderShippingMethods: defineTable({
    orderId: v.id("orders"),
    name: v.string(),
    /** Amount in the smallest currency unit (e.g. cents). */
    amount: v.number(),
    isTaxInclusive: v.boolean(),
    isCustomAmount: v.boolean(),
    shippingOptionId: v.optional(v.string()),
    data: v.optional(v.any()),
    metadata: v.optional(v.any()),
  })
    .index("by_order_id", ["orderId"])
    .index("by_shipping_option_id", ["shippingOptionId"]),

  fulfillments: defineTable({
    orderId: v.id("orders"),
    orderShippingMethodId: v.optional(v.id("orderShippingMethods")),
    locationId: v.id("locations"),
    packedAt: v.optional(v.number()),
    shippedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    markedShippedBy: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    requiresShipping: v.boolean(),
    fulfillmentProviderId: v.optional(v.string()),
    shippingOptionId: v.optional(v.string()),
    data: v.optional(v.any()),
    metadata: v.optional(v.any()),
  })
    .index("by_order_id", ["orderId"])
    .index("by_location_id", ["locationId"]),

  fulfillmentItems: defineTable({
    fulfillmentId: v.id("fulfillments"),
    orderItemId: v.id("orderItems"),
    quantity: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_fulfillment_id", ["fulfillmentId"])
    .index("by_order_item_id", ["orderItemId"]),

  fulfillmentLabels: defineTable({
    fulfillmentId: v.id("fulfillments"),
    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    labelUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_fulfillment_id", ["fulfillmentId"]),

  fulfillmentAddresses: defineTable({
    fulfillmentId: v.id("fulfillments"),
    company: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    address1: v.optional(v.string()),
    address2: v.optional(v.string()),
    city: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    province: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_fulfillment_id", ["fulfillmentId"]),

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

  refundReasons: defineTable({
    code: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_code", ["code"]),

  refunds: defineTable({
    paymentId: v.id("payments"),
    /** Amount in the smallest currency unit (e.g. cents). */
    amount: v.number(),
    refundReasonId: v.optional(v.id("refundReasons")),
    note: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_payment_id", ["paymentId"]),
});
