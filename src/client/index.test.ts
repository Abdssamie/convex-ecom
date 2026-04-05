import { describe, expect, test } from "vitest";
import { exposeApi } from "./index.js";
import { anyApi, type ApiFromModules } from "convex/server";
import { components, initConvexTest } from "./setup.test.js";

export const { createCart, getCart } = exposeApi(components.convexEcommerce, {
  auth: async (ctx, _operation) => {
    return (await ctx.auth.getUserIdentity())?.subject ?? null;
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
      subject: "user1",
    });
    const cartId = await t.mutation(testApi.createCart, {
      currencyCode: "usd",
    });
    const cart = await t.query(testApi.getCart, { cartId });
    expect(cart?.cart.currencyCode).toBe("usd");
  });
});
