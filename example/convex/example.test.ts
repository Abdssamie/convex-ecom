import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { initConvexTest } from "./setup.test";
import { api } from "./_generated/api";

describe("example", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
  });

  test("listProducts returns empty array initially", async () => {
    const t = initConvexTest();
    const products = await t.query(api.example.listProducts, {
      currencyCode: "usd",
    });
    expect(products).toEqual([]);
  });
});
