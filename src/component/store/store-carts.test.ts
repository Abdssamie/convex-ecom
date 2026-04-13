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

describe("store carts", () => {
  test("add/update/remove items and set customer", async () => {
    const t = initConvexTest();
    const { variantId } = await createVariantWithPrice(t, "usd", 1200);
    const cartId = await t.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "ada@example.com",
    });

    const itemId = await t.mutation(api.store.carts.addItem, {
      cartId,
      variantId,
      quantity: 2,
    });
    await t.mutation(api.store.carts.addItem, {
      cartId,
      variantId,
      quantity: 1,
    });

    const cartWithItems = await t.query(api.store.carts.getCart, { cartId });
    expect(cartWithItems?.items[0]?.quantity).toBe(3);
    expect(cartWithItems?.cart.subtotal).toBe(3600);

    await t.mutation(api.store.carts.updateItem, {
      cartItemId: itemId,
      quantity: 1,
    });
    const updatedCart = await t.query(api.store.carts.getCart, { cartId });
    expect(updatedCart?.items[0]?.quantity).toBe(1);
    expect(updatedCart?.cart.total).toBe(1200);

    await t.mutation(api.store.carts.updateItem, {
      cartItemId: itemId,
      quantity: 0,
    });
    const afterDelete = await t.query(api.store.carts.getCart, { cartId });
    expect(afterDelete?.items).toHaveLength(0);
    expect(afterDelete?.cart.subtotal).toBe(0);

    const customerId = await t.mutation(api.admin.customers.createCustomer, {
      userId: "user-1",
      email: "customer@example.com",
      hasAccount: true,
    });
    await t.mutation(api.store.carts.setCustomer, { cartId, customerId });
    const withCustomer = await t.query(api.store.carts.getCart, { cartId });
    expect(withCustomer?.cart.customerId).toBe(customerId);
  });

  test("cart validation failures", async () => {
    const t = initConvexTest();
    const cartId = await t.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "ada@example.com",
    });

    const { variantId } = await createVariantWithPrice(t, "usd", 800);

    await expect(async () => {
      await t.mutation(api.store.carts.addItem, {
        cartId,
        variantId,
        quantity: 0,
      });
    }).rejects.toThrowError("Quantity must be greater than 0");

    const deletedVariantId = await t.run(async (ctx) => {
      const productId = await ctx.db.insert("products", {
        title: "Deleted",
        handle: "deleted-variant-product",
        status: "published",
        isGiftcard: false,
        discountable: true,
      });
      const vId = await ctx.db.insert("variants", {
        productId,
        title: "Deleted Variant",
        allowBackorder: false,
        manageInventory: true,
        variantRank: 0,
      });
      await ctx.db.delete(vId);
      return vId;
    });

    await expect(async () => {
      await t.mutation(api.store.carts.addItem, {
        cartId,
        variantId: deletedVariantId,
        quantity: 1,
      });
    }).rejects.toThrowError("Variant not found");

    const noPriceVariantId = await t.run(async (ctx) => {
      const productId = await ctx.db.insert("products", {
        title: "No Price",
        handle: "no-price-product",
        status: "published",
        isGiftcard: false,
        discountable: true,
      });
      return await ctx.db.insert("variants", {
        productId,
        title: "No Price Variant",
        allowBackorder: false,
        manageInventory: true,
        variantRank: 0,
      });
    });

    await expect(async () => {
      await t.mutation(api.store.carts.addItem, {
        cartId,
        variantId: noPriceVariantId,
        quantity: 1,
      });
    }).rejects.toThrowError("No price for variant in cart currency");

    const draftProductVariantId = await t.run(async (ctx) => {
      const productId = await ctx.db.insert("products", {
        title: "Draft Product",
        handle: "draft-product",
        status: "draft",
        isGiftcard: false,
        discountable: true,
      });
      const variantId = await ctx.db.insert("variants", {
        productId,
        title: "Draft Variant",
        allowBackorder: false,
        manageInventory: true,
        variantRank: 0,
      });
      await ctx.db.insert("prices", {
        variantId,
        currencyCode: "usd",
        amount: 900,
        priceListId: null,
      });
      return variantId;
    });

    await expect(async () => {
      await t.mutation(api.store.carts.addItem, {
        cartId,
        variantId: draftProductVariantId,
        quantity: 1,
      });
    }).rejects.toThrowError("Product is not published");

    await t.run(async (ctx) => {
      await ctx.db.patch(cartId, { completedAt: Date.now() });
    });

    await expect(async () => {
      await t.mutation(api.store.carts.addItem, {
        cartId,
        variantId,
        quantity: 1,
      });
    }).rejects.toThrowError("Cart not found or already completed");

    await expect(async () => {
      await t.mutation(api.store.carts.updateItem, {
        cartItemId: cartId as never,
        quantity: 1,
      });
    }).rejects.toThrowError();

    const deletedCustomerId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("customers", {
        userId: "deleted-user",
        hasAccount: false,
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.store.carts.setCustomer, {
        cartId,
        customerId: deletedCustomerId,
      });
    }).rejects.toThrowError("Cart not found or already completed");
  });

  test("remove item updates cart totals", async () => {
    const t = initConvexTest();
    const { variantId } = await createVariantWithPrice(t, "usd", 1500);
    const cartId = await t.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "grace@example.com",
    });

    const cartItemId = await t.mutation(api.store.carts.addItem, {
      cartId,
      variantId,
      quantity: 2,
    });

    const beforeRemove = await t.query(api.store.carts.getCart, { cartId });
    expect(beforeRemove?.items).toHaveLength(1);
    expect(beforeRemove?.cart.subtotal).toBe(3000);

    await t.mutation(api.store.carts.removeItem, { cartItemId });

    const afterRemove = await t.query(api.store.carts.getCart, { cartId });
    expect(afterRemove?.items).toHaveLength(0);
    expect(afterRemove?.cart.subtotal).toBe(0);
    expect(afterRemove?.cart.total).toBe(0);
  });

  test("create cart validates price list", async () => {
    const t = initConvexTest();
    const draftPriceListId = await t.mutation(
      api.admin.priceLists.createPriceList,
      {
        priceList: {
          title: "Draft",
          description: "Draft list",
          status: "draft",
          type: "sale",
        },
      },
    );

    await expect(async () => {
      await t.mutation(api.store.carts.createCart, {
        currencyCode: "usd",
        priceListId: draftPriceListId,
      });
    }).rejects.toThrowError("Price list is not active");

    const futurePriceListId = await t.mutation(
      api.admin.priceLists.createPriceList,
      {
        priceList: {
          title: "Future",
          description: "Future list",
          status: "active",
          type: "sale",
          startsAt: Date.now() + 60_000,
        },
      },
    );

    await expect(async () => {
      await t.mutation(api.store.carts.createCart, {
        currencyCode: "usd",
        priceListId: futurePriceListId,
      });
    }).rejects.toThrowError("Price list is not active yet");

    const pastPriceListId = await t.mutation(
      api.admin.priceLists.createPriceList,
      {
        priceList: {
          title: "Past",
          description: "Past list",
          status: "active",
          type: "sale",
          endsAt: Date.now() - 60_000,
        },
      },
    );

    await expect(async () => {
      await t.mutation(api.store.carts.createCart, {
        currencyCode: "usd",
        priceListId: pastPriceListId,
      });
    }).rejects.toThrowError("Price list has expired");
  });
});
