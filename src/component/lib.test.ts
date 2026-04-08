/// <reference types="vite/client" />

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "./_generated/api";
import { initConvexTest } from "./setup.test";

describe("component lib", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  test("createCart and getCart", async () => {
    const t = initConvexTest();
    const cartId = await t.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "ada@example.com",
    });
    const cart = await t.query(api.store.carts.getCart, { cartId });
    expect(cart?.cart.currencyCode).toBe("usd");
    expect(cart?.items).toEqual([]);
  });

  test("price lists override base price", async () => {
    const t = initConvexTest();
    const { variantId, priceListId } = await t.mutation(
      internal.store.orders.seedPriceListScenario,
      {
        currencyCode: "usd",
        baseAmount: 2000,
        listAmount: 1500,
      },
    );

    const cartId = await t.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      priceListId,
      email: "grace@example.com",
    });
    await t.mutation(api.store.carts.addItem, {
      cartId,
      variantId,
      quantity: 1,
    });
    const cart = await t.query(api.store.carts.getCart, { cartId });
    expect(cart?.items[0]?.unitPrice).toBe(1500);

    const products = await t.query(api.store.products.listProducts, {
      paginationOpts: { numItems: 10, cursor: null },
      currencyCode: "usd",
      priceListId,
    });
    expect(products.page[0]?.variants[0]?.price?.amount).toBe(1500);
  });

  test("createOrderFromCart snapshots cart", async () => {
    const t = initConvexTest();
    const { variantId } = await t.mutation(
      internal.store.orders.seedPriceListScenario,
      {
        currencyCode: "usd",
        baseAmount: 2000,
        listAmount: 1500,
      },
    );
    const cartId = await t.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "ada@example.com",
    });
    await t.mutation(api.store.carts.addItem, {
      cartId,
      variantId,
      quantity: 2,
    });
    await t.mutation(api.store.addresses.createOrderAddress, {
      role: "shipping",
      cartId,
      firstName: "Ada",
      lastName: "Lovelace",
      address1: "123 Test St",
      city: "Testville",
      countryCode: "US",
      postalCode: "12345",
    });

    const orderId = await t.mutation(api.store.orders.createOrderFromCart, {
      cartId,
    });
    const order = await t.query(api.store.orders.getOrder, { orderId });
    const cart = await t.query(api.store.carts.getCart, { cartId });

    expect(order?.order.cartId).toBe(cartId);
    expect(order?.order.status).toBe("pending");
    expect(order?.order.paymentStatus).toBe("not_paid");
    expect(order?.items).toHaveLength(1);
    expect(order?.items[0]?.quantity).toBe(2);
    expect(order?.addresses[0]?.orderId).toBe(orderId);
    expect(order?.shippingMethods[0]?.amount).toBe(0);
    expect(cart?.cart.completedAt).toBeDefined();
  });
});
