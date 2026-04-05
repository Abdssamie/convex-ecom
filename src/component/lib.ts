import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server.js";
import type { Doc, Id } from "./_generated/dataModel.js";
import schema from "./schema.js";

const productValidator = schema.tables.products.validator.extend({
  _id: v.id("products"),
  _creationTime: v.number(),
});

const cartValidator = schema.tables.carts.validator.extend({
  _id: v.id("carts"),
  _creationTime: v.number(),
});

const cartItemValidator = schema.tables.cartItems.validator.extend({
  _id: v.id("cartItems"),
  _creationTime: v.number(),
});

const variantValidator = schema.tables.variants.validator.extend({
  _id: v.id("variants"),
  _creationTime: v.number(),
});

const priceValidator = schema.tables.prices.validator.extend({
  _id: v.id("prices"),
  _creationTime: v.number(),
});

const addressRole = v.union(v.literal("shipping"), v.literal("billing"));

const variantWithPriceValidator = variantValidator.extend({
  price: v.optional(priceValidator),
});

async function getBasePriceForVariant(
  ctx: QueryCtx | MutationCtx,
  variantId: Id<"variants">,
  currencyCode: string,
  priceListId?: Id<"priceLists">,
): Promise<Doc<"prices"> | null> {
  if (priceListId) {
    const listPrice = await ctx.db
      .query("prices")
      .withIndex("by_variant_currency_and_price_list_id", (q) =>
        q
          .eq("variantId", variantId)
          .eq("currencyCode", currencyCode)
          .eq("priceListId", priceListId),
      )
      .first();
    if (listPrice) {
      return listPrice;
    }
  }

  return await ctx.db
    .query("prices")
    .withIndex("by_variant_currency_and_price_list_id", (q) =>
      q
        .eq("variantId", variantId)
        .eq("currencyCode", currencyCode)
        .eq("priceListId", null),
    )
    .first();
}

export const listProducts = query({
  args: {
    currencyCode: v.string(),
    limit: v.optional(v.number()),
    priceListId: v.optional(v.id("priceLists")),
  },
  returns: v.array(
    v.object({
      product: productValidator,
      variants: v.array(variantWithPriceValidator),
    }),
  ),
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(args.limit ?? 50);

    return await Promise.all(
      products.map(async (product) => {
        const variants = await ctx.db
          .query("variants")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .collect();
        const variantsWithPrice = await Promise.all(
          variants.map(async (variant) => {
            const price = await getBasePriceForVariant(
              ctx,
              variant._id,
              args.currencyCode,
              args.priceListId,
            );
            return { ...variant, price: price ?? undefined };
          }),
        );
        return { product, variants: variantsWithPrice };
      }),
    );
  },
});

export const getCart = query({
  args: {
    cartId: v.id("carts"),
  },
  returns: v.union(
    v.null(),
    v.object({
      cart: cartValidator,
      items: v.array(cartItemValidator),
    }),
  ),
  handler: async (ctx, args) => {
    const cart = await ctx.db.get("carts", args.cartId);
    if (!cart) {
      return null;
    }
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", args.cartId))
      .collect();
    return { cart, items };
  },
});

export const createCart = mutation({
  args: {
    currencyCode: v.string(),
    priceListId: v.optional(v.id("priceLists")),
  },
  returns: v.id("carts"),
  handler: async (ctx, args) => {
    const cartId = await ctx.db.insert("carts", {
      currencyCode: args.currencyCode,
      priceListId: args.priceListId,
      subtotal: 0,
      shippingTotal: 0,
      total: 0,
    });
    return cartId;
  },
});

export const addItem = mutation({
  args: {
    cartId: v.id("carts"),
    variantId: v.id("variants"),
    quantity: v.number(),
  },
  returns: v.id("cartItems"),
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const cart = await ctx.db.get("carts", args.cartId);
    if (!cart || cart.completedAt !== undefined) {
      throw new Error("Cart not found or already completed");
    }

    const price = await getBasePriceForVariant(
      ctx,
      args.variantId,
      cart.currencyCode,
      cart.priceListId,
    );

    if (!price) {
      throw new Error("No price for variant in cart currency");
    }

    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_cart_and_variant", (q) =>
        q.eq("cartId", args.cartId).eq("variantId", args.variantId),
      )
      .first();

    const unitPrice = price.amount;
    let cartItemId: Id<"cartItems">;
    if (existing !== null) {
      const quantity = existing.quantity + args.quantity;
      const total = unitPrice * quantity;
      await ctx.db.patch(existing._id, { quantity, unitPrice, total });
      cartItemId = existing._id;
    } else {
      cartItemId = await ctx.db.insert("cartItems", {
        cartId: args.cartId,
        variantId: args.variantId,
        quantity: args.quantity,
        unitPrice,
        total: unitPrice * args.quantity,
      });
    }

    await recalcCartTotals(ctx, args.cartId);
    return cartItemId;
  },
});

export const updateItem = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get("cartItems", args.cartItemId);
    if (!item) {
      throw new Error("Cart item not found");
    }

    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
      await recalcCartTotals(ctx, item.cartId);
      return;
    }

    const total = item.unitPrice * args.quantity;
    await ctx.db.patch(args.cartItemId, {
      quantity: args.quantity,
      total,
    });
    await recalcCartTotals(ctx, item.cartId);
  },
});

export const removeItem = mutation({
  args: {
    cartItemId: v.id("cartItems"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get("cartItems", args.cartItemId);
    if (!item) {
      return;
    }
    await ctx.db.delete(args.cartItemId);
    await recalcCartTotals(ctx, item.cartId);
  },
});

export const setCustomer = mutation({
  args: {
    cartId: v.id("carts"),
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db.get("carts", args.cartId);
    if (!cart || cart.completedAt !== undefined) {
      throw new Error("Cart not found or already completed");
    }
    await ctx.db.patch(args.cartId, { customerId: args.customerId });
  },
});

export const recalcCart = internalMutation({
  args: {
    cartId: v.id("carts"),
  },
  handler: async (ctx, args) => {
    await recalcCartTotals(ctx, args.cartId);
  },
});

export const seedPriceListScenario = internalMutation({
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

export const createOrderAddress = mutation({
  args: {
    role: addressRole,
    cartId: v.id("carts"),
    orderId: v.optional(v.id("orders")),
    customerId: v.optional(v.id("customers")),
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
  },
  returns: v.id("orderAddresses"),
  handler: async (ctx, args) => {
    if (!args.cartId && !args.orderId && !args.customerId) {
      throw new Error(
        "Order address must be linked to a cart, order, or customer",
      );
    }

    return await ctx.db.insert("orderAddresses", {
      role: args.role,
      cartId: args.cartId,
      orderId: args.orderId,
      customerId: args.customerId,
      company: args.company,
      firstName: args.firstName,
      lastName: args.lastName,
      address1: args.address1,
      address2: args.address2,
      city: args.city,
      countryCode: args.countryCode,
      province: args.province,
      postalCode: args.postalCode,
      phone: args.phone,
      metadata: args.metadata,
    });
  },
});

async function recalcCartTotals(ctx: MutationCtx, cartId: Id<"carts">) {
  const cart = await ctx.db.get("carts", cartId);
  if (!cart) {
    return;
  }
  const items = await ctx.db
    .query("cartItems")
    .withIndex("by_cart", (q) => q.eq("cartId", cartId))
    .collect();
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + cart.shippingTotal;
  await ctx.db.patch(cartId, { subtotal, total });
}
