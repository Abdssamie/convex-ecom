import { mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { exposeApi } from "@abdssamie/convex-ecommerce";
import { v } from "convex/values";
import type { Auth } from "convex/server";

import { paginationOptsValidator } from "convex/server";

export const listProducts = query({
  args: {
    paginationOpts: paginationOptsValidator,
    currencyCode: v.string(),
    priceListId: v.optional(v.id("priceLists")),
  },
  handler: async (ctx, args) => {
    return await ctx.runQuery(
      components.convexEcommerce.store.products.listProducts,
      {
        paginationOpts: args.paginationOpts,
        currencyCode: args.currencyCode,
        priceListId: args.priceListId,
      },
    );
  },
});

export const createCart = mutation({
  args: {
    currencyCode: v.string(),
    priceListId: v.optional(v.id("priceLists")),
  },
  handler: async (ctx, args) => {
    return await ctx.runMutation(
      components.convexEcommerce.store.carts.createCart,
      {
        currencyCode: args.currencyCode,
        priceListId: args.priceListId,
      },
    );
  },
});

export const addItem = mutation({
  args: {
    cartId: v.id("carts"),
    variantId: v.id("variants"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.runMutation(
      components.convexEcommerce.store.carts.addItem,
      {
        cartId: args.cartId,
        variantId: args.variantId,
        quantity: args.quantity,
      },
    );
  },
});

export const getCart = query({
  args: { cartId: v.id("carts") },
  handler: async (ctx, args) => {
    return await ctx.runQuery(components.convexEcommerce.store.carts.getCart, {
      cartId: args.cartId,
    });
  },
});

// Here is an alternative way to use the component's methods directly by
// re-exporting the component's API:
export const {
  listProducts: listProductsViaClient,
  createCart: createCartViaClient,
  addItem: addItemViaClient,
  getCart: getCartViaClient,
  updateItem: updateItemViaClient,
  removeItem: removeItemViaClient,
  setCustomer: setCustomerViaClient,
} = exposeApi(components.convexEcommerce, {
  auth: async (ctx, _operation) => {
    return (await getAuthUserId(ctx)) ?? null;
  },
});

async function getAuthUserId(ctx: { auth: Auth }) {
  return (await ctx.auth.getUserIdentity())?.subject ?? null;
}
