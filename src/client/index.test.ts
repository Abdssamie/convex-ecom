import { describe, expect, test } from "vitest";
import { exposeApi } from "./index";
import { anyApi, type ApiFromModules } from "convex/server";
import { components, initConvexTest } from "./setup.test";
import type { Id } from "../component/_generated/dataModel";

export const { createCart, getCart } = exposeApi(components.convexEcommerce, {
  auth: async (ctx, _operation) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.tokenIdentifier ?? null;
  },
});

const testApi = (
  anyApi as unknown as ApiFromModules<{
    "index.test": {
      createCart: typeof createCart;
      getCart: typeof getCart;
    };
  }>
)["index.test"];

describe("client tests", () => {
  test("should be able to use client", async () => {
    const t = initConvexTest().withIdentity({
      tokenIdentifier: "https://example.com|user1",
    });
    const cartId = await t.mutation(testApi.createCart, {
      currencyCode: "usd",
    });
    const cart = await t.query(testApi.getCart, {
      cartId: cartId as Id<"carts">,
    });
    expect(cart?.cart.currencyCode).toBe("usd");
  });
});
