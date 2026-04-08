import { mutationGeneric, queryGeneric } from "convex/server";
import type { Auth } from "convex/server";
import { v } from "convex/values";
import type { ComponentApi } from "../component/_generated/component";

// See the example/convex/example.ts file for how to use this component.

type Operation =
  | { type: "list_products"; currencyCode: string; priceListId?: string }
  | { type: "get_cart"; cartId: string }
  | { type: "create_cart"; currencyCode: string; priceListId?: string }
  | { type: "add_item"; cartId: string; variantId: string; quantity: number }
  | { type: "update_item"; cartItemId: string; quantity: number }
  | { type: "remove_item"; cartItemId: string }
  | { type: "set_customer"; cartId: string; customerId: string };

function requiresAuth(operation: Operation) {
  return !(
    operation.type === "list_products" || operation.type === "create_cart"
  );
}

async function authorize(
  ctx: { auth: Auth },
  operation: Operation,
  auth: (ctx: { auth: Auth }, operation: Operation) => Promise<string | null>,
) {
  const userId = await auth(ctx, operation);
  if (!userId && requiresAuth(operation)) {
    throw new Error("Unauthorized");
  }
  return userId;
}

/**
 * For re-exporting of an API accessible from React clients.
 * e.g. `export const { listProducts, createCart } =
 * exposeApi(components.convexEcommerce, {
 *   auth: async (ctx, operation) => { ... },
 * });`
 * See example/convex/example.ts.
 */
export function exposeApi(
  component: ComponentApi,
  options: {
    /**
     * It's very important to authenticate any functions that users will export.
     * Return the authorized user's ID or null to allow guest access.
     */
    auth: (ctx: { auth: Auth }, operation: Operation) => Promise<string | null>;
  },
) {
  return {
    listProducts: queryGeneric({
      args: {
        currencyCode: v.string(),
        limit: v.optional(v.number()),
        priceListId: v.optional(v.string()),
      },
      handler: async (ctx, args) => {
        await authorize(
          ctx,
          {
            type: "list_products",
            currencyCode: args.currencyCode,
            priceListId: args.priceListId,
          },
          options.auth,
        );
        return await ctx.runQuery(component.store.products.listProducts, args);
      },
    }),
    getCart: queryGeneric({
      args: { cartId: v.string() },
      handler: async (ctx, args) => {
        await authorize(
          ctx,
          { type: "get_cart", cartId: args.cartId },
          options.auth,
        );
        return await ctx.runQuery(component.store.carts.getCart, {
          cartId: args.cartId,
        });
      },
    }),
    createCart: mutationGeneric({
      args: { currencyCode: v.string(), priceListId: v.optional(v.string()) },
      handler: async (ctx, args) => {
        await authorize(
          ctx,
          {
            type: "create_cart",
            currencyCode: args.currencyCode,
            priceListId: args.priceListId,
          },
          options.auth,
        );
        return await ctx.runMutation(component.store.carts.createCart, args);
      },
    }),
    addItem: mutationGeneric({
      args: {
        cartId: v.string(),
        variantId: v.string(),
        quantity: v.number(),
      },
      handler: async (ctx, args) => {
        await authorize(
          ctx,
          {
            type: "add_item",
            cartId: args.cartId,
            variantId: args.variantId,
            quantity: args.quantity,
          },
          options.auth,
        );
        return await ctx.runMutation(component.store.carts.addItem, args);
      },
    }),
    updateItem: mutationGeneric({
      args: { cartItemId: v.string(), quantity: v.number() },
      handler: async (ctx, args) => {
        await authorize(
          ctx,
          {
            type: "update_item",
            cartItemId: args.cartItemId,
            quantity: args.quantity,
          },
          options.auth,
        );
        return await ctx.runMutation(component.store.carts.updateItem, args);
      },
    }),
    removeItem: mutationGeneric({
      args: { cartItemId: v.string() },
      handler: async (ctx, args) => {
        await authorize(
          ctx,
          { type: "remove_item", cartItemId: args.cartItemId },
          options.auth,
        );
        return await ctx.runMutation(component.store.carts.removeItem, args);
      },
    }),
    setCustomer: mutationGeneric({
      args: { cartId: v.string(), customerId: v.string() },
      handler: async (ctx, args) => {
        await authorize(
          ctx,
          {
            type: "set_customer",
            cartId: args.cartId,
            customerId: args.customerId,
          },
          options.auth,
        );
        return await ctx.runMutation(component.store.carts.setCustomer, args);
      },
    }),
  };
}
