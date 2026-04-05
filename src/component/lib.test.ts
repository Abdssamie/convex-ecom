/// <reference types="vite/client" />

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "./_generated/api.js";
import { initConvexTest } from "./setup.test.js";

describe("component lib", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  test("createCart and getCart", async () => {
    const t = initConvexTest();
    const cartId = await t.mutation(api.lib.createCart, {
      currencyCode: "usd",
    });
    const cart = await t.query(api.lib.getCart, { cartId });
    expect(cart?.cart.currencyCode).toBe("usd");
    expect(cart?.items).toEqual([]);
  });

  test("price lists override base price", async () => {
    const t = initConvexTest();
    const { variantId, priceListId } = await t.mutation(
      internal.lib.seedPriceListScenario,
      {
        currencyCode: "usd",
        baseAmount: 2000,
        listAmount: 1500,
      },
    );

    const cartId = await t.mutation(api.lib.createCart, {
      currencyCode: "usd",
      priceListId,
    });
    await t.mutation(api.lib.addItem, {
      cartId,
      variantId,
      quantity: 1,
    });
    const cart = await t.query(api.lib.getCart, { cartId });
    expect(cart?.items[0]?.unitPrice).toBe(1500);

    const products = await t.query(api.lib.listProducts, {
      currencyCode: "usd",
      priceListId,
    });
    expect(products[0]?.variants[0]?.price?.amount).toBe(1500);
  });
});
