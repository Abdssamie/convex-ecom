import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("store addresses", () => {
  test("create order address and enforce role uniqueness", async () => {
    const t = initConvexTest();
    const cartId = await t.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "ada@example.com",
    });

    await t.mutation(api.store.addresses.createOrderAddress, {
      role: "shipping",
      cartId,
      firstName: "Ada",
      lastName: "Lovelace",
      address1: "123 Main",
      city: "Testville",
      countryCode: "US",
      postalCode: "12345",
    });

    await expect(async () => {
      await t.mutation(api.store.addresses.createOrderAddress, {
        role: "shipping",
        cartId,
        firstName: "Ada",
      });
    }).rejects.toThrowError("already exists for this cart");
  });

  test("create order address validation failures", async () => {
    const t = initConvexTest();
    const cartId = await t.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "ada@example.com",
    });

    const otherCartId = await t.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "other@example.com",
    });

    const orderId = await t.run(async (ctx) => {
      return await ctx.db.insert("orders", {
        cartId: otherCartId,
        currencyCode: "usd",
        status: "pending",
        paymentStatus: "not_paid",
        total: 0,
      });
    });

    await expect(async () => {
      await t.mutation(api.store.addresses.createOrderAddress, {
        role: "shipping",
        cartId,
        orderId,
      });
    }).rejects.toThrowError("Order does not match cart");

    await t.run(async (ctx) => {
      await ctx.db.patch(cartId, { completedAt: Date.now() });
    });

    await expect(async () => {
      await t.mutation(api.store.addresses.createOrderAddress, {
        role: "billing",
        cartId,
      });
    }).rejects.toThrowError("Cart already completed");
  });
});
