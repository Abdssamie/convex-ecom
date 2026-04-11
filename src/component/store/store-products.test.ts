import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

async function createVariantWithPrice(
  t: ReturnType<typeof initConvexTest>,
  currencyCode: string,
  amount: number,
) {
  const productId = await t.mutation(api.admin.products.createProduct, {
    product: {
      title: "Store Product",
      handle: `store-product-${Math.random()}`,
      status: "published",
      isGiftcard: false,
      discountable: true,
    },
  });
  const variantId = await t.mutation(api.admin.variants.createVariant, {
    variant: {
      productId,
      title: "Default Variant",
      sku: `sku-${Math.random()}`,
      barcode: "barcode",
      allowBackorder: false,
      manageInventory: true,
      variantRank: 0,
    },
  });
  await t.mutation(api.admin.prices.createPrice, {
    price: {
      variantId,
      currencyCode,
      amount,
      priceListId: null,
    },
  });
  return { productId, variantId };
}

describe("store products", () => {
  test("list products with base price", async () => {
    const t = initConvexTest();
    const { productId } = await createVariantWithPrice(t, "usd", 1500);

    await t.mutation(api.admin.products.updateProduct, {
      productId,
      status: "published",
    });

    const list = await t.query(api.store.products.listProducts, {
      paginationOpts: { numItems: 10, cursor: null },
      currencyCode: "usd",
    });
    expect(list.page.length).toBe(1);
    expect(list.page[0]?.variants[0]?.price?.amount).toBe(1500);
  });

  test("list products fails for missing price list", async () => {
    const t = initConvexTest();
    const deletedPriceListId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("priceLists", {
        title: "Temp",
        description: "Temp",
        status: "active",
        type: "sale",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.query(api.store.products.listProducts, {
        paginationOpts: { numItems: 10, cursor: null },
        currencyCode: "usd",
        priceListId: deletedPriceListId,
      });
    }).rejects.toThrowError("Price list not found");
  });
});
