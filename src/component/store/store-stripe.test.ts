import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

async function createVariantWithPrice(
  t: ReturnType<typeof initConvexTest>,
  options?: { stripePriceId?: string },
) {
  const productId = await t.mutation(api.admin.products.createProduct, {
    product: {
      title: "Stripe Product",
      handle: `stripe-product-${Math.random()}`,
      status: "published",
      isGiftcard: false,
      discountable: true,
    },
  });
  const variantId = await t.mutation(api.admin.variants.createVariant, {
    variant: {
      productId,
      title: "Default Variant",
      sku: `stripe-sku-${Math.random()}`,
      barcode: "stripe-barcode",
      allowBackorder: false,
      manageInventory: true,
      variantRank: 0,
      metadata: options?.stripePriceId
        ? { stripePriceId: options.stripePriceId }
        : undefined,
    },
  });
  await t.mutation(api.admin.prices.createPrice, {
    price: {
      variantId,
      currencyCode: "usd",
      amount: 1000,
      priceListId: null,
    },
  });

  return { productId, variantId };
}

describe("store stripe checkout", () => {
  test("create checkout session rejects multi-item cart", async () => {
    const t = initConvexTest();
    const customerId = await t.mutation(api.admin.customers.createCustomer, {
      userId: "stripe-customer-1",
      email: "stripe@example.com",
      hasAccount: true,
    });

    const { variantId: firstVariantId } = await createVariantWithPrice(t, {
      stripePriceId: "price_test_1",
    });
    const { variantId: secondVariantId } = await createVariantWithPrice(t, {
      stripePriceId: "price_test_2",
    });

    const cartId = await t.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "stripe@example.com",
    });
    await t.mutation(api.store.carts.setCustomer, { cartId, customerId });
    await t.mutation(api.store.carts.addItem, {
      cartId,
      variantId: firstVariantId,
      quantity: 1,
    });
    await t.mutation(api.store.carts.addItem, {
      cartId,
      variantId: secondVariantId,
      quantity: 1,
    });

    await expect(async () => {
      await t.action(api.store.index.createCheckoutSession, {
        cartId,
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });
    }).rejects.toThrowError("Stripe checkout requires exactly one cart item");
  });
});
