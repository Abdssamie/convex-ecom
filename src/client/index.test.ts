import { describe, expect, test } from "vitest";
import { exposeApi } from "./index";
import {
  anyApi,
  type ApiFromModules,
  type GenericDataModel,
} from "convex/server";
import type { TestConvexForDataModelAndIdentity } from "convex-test";
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
  test("getCart rejects unauthenticated access", async () => {
    const t = initConvexTest();
    const cartId = await t.mutation(testApi.createCart, {
      currencyCode: "usd",
    });
    await expect(async () => {
      await t.query(testApi.getCart, {
        cartId: cartId as Id<"carts">,
      });
    }).rejects.toThrowError("Unauthorized");
  });

  test("authenticated users can read carts", async () => {
    const base =
      initConvexTest() as TestConvexForDataModelAndIdentity<GenericDataModel>;
    const cartId = await base.mutation(testApi.createCart, {
      currencyCode: "usd",
    });
    const cart = await base
      .withIdentity({
        tokenIdentifier: "https://example.com|user1",
        subject: "user1",
        issuer: "https://example.com",
      })
      .query(components.convexEcommerce.store.carts.getCart, {
        cartId: cartId as Id<"carts">,
      });
    expect(cart?.cart.currencyCode).toBe("usd");
  });
});
