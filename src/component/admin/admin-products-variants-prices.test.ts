import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { initConvexTest } from "../setup.test";

function productPayload(
  overrides?: Partial<{
    title: string;
    handle: string;
    status: "draft" | "proposed" | "published" | "rejected";
    isGiftcard: boolean;
    discountable: boolean;
  }>,
) {
  return {
    title: overrides?.title ?? "Test Product",
    handle: overrides?.handle ?? `test-product-${Math.random()}`,
    status: overrides?.status ?? "draft",
    isGiftcard: overrides?.isGiftcard ?? false,
    discountable: overrides?.discountable ?? true,
  };
}

function variantPayload(overrides: {
  productId: Id<"products">;
  sku?: string;
  inventoryItemId?: Id<"inventoryItems">;
}) {
  return {
    productId: overrides.productId,
    title: "Default Variant",
    sku: overrides.sku,
    barcode: "barcode-1",
    allowBackorder: false,
    manageInventory: true,
    variantRank: 0,
    inventoryItemId: overrides.inventoryItemId,
  };
}

async function createDeletedProductId(t: ReturnType<typeof initConvexTest>) {
  return await t.run(async (ctx) => {
    const id = await ctx.db.insert(
      "products",
      productPayload({ handle: "deleted-product" }),
    );
    await ctx.db.delete(id);
    return id;
  });
}

async function createDeletedInventoryItemId(
  t: ReturnType<typeof initConvexTest>,
) {
  return await t.run(async (ctx) => {
    const id = await ctx.db.insert("inventoryItems", {
      sku: "deleted-sku",
      title: "Deleted",
      description: "Deleted",
      requiresShipping: true,
    });
    await ctx.db.delete(id);
    return id;
  });
}

describe("admin products", () => {
  test("create/get/list/update/archive product", async () => {
    const t = initConvexTest();

    const productId = await t.mutation(api.admin.products.createProduct, {
      product: productPayload({ handle: "product-1", status: "draft" }),
    });

    const product = await t.query(api.admin.products.getProduct, { productId });
    expect(product?.handle).toBe("product-1");

    const list = await t.query(api.admin.products.listProducts, {
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(list.page).toHaveLength(1);

    await t.mutation(api.admin.products.updateProduct, {
      productId,
      title: "Updated Title",
      status: "published",
    });
    const updated = await t.query(api.admin.products.getProduct, { productId });
    expect(updated?.title).toBe("Updated Title");
    expect(updated?.status).toBe("published");

    await t.mutation(api.admin.products.archiveProduct, { productId });
    const archived = await t.query(api.admin.products.getProduct, {
      productId,
    });
    expect(archived?.status).toBe("rejected");
  });

  test("product validation failures", async () => {
    const t = initConvexTest();

    await expect(async () => {
      await t.mutation(api.admin.products.createProduct, {
        product: { title: "Missing Handle" } as never,
      });
    }).rejects.toThrowError();

    await expect(async () => {
      await t.mutation(api.admin.products.updateProduct, {
        productId: await createDeletedProductId(t),
        title: "Nope",
      });
    }).rejects.toThrowError("Product not found");
  });
});

describe("admin variants", () => {
  test("create/get/list/update variant", async () => {
    const t = initConvexTest();

    const productId = await t.mutation(api.admin.products.createProduct, {
      product: productPayload({ handle: "variant-product" }),
    });

    const variantId = await t.mutation(api.admin.variants.createVariant, {
      variant: variantPayload({ productId, sku: "sku-1" }),
    });

    const variant = await t.query(api.admin.variants.getVariant, { variantId });
    expect(variant?.sku).toBe("sku-1");

    const list = await t.query(api.admin.variants.listVariantsByProduct, {
      productId,
    });
    expect(list).toHaveLength(1);

    await t.mutation(api.admin.variants.updateVariant, {
      variantId,
      title: "Updated Variant",
    });
    const updated = await t.query(api.admin.variants.getVariant, { variantId });
    expect(updated?.title).toBe("Updated Variant");
  });

  test("variant validation failures", async () => {
    const t = initConvexTest();

    const missingProductId = await createDeletedProductId(t);

    await expect(async () => {
      await t.mutation(api.admin.variants.createVariant, {
        variant: variantPayload({ productId: missingProductId, sku: "sku-x" }),
      });
    }).rejects.toThrowError("Product not found");

    const productId = await t.mutation(api.admin.products.createProduct, {
      product: productPayload({ handle: "sku-product" }),
    });

    const firstVariantId = await t.mutation(api.admin.variants.createVariant, {
      variant: variantPayload({ productId, sku: "dup-sku" }),
    });

    await expect(async () => {
      await t.mutation(api.admin.variants.createVariant, {
        variant: variantPayload({ productId, sku: "dup-sku" }),
      });
    }).rejects.toThrowError("Variant SKU already exists");

    const secondVariantId = await t.mutation(api.admin.variants.createVariant, {
      variant: variantPayload({ productId, sku: "unique-sku" }),
    });

    await expect(async () => {
      await t.mutation(api.admin.variants.updateVariant, {
        variantId: secondVariantId,
        sku: "dup-sku",
      });
    }).rejects.toThrowError("Variant SKU already exists");

    await expect(async () => {
      await t.mutation(api.admin.variants.updateVariant, {
        variantId: firstVariantId,
        inventoryItemId: await createDeletedInventoryItemId(t),
      });
    }).rejects.toThrowError("Inventory item not found");
  });
});

describe("admin prices", () => {
  test("create/get/list/update/delete price", async () => {
    const t = initConvexTest();

    const productId = await t.mutation(api.admin.products.createProduct, {
      product: productPayload({ handle: "price-product" }),
    });
    const variantId = await t.mutation(api.admin.variants.createVariant, {
      variant: variantPayload({ productId, sku: "price-sku" }),
    });
    const priceListId = await t.mutation(api.admin.priceLists.createPriceList, {
      priceList: {
        title: "Sale",
        description: "Test list",
        status: "active",
        type: "override",
      },
    });

    const basePriceId = await t.mutation(api.admin.prices.createPrice, {
      price: {
        variantId,
        currencyCode: "usd",
        amount: 1200,
        priceListId: null,
      },
    });

    const listPriceId = await t.mutation(api.admin.prices.createPrice, {
      price: {
        variantId,
        currencyCode: "usd",
        amount: 900,
        priceListId,
      },
    });

    const byVariant = await t.query(api.admin.prices.listPricesByVariant, {
      variantId,
      limit: 10,
    });
    expect(byVariant).toHaveLength(2);

    const byPriceList = await t.query(api.admin.prices.listPricesByPriceList, {
      priceListId,
      limit: 10,
    });
    expect(byPriceList).toHaveLength(1);

    await t.mutation(api.admin.prices.updatePrice, {
      priceId: basePriceId,
      amount: 1400,
    });
    const updated = await t.query(api.admin.prices.listPricesByVariant, {
      variantId,
      priceListId: null,
    });
    expect(updated[0]?.amount).toBe(1400);

    await t.mutation(api.admin.prices.deletePrice, { priceId: listPriceId });
    const remaining = await t.query(api.admin.prices.listPricesByVariant, {
      variantId,
    });
    expect(remaining).toHaveLength(1);
  });

  test("price validation failures", async () => {
    const t = initConvexTest();

    const missingVariantId = await t.run(async (ctx) => {
      const productId = await ctx.db.insert(
        "products",
        productPayload({ handle: "missing-variant-product" }),
      );
      const variantId = await ctx.db.insert("variants", {
        productId,
        title: "Variant",
        sku: "temp-sku",
        barcode: "temp",
        allowBackorder: false,
        manageInventory: true,
        variantRank: 0,
      });
      await ctx.db.delete(variantId);
      return variantId;
    });

    await expect(async () => {
      await t.mutation(api.admin.prices.createPrice, {
        price: {
          variantId: missingVariantId,
          currencyCode: "usd",
          amount: 1000,
          priceListId: null,
        },
      });
    }).rejects.toThrowError("Variant not found");

    const productId = await t.mutation(api.admin.products.createProduct, {
      product: productPayload({ handle: "price-product-2" }),
    });
    const variantId = await t.mutation(api.admin.variants.createVariant, {
      variant: variantPayload({ productId, sku: "price-sku-2" }),
    });

    const missingPriceListId = await t.run(async (ctx) => {
      const priceListId = await ctx.db.insert("priceLists", {
        title: "Temp",
        description: "Temp",
        status: "active",
        type: "sale",
      });
      await ctx.db.delete(priceListId);
      return priceListId;
    });

    await expect(async () => {
      await t.mutation(api.admin.prices.createPrice, {
        price: {
          variantId,
          currencyCode: "usd",
          amount: 1100,
          priceListId: missingPriceListId,
        },
      });
    }).rejects.toThrowError("Price list not found");

    await t.mutation(api.admin.prices.createPrice, {
      price: {
        variantId,
        currencyCode: "usd",
        amount: 1200,
        priceListId: null,
      },
    });

    await expect(async () => {
      await t.mutation(api.admin.prices.createPrice, {
        price: {
          variantId,
          currencyCode: "usd",
          amount: 1300,
          priceListId: null,
        },
      });
    }).rejects.toThrowError(
      "Price already exists for variant/currency/price list",
    );

    const priceListId = await t.mutation(api.admin.priceLists.createPriceList, {
      priceList: {
        title: "List",
        description: "List",
        status: "active",
        type: "override",
      },
    });

    const listPriceId = await t.mutation(api.admin.prices.createPrice, {
      price: {
        variantId,
        currencyCode: "usd",
        amount: 900,
        priceListId,
      },
    });

    await expect(async () => {
      await t.mutation(api.admin.prices.updatePrice, {
        priceId: listPriceId,
        priceListId: null,
      });
    }).rejects.toThrowError(
      "Price already exists for variant/currency/price list",
    );

    await expect(async () => {
      await t.mutation(api.admin.prices.updatePrice, {
        priceId: listPriceId,
        priceListId: missingPriceListId,
      });
    }).rejects.toThrowError("Price list not found");
  });
});
