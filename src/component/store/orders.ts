import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireDoc } from "../shared/guards";
import { orderStatusValidator } from "../shared/validators";

const orderValidator = schema.tables.orders.validator.extend({
  _id: v.id("orders"),
  _creationTime: v.number(),
});

const orderItemValidator = schema.tables.orderItems.validator.extend({
  _id: v.id("orderItems"),
  _creationTime: v.number(),
});

const orderAddressValidator = schema.tables.orderAddresses.validator.extend({
  _id: v.id("orderAddresses"),
  _creationTime: v.number(),
});

const orderShippingMethodValidator =
  schema.tables.orderShippingMethods.validator.extend({
    _id: v.id("orderShippingMethods"),
    _creationTime: v.number(),
  });

export const createOrderFromCart = mutation({
  args: {
    cartId: v.id("carts"),
    status: v.optional(orderStatusValidator),
  },
  returns: v.id("orders"),
  handler: async (ctx, args) => {
    const cart = await ctx.db.get("carts", args.cartId);
    if (!cart || cart.completedAt !== undefined) {
      throw new Error("Cart not found or already completed");
    }
    if (!cart.email) {
      throw new Error("Cart email is required to create an order");
    }
    if (cart.customerId) {
      await requireDoc(ctx, "customers", cart.customerId, "Customer not found");
    }
    if (cart.regionId) {
      await requireDoc(ctx, "regions", cart.regionId, "Region not found");
    }
    if (cart.salesChannelId) {
      await requireDoc(
        ctx,
        "salesChannels",
        cart.salesChannelId,
        "Sales channel not found",
      );
    }

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", args.cartId))
      .collect();

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    const orderId = await ctx.db.insert("orders", {
      customerId: cart.customerId,
      cartId: cart._id,
      regionId: cart.regionId,
      salesChannelId: cart.salesChannelId,
      email: cart.email,
      currencyCode: cart.currencyCode,
      locale: cart.locale,
      status: args.status ?? "pending",
      paymentStatus: "not_paid",
      total: cart.total,
      metadata: cart.metadata,
    });

    await Promise.all(
      items.map((item) =>
        ctx.db.insert("orderItems", {
          orderId,
          version: 1,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          compareAtUnitPrice: undefined,
          fulfilledQuantity: 0,
          deliveredQuantity: 0,
          shippedQuantity: 0,
          returnRequestedQuantity: 0,
          returnReceivedQuantity: 0,
          returnDismissedQuantity: 0,
          writtenOffQuantity: 0,
          productId: item.productId,
          title: item.title,
          variantTitle: item.variantTitle,
          thumbnail: item.thumbnail,
          variantSku: item.variantSku,
          requiresShipping: item.requiresShipping,
          isTaxInclusive: item.isTaxInclusive,
          metadata: item.metadata,
        }),
      ),
    );

    const orderAddresses = await ctx.db
      .query("orderAddresses")
      .withIndex("by_cart_id", (q) => q.eq("cartId", args.cartId))
      .collect();

    if (orderAddresses.length === 0) {
      throw new Error("Order addresses are required to create an order");
    }

    await Promise.all(
      orderAddresses.map((address) =>
        address.orderId === undefined
          ? ctx.db.patch(address._id, { orderId })
          : Promise.resolve(),
      ),
    );

    await ctx.db.insert("orderShippingMethods", {
      orderId,
      name: "Shipping",
      amount: cart.shippingTotal,
      isTaxInclusive: false,
      isCustomAmount: true,
      shippingOptionId: undefined,
      data: undefined,
      metadata: undefined,
    });

    await ctx.db.patch(args.cartId, { completedAt: Date.now() });

    return orderId;
  },
});

export const getOrder = query({
  args: {
    orderId: v.id("orders"),
  },
  returns: v.union(
    v.null(),
    v.object({
      order: orderValidator,
      items: v.array(orderItemValidator),
      addresses: v.array(orderAddressValidator),
      shippingMethods: v.array(orderShippingMethodValidator),
    }),
  ),
  handler: async (ctx, args) => {
    const order = await ctx.db.get("orders", args.orderId);
    if (!order) {
      return null;
    }

    const [items, addresses, shippingMethods] = await Promise.all([
      ctx.db
        .query("orderItems")
        .withIndex("by_order_id", (q) => q.eq("orderId", args.orderId))
        .collect(),
      ctx.db
        .query("orderAddresses")
        .withIndex("by_order_id", (q) => q.eq("orderId", args.orderId))
        .collect(),
      ctx.db
        .query("orderShippingMethods")
        .withIndex("by_order_id", (q) => q.eq("orderId", args.orderId))
        .collect(),
    ]);

    return { order, items, addresses, shippingMethods };
  },
});

export const listOrdersByCustomer = query({
  args: {
    customerId: v.id("customers"),
    limit: v.optional(v.number()),
  },
  returns: v.array(orderValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .take(args.limit ?? 50);
  },
});

export const setOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: orderStatusValidator,
  },
  handler: async (ctx, args) => {
    await requireDoc(ctx, "orders", args.orderId, "Order not found");
    const patch =
      args.status === "canceled"
        ? { status: args.status, canceledAt: Date.now() }
        : { status: args.status };
    await ctx.db.patch(args.orderId, patch);
  },
});

export const seedPriceListScenario = mutation({
  args: {
    currencyCode: v.string(),
    baseAmount: v.number(),
    listAmount: v.number(),
  },
  returns: v.object({
    productId: v.id("products"),
    variantId: v.id("variants"),
    priceListId: v.id("priceLists"),
  }),
  handler: async (ctx, args) => {
    const productId = await ctx.db.insert("products", {
      title: "Seed Product",
      handle: "seed-product",
      status: "published",
      isGiftcard: false,
      discountable: true,
    });
    const variantId = await ctx.db.insert("variants", {
      productId,
      title: "Default",
      allowBackorder: false,
      manageInventory: false,
      variantRank: 0,
    });
    await ctx.db.insert("prices", {
      variantId,
      currencyCode: args.currencyCode,
      amount: args.baseAmount,
      priceListId: null,
    });
    const priceListId = await ctx.db.insert("priceLists", {
      title: "Seed List",
      description: "Seed list",
      status: "active",
      type: "override",
    });
    await ctx.db.insert("prices", {
      variantId,
      currencyCode: args.currencyCode,
      amount: args.listAmount,
      priceListId,
    });

    return { productId, variantId, priceListId };
  },
});
