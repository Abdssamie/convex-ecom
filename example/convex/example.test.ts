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

  test("listProducts returns empty page initially", async () => {
    const t = initConvexTest();
    const result = await t.query(api.example.listProducts, {
      paginationOpts: { numItems: 20, cursor: null },
      currencyCode: "usd",
    });
    expect(result.page).toEqual([]);
    expect(result.isDone).toBe(true);
  });
});
