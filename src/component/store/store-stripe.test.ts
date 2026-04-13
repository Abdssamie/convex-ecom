import { describe, expect, test } from "vitest";
import { api, components } from "../_generated/api";
import {
  createConvexTest,
  initConvexTest,
  makeIdentity,
  registerStripeTestComponent,
} from "../setup.test";

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

async function createCartWithOneStripeItem(
  t: ReturnType<typeof initConvexTest>,
  options?: { stripePriceId?: string; withCustomer?: boolean },
) {
  const { variantId } = await createVariantWithPrice(t, {
    stripePriceId: options?.stripePriceId,
  });
  const cartId = await t.mutation(api.store.carts.createCart, {
    currencyCode: "usd",
    email: "stripe-checkout@example.com",
  });

  if (options?.withCustomer) {
    const customerId = await t.mutation(api.admin.customers.createCustomer, {
      userId: `stripe-checkout-${Math.random()}`,
      email: "stripe-checkout@example.com",
      hasAccount: true,
    });
    await t.mutation(api.store.carts.setCustomer, { cartId, customerId });
  }

  await t.mutation(api.store.carts.addItem, {
    cartId,
    variantId,
    quantity: 1,
  });

  return { cartId, variantId };
}

describe("store stripe checkout", () => {
  test("create checkout session rejects cart without customer", async () => {
    const t = initConvexTest();
    const { variantId } = await createVariantWithPrice(t, {
      stripePriceId: "price_test_no_customer",
    });

    const cartId = await t.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "stripe@example.com",
    });
    await t.mutation(api.store.carts.addItem, {
      cartId,
      variantId,
      quantity: 1,
    });

    await expect(async () => {
      await t.action(api.store.index.createCheckoutSession, {
        cartId,
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });
    }).rejects.toThrowError("Cart customer is required for checkout");
  });

  test("create checkout session rejects variant without Stripe price metadata", async () => {
    const t = initConvexTest();
    const customerId = await t.mutation(api.admin.customers.createCustomer, {
      userId: "stripe-customer-2",
      email: "stripe2@example.com",
      hasAccount: true,
    });
    const { variantId } = await createVariantWithPrice(t);

    const cartId = await t.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "stripe2@example.com",
    });
    await t.mutation(api.store.carts.setCustomer, { cartId, customerId });
    await t.mutation(api.store.carts.addItem, {
      cartId,
      variantId,
      quantity: 1,
    });

    await expect(async () => {
      await t.action(api.store.index.createCheckoutSession, {
        cartId,
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });
    }).rejects.toThrowError(
      "Variant metadata.stripePriceId is required for Stripe checkout",
    );
  });

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

  test("sync payment intent completes matching app payment", async () => {
    const base = createConvexTest();
    registerStripeTestComponent(base);
    const t = base.withIdentity(
      makeIdentity("admin-user", { role: "admin", roles: ["admin"] }),
    );

    const { cartId } = await createCartWithOneStripeItem(t, {
      stripePriceId: "price_sync_test",
      withCustomer: true,
    });

    await t.mutation(api.store.addresses.createOrderAddress, {
      role: "shipping",
      cartId,
      firstName: "Ada",
      lastName: "Lovelace",
      address1: "123 Main",
      city: "Testville",
      countryCode: "US",
      postalCode: "12345",
    });

    const cart = await t.query(api.store.carts.getCart, { cartId });
    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      providerId: "stripe",
      status: "awaiting",
      amount: cart!.cart.total,
      currencyCode: cart!.cart.currencyCode,
      paymentIntentId: "pi_sync_success_1",
    });

    await t.mutation(components.stripe.private.handlePaymentIntentSucceeded, {
      stripePaymentIntentId: "pi_sync_success_1",
      amount: cart!.cart.total,
      currency: cart!.cart.currencyCode,
      status: "succeeded",
      created: Date.now(),
    });

    await t.action(api.store.index.syncPaymentIntent, {
      paymentIntentId: "pi_sync_success_1",
    });

    const payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.status).toBe("completed");
    expect(payment?.orderId).toBeDefined();

    const order = await t.query(api.store.orders.getOrder, {
      orderId: payment!.orderId!,
    });
    expect(order?.order.paymentStatus).toBe("completed");
  });

  test("sync payment intent is no-op when component payment missing", async () => {
    const base = createConvexTest();
    registerStripeTestComponent(base);
    const t = base.withIdentity(
      makeIdentity("admin-user", { role: "admin", roles: ["admin"] }),
    );

    const { cartId } = await createCartWithOneStripeItem(t, {
      stripePriceId: "price_sync_missing",
      withCustomer: true,
    });

    const cart = await t.query(api.store.carts.getCart, { cartId });
    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      providerId: "stripe",
      status: "awaiting",
      amount: cart!.cart.total,
      currencyCode: cart!.cart.currencyCode,
      paymentIntentId: "pi_sync_missing_1",
    });

    await t.action(api.store.index.syncPaymentIntent, {
      paymentIntentId: "pi_sync_missing_1",
    });

    const payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.status).toBe("awaiting");
    expect(payment?.orderId).toBeUndefined();
  });
});
