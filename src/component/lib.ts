import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  type MutationCtx,
} from "./_generated/server.js";
import type { Id } from "./_generated/dataModel.js";
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

const variantWithPriceValidator = variantValidator.extend({
  price: v.optional(priceValidator),
});

export const listProducts = query({
  args: {
    currencyCode: v.string(),
    limit: v.optional(v.number()),
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
            const price = await ctx.db
              .query("prices")
              .withIndex("by_variant_and_currency_code", (q) =>
                q
                  .eq("variantId", variant._id)
                  .eq("currencyCode", args.currencyCode),
              )
              .first();
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
  },
  returns: v.id("carts"),
  handler: async (ctx, args) => {
    const cartId = await ctx.db.insert("carts", {
      currencyCode: args.currencyCode,
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

    const price = await ctx.db
      .query("prices")
      .withIndex("by_variant_and_currency_code", (q) =>
        q.eq("variantId", args.variantId).eq("currencyCode", cart.currencyCode),
      )
      .first();

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
