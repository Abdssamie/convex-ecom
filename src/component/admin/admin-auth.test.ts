import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { createConvexTest, initConvexTest, makeIdentity } from "../setup.test";

describe("admin auth", () => {
  test("admin endpoints reject unauthenticated and non-admin callers", async () => {
    const base = createConvexTest();
    const unauthenticated = base;
    const nonAdmin = base.withIdentity(makeIdentity("member-user"));

    await expect(async () => {
      await unauthenticated.query(api.admin.products.listProducts, {
        paginationOpts: { numItems: 10, cursor: null },
      });
    }).rejects.toThrowError("Unauthorized");

    await expect(async () => {
      await nonAdmin.mutation(api.admin.products.createProduct, {
        product: {
          title: "Blocked Product",
          handle: "blocked-product",
          status: "published",
          isGiftcard: false,
          discountable: true,
        },
      });
    }).rejects.toThrowError("Forbidden");
  });

  test("admin caller can access admin endpoints", async () => {
    const t = initConvexTest();
    const productId = await t.mutation(api.admin.products.createProduct, {
      product: {
        title: "Admin Product",
        handle: "admin-product",
        status: "published",
        isGiftcard: false,
        discountable: true,
      },
    });

    const products = await t.query(api.admin.products.listProducts, {
      paginationOpts: { numItems: 10, cursor: null },
    });

    expect(products.page.some((product) => product._id === productId)).toBe(
      true,
    );
  });
});
