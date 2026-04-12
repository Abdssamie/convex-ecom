import { describe, expect, test } from "vitest";
import { api, internal } from "../_generated/api";
import { initConvexTest } from "../setup.test";

async function createCartWithOneItem(t: ReturnType<typeof initConvexTest>) {
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
    email: "pay@example.com",
  });

  await t.mutation(api.store.carts.addItem, {
    cartId,
    variantId,
    quantity: 1,
  });

  await t.mutation(api.store.addresses.createOrderAddress, {
    role: "shipping",
    cartId,
    firstName: "Test",
    lastName: "User",
    address1: "123 Test St",
    city: "Testville",
    countryCode: "US",
    postalCode: "12345",
  });

  return cartId;
}

async function getCartTotals(
  t: ReturnType<typeof initConvexTest>,
  cartId: Awaited<ReturnType<typeof createCartWithOneItem>>,
) {
  const cart = await t.query(api.store.carts.getCart, { cartId });
  if (!cart) {
    throw new Error("Cart not found");
  }
  return {
    total: cart.cart.total,
    currencyCode: cart.cart.currencyCode,
  };
}

describe("store payments webhooks", () => {
  test("succeeded payment creates order and marks payment completed", async () => {
    const t = initConvexTest();
    const cartId = await createCartWithOneItem(t);
    const { total, currencyCode } = await getCartTotals(t, cartId);

    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      providerId: "stripe",
      status: "awaiting",
      amount: total,
      currencyCode,
      paymentIntentId: "pi_success_1",
    });

    await t.mutation(internal.store.stripeWebhooks.handleStripePaymentIntent, {
      paymentIntentId: "pi_success_1",
      status: "succeeded",
      amount: total,
      currency: currencyCode,
    });

    const payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.status).toBe("completed");
    expect(payment?.orderId).toBeDefined();

    const order = await t.query(api.store.orders.getOrder, {
      orderId: payment!.orderId!,
    });
    expect(order?.order.paymentStatus).toBe("completed");

    const cart = await t.query(api.store.carts.getCart, { cartId });
    expect(cart?.cart.completedAt).toBeDefined();
  });

  test("failed payment updates linked order payment status", async () => {
    const t = initConvexTest();
    const cartId = await createCartWithOneItem(t);
    const { total, currencyCode } = await getCartTotals(t, cartId);
    const orderId = await t.mutation(api.store.orders.createOrderFromCart, {
      cartId,
    });

    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      orderId,
      providerId: "stripe",
      status: "awaiting",
      amount: total,
      currencyCode,
      paymentIntentId: "pi_failed_1",
    });

    await t.mutation(internal.store.stripeWebhooks.handleStripePaymentIntent, {
      paymentIntentId: "pi_failed_1",
      status: "payment_failed",
      amount: total,
      currency: currencyCode,
    });

    const payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.status).toBe("failed");

    const order = await t.query(api.store.orders.getOrder, { orderId });
    expect(order?.order.paymentStatus).toBe("failed");
  });

  test("webhook falls back to paymentId when paymentIntentId is missing", async () => {
    const t = initConvexTest();
    const cartId = await createCartWithOneItem(t);
    const { total, currencyCode } = await getCartTotals(t, cartId);

    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      providerId: "stripe",
      status: "awaiting",
      amount: total,
      currencyCode,
    });

    await t.mutation(internal.store.stripeWebhooks.handleStripePaymentIntent, {
      paymentIntentId: "pi_fallback_1",
      paymentId,
      status: "succeeded",
      amount: total,
      currency: currencyCode,
    });

    const payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.paymentIntentId).toBe("pi_fallback_1");
    expect(payment?.status).toBe("completed");
    expect(payment?.orderId).toBeDefined();
  });

  test("amount mismatch does not complete payment or create order", async () => {
    const t = initConvexTest();
    const cartId = await createCartWithOneItem(t);
    const { total, currencyCode } = await getCartTotals(t, cartId);

    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      providerId: "stripe",
      status: "awaiting",
      amount: total,
      currencyCode,
      paymentIntentId: "pi_mismatch_1",
    });

    await t.mutation(internal.store.stripeWebhooks.handleStripePaymentIntent, {
      paymentIntentId: "pi_mismatch_1",
      status: "succeeded",
      amount: total - 1,
      currency: currencyCode,
    });

    const payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.status).toBe("failed");
    expect(payment?.orderId).toBeUndefined();
  });

  test("currency mismatch does not complete payment", async () => {
    const t = initConvexTest();
    const cartId = await createCartWithOneItem(t);
    const { total, currencyCode } = await getCartTotals(t, cartId);

    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      providerId: "stripe",
      status: "awaiting",
      amount: total,
      currencyCode,
      paymentIntentId: "pi_currency_mismatch_1",
    });

    await t.mutation(internal.store.stripeWebhooks.handleStripePaymentIntent, {
      paymentIntentId: "pi_currency_mismatch_1",
      status: "succeeded",
      amount: total,
      currency: "eur",
    });

    const payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.status).toBe("failed");
  });

  test("refund webhook marks partially_refunded then refunded", async () => {
    const t = initConvexTest();
    const cartId = await createCartWithOneItem(t);
    const { total, currencyCode } = await getCartTotals(t, cartId);
    const orderId = await t.mutation(api.store.orders.createOrderFromCart, {
      cartId,
    });

    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      orderId,
      providerId: "stripe",
      status: "completed",
      amount: total,
      currencyCode,
      paymentIntentId: "pi_refund_1",
    });

    await t.mutation(internal.store.stripeWebhooks.handleStripeRefund, {
      paymentIntentId: "pi_refund_1",
      amountRefunded: Math.floor(total / 2),
      currency: currencyCode,
    });

    let payment = await t.query(api.admin.payments.getPayment, { paymentId });
    let order = await t.query(api.store.orders.getOrder, { orderId });
    expect(payment?.status).toBe("partially_refunded");
    expect(order?.order.paymentStatus).toBe("partially_refunded");

    await t.mutation(internal.store.stripeWebhooks.handleStripePaymentIntent, {
      paymentIntentId: "pi_refund_1",
      status: "succeeded",
      amount: total,
      currency: currencyCode,
    });

    payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.status).toBe("partially_refunded");

    await t.mutation(internal.store.stripeWebhooks.handleStripeRefund, {
      paymentIntentId: "pi_refund_1",
      amountRefunded: total,
      currency: currencyCode,
    });

    payment = await t.query(api.admin.payments.getPayment, { paymentId });
    order = await t.query(api.store.orders.getOrder, { orderId });
    expect(payment?.status).toBe("refunded");
    expect(order?.order.paymentStatus).toBe("refunded");
  });

  test("refund rejects currency mismatch", async () => {
    const t = initConvexTest();
    const cartId = await createCartWithOneItem(t);
    const { total, currencyCode } = await getCartTotals(t, cartId);
    const orderId = await t.mutation(api.store.orders.createOrderFromCart, {
      cartId,
    });

    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      orderId,
      providerId: "stripe",
      status: "completed",
      amount: total,
      currencyCode,
      paymentIntentId: "pi_refund_currency_1",
    });

    await t.mutation(internal.store.stripeWebhooks.handleStripeRefund, {
      paymentIntentId: "pi_refund_currency_1",
      amountRefunded: total,
      currency: "eur",
    });

    const payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.status).toBe("completed");
  });

  test("refund rejects amount above payment", async () => {
    const t = initConvexTest();
    const cartId = await createCartWithOneItem(t);
    const { total, currencyCode } = await getCartTotals(t, cartId);
    const orderId = await t.mutation(api.store.orders.createOrderFromCart, {
      cartId,
    });

    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      orderId,
      providerId: "stripe",
      status: "completed",
      amount: total,
      currencyCode,
      paymentIntentId: "pi_refund_over_1",
    });

    await t.mutation(internal.store.stripeWebhooks.handleStripeRefund, {
      paymentIntentId: "pi_refund_over_1",
      amountRefunded: total + 1,
      currency: currencyCode,
    });

    const payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.status).toBe("completed");
  });
});
