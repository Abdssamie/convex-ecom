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

describe("store payments webhooks", () => {
  test("succeeded payment creates order and marks payment completed", async () => {
    const t = initConvexTest();
    const cartId = await createCartWithOneItem(t);

    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      providerId: "stripe",
      status: "awaiting",
      amount: 1500,
      currencyCode: "usd",
      paymentIntentId: "pi_success_1",
    });

    await t.mutation(api.store.stripeWebhooks.handleStripePaymentIntent, {
      paymentIntentId: "pi_success_1",
      status: "succeeded",
      amount: 1500,
      currency: "usd",
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
    const orderId = await t.mutation(api.store.orders.createOrderFromCart, {
      cartId,
    });

    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      orderId,
      providerId: "stripe",
      status: "awaiting",
      amount: 1500,
      currencyCode: "usd",
      paymentIntentId: "pi_failed_1",
    });

    await t.mutation(api.store.stripeWebhooks.handleStripePaymentIntent, {
      paymentIntentId: "pi_failed_1",
      status: "payment_failed",
      amount: 1500,
      currency: "usd",
    });

    const payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.status).toBe("failed");

    const order = await t.query(api.store.orders.getOrder, { orderId });
    expect(order?.order.paymentStatus).toBe("failed");
  });

  test("refund webhook marks partially_refunded then refunded", async () => {
    const t = initConvexTest();
    const cartId = await createCartWithOneItem(t);
    const orderId = await t.mutation(api.store.orders.createOrderFromCart, {
      cartId,
    });

    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      orderId,
      providerId: "stripe",
      status: "completed",
      amount: 1500,
      currencyCode: "usd",
      paymentIntentId: "pi_refund_1",
    });

    await t.mutation(api.store.stripeWebhooks.handleStripeRefund, {
      paymentIntentId: "pi_refund_1",
      amountRefunded: 500,
      currency: "usd",
    });

    let payment = await t.query(api.admin.payments.getPayment, { paymentId });
    let order = await t.query(api.store.orders.getOrder, { orderId });
    expect(payment?.status).toBe("partially_refunded");
    expect(order?.order.paymentStatus).toBe("partially_refunded");

    await t.mutation(api.store.stripeWebhooks.handleStripePaymentIntent, {
      paymentIntentId: "pi_refund_1",
      status: "succeeded",
      amount: 1500,
      currency: "usd",
    });

    payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.status).toBe("partially_refunded");

    await t.mutation(api.store.stripeWebhooks.handleStripeRefund, {
      paymentIntentId: "pi_refund_1",
      amountRefunded: 1500,
      currency: "usd",
    });

    payment = await t.query(api.admin.payments.getPayment, { paymentId });
    order = await t.query(api.store.orders.getOrder, { orderId });
    expect(payment?.status).toBe("refunded");
    expect(order?.order.paymentStatus).toBe("refunded");
  });
});
