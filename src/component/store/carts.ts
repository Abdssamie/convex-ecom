import { v } from "convex/values";
import {
  query,
  mutation,
  internalQuery,
  type MutationCtx,
} from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import schema from "../schema";
import { requireDoc, requireIdentity } from "../shared/guards";
import { getBasePriceForVariant } from "./pricing";

const cartValidator = schema.tables.carts.validator.extend({
  _id: v.id("carts"),
  _creationTime: v.number(),
});

const cartItemValidator = schema.tables.cartItems.validator.extend({
  _id: v.id("cartItems"),
  _creationTime: v.number(),
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
    await requireIdentity(ctx);
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

export const getCartInternal = internalQuery({
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
    email: v.optional(v.string()),
  },
  returns: v.id("carts"),
  handler: async (ctx, args) => {
    if (args.priceListId) {
      const priceList = await requireDoc(
        ctx,
        "priceLists",
        args.priceListId,
        "Price list not found",
      );
      if (priceList.status !== "active") {
        throw new Error("Price list is not active");
      }
      const now = Date.now();
      if (priceList.startsAt !== undefined && now < priceList.startsAt) {
        throw new Error("Price list is not active yet");
      }
      if (priceList.endsAt !== undefined && now > priceList.endsAt) {
        throw new Error("Price list has expired");
      }
    }
    const cartId = await ctx.db.insert("carts", {
      currencyCode: args.currencyCode,
      priceListId: args.priceListId,
      email: args.email,
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
    await requireIdentity(ctx);
    if (args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const cart = await ctx.db.get("carts", args.cartId);
    if (!cart || cart.completedAt !== undefined) {
      throw new Error("Cart not found or already completed");
    }

    await requireDoc(ctx, "variants", args.variantId, "Variant not found");

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
    await requireIdentity(ctx);
    const item = await ctx.db.get("cartItems", args.cartItemId);
    if (!item) {
      throw new Error("Cart item not found");
    }

    const cart = await ctx.db.get("carts", item.cartId);
    if (!cart || cart.completedAt !== undefined) {
      throw new Error("Cart not found or already completed");
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
    await requireIdentity(ctx);
    const item = await ctx.db.get("cartItems", args.cartItemId);
    if (!item) {
      return;
    }
    const cart = await ctx.db.get("carts", item.cartId);
    if (!cart || cart.completedAt !== undefined) {
      throw new Error("Cart not found or already completed");
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
    await requireIdentity(ctx);
    const cart = await ctx.db.get("carts", args.cartId);
    if (!cart || cart.completedAt !== undefined) {
      throw new Error("Cart not found or already completed");
    }
    await requireDoc(ctx, "customers", args.customerId, "Customer not found");
    await ctx.db.patch(args.cartId, { customerId: args.customerId });
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
