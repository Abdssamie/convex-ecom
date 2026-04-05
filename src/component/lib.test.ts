/// <reference types="vite/client" />

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api } from "./_generated/api.js";
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
});
