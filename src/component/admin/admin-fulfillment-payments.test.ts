import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

async function createBasicOrder(t: ReturnType<typeof initConvexTest>) {
  const cartId = await t.mutation(api.store.carts.createCart, {
    currencyCode: "usd",
    email: "order@example.com",
  });
  const orderId = await t.run(async (ctx) => {
    return await ctx.db.insert("orders", {
      cartId,
      currencyCode: "usd",
      status: "pending",
      paymentStatus: "not_paid",
      total: 0,
    });
  });
  return { cartId, orderId };
}

describe("admin fulfillments", () => {
  test("create/get/list/update fulfillments", async () => {
    const t = initConvexTest();
    const { orderId } = await createBasicOrder(t);
    const locationId = await t.mutation(api.admin.locations.createLocation, {
      name: "Warehouse",
    });
    const shippingMethodId = await t.mutation(
      api.admin.orderShippingMethods.createOrderShippingMethod,
      {
        orderId,
        name: "Standard",
        amount: 0,
        isTaxInclusive: false,
        isCustomAmount: true,
      },
    );

    const fulfillmentId = await t.mutation(
      api.admin.fulfillments.createFulfillment,
      {
        orderId,
        orderShippingMethodId: shippingMethodId,
        locationId,
        requiresShipping: true,
      },
    );

    const byOrder = await t.query(api.admin.fulfillments.listFulfillments, {
      paginationOpts: { numItems: 10, cursor: null },
      orderId,
    });
    expect(byOrder.page[0]?._id).toBe(fulfillmentId);

    const byLocation = await t.query(api.admin.fulfillments.listFulfillments, {
      paginationOpts: { numItems: 10, cursor: null },
      locationId,
    });
    expect(byLocation.page[0]?._id).toBe(fulfillmentId);

    const fulfillment = await t.query(api.admin.fulfillments.getFulfillment, {
      fulfillmentId,
    });
    expect(fulfillment?.orderShippingMethodId).toBe(shippingMethodId);

    await t.mutation(api.admin.fulfillments.updateFulfillment, {
      fulfillmentId,
      packedAt: 123,
    });
    const updated = await t.query(api.admin.fulfillments.getFulfillment, {
      fulfillmentId,
    });
    expect(updated?.packedAt).toBe(123);
  });

  test("fulfillment validation failures", async () => {
    const t = initConvexTest();
    const { orderId } = await createBasicOrder(t);
    const locationId = await t.mutation(api.admin.locations.createLocation, {
      name: "Loc",
    });

    const otherOrderId = await t.run(async (ctx) => {
      return await ctx.db.insert("orders", {
        cartId: await ctx.db.insert("carts", {
          currencyCode: "usd",
          subtotal: 0,
          shippingTotal: 0,
          total: 0,
        }),
        currencyCode: "usd",
        status: "pending",
        paymentStatus: "not_paid",
        total: 0,
      });
    });
    const otherShippingMethodId = await t.mutation(
      api.admin.orderShippingMethods.createOrderShippingMethod,
      {
        orderId: otherOrderId,
        name: "Other",
        amount: 0,
        isTaxInclusive: false,
        isCustomAmount: true,
      },
    );

    await expect(async () => {
      await t.mutation(api.admin.fulfillments.createFulfillment, {
        orderId,
        orderShippingMethodId: otherShippingMethodId,
        locationId,
        requiresShipping: true,
      });
    }).rejects.toThrowError("Shipping method does not match order");

    const fulfillmentId = await t.mutation(
      api.admin.fulfillments.createFulfillment,
      {
        orderId,
        locationId,
        requiresShipping: true,
      },
    );

    await expect(async () => {
      await t.mutation(api.admin.fulfillments.updateFulfillment, {
        fulfillmentId,
        orderShippingMethodId: otherShippingMethodId,
      });
    }).rejects.toThrowError("Shipping method does not match order");
  });
});

describe("admin fulfillment items", () => {
  test("create/get/list/update fulfillment items", async () => {
    const t = initConvexTest();
    const { orderId } = await createBasicOrder(t);
    const locationId = await t.mutation(api.admin.locations.createLocation, {
      name: "Warehouse",
    });
    const fulfillmentId = await t.mutation(
      api.admin.fulfillments.createFulfillment,
      {
        orderId,
        locationId,
        requiresShipping: true,
      },
    );
    const orderItemId = await t.run(async (ctx) => {
      return await ctx.db.insert("orderItems", {
        orderId,
        version: 1,
        variantId: await ctx.db.insert("variants", {
          productId: await ctx.db.insert("products", {
            title: "Product",
            handle: "product",
            status: "published",
            isGiftcard: false,
            discountable: true,
          }),
          title: "Variant",
          allowBackorder: false,
          manageInventory: true,
          variantRank: 0,
        }),
        quantity: 2,
        unitPrice: 100,
        fulfilledQuantity: 0,
        deliveredQuantity: 0,
        shippedQuantity: 0,
        returnRequestedQuantity: 0,
        returnReceivedQuantity: 0,
        returnDismissedQuantity: 0,
        writtenOffQuantity: 0,
      });
    });

    const fulfillmentItemId = await t.mutation(
      api.admin.fulfillmentItems.createFulfillmentItem,
      {
        fulfillmentId,
        orderItemId,
        quantity: 1,
      },
    );

    const byFulfillment = await t.query(
      api.admin.fulfillmentItems.listFulfillmentItems,
      { fulfillmentId, limit: 10 },
    );
    expect(byFulfillment[0]?._id).toBe(fulfillmentItemId);

    const byOrderItem = await t.query(
      api.admin.fulfillmentItems.listFulfillmentItems,
      { orderItemId, limit: 10 },
    );
    expect(byOrderItem[0]?._id).toBe(fulfillmentItemId);

    const fulfillmentItem = await t.query(
      api.admin.fulfillmentItems.getFulfillmentItem,
      { fulfillmentItemId },
    );
    expect(fulfillmentItem?.quantity).toBe(1);

    await t.mutation(api.admin.fulfillmentItems.updateFulfillmentItem, {
      fulfillmentItemId,
      quantity: 2,
    });
    const updated = await t.query(
      api.admin.fulfillmentItems.getFulfillmentItem,
      { fulfillmentItemId },
    );
    expect(updated?.quantity).toBe(2);
  });

  test("fulfillment item validation failures", async () => {
    const t = initConvexTest();
    const { orderId } = await createBasicOrder(t);
    const locationId = await t.mutation(api.admin.locations.createLocation, {
      name: "Warehouse",
    });
    const fulfillmentId = await t.mutation(
      api.admin.fulfillments.createFulfillment,
      {
        orderId,
        locationId,
        requiresShipping: true,
      },
    );
    const otherOrderId = await t.run(async (ctx) => {
      return await ctx.db.insert("orders", {
        cartId: await ctx.db.insert("carts", {
          currencyCode: "usd",
          subtotal: 0,
          shippingTotal: 0,
          total: 0,
        }),
        currencyCode: "usd",
        status: "pending",
        paymentStatus: "not_paid",
        total: 0,
      });
    });
    const otherOrderItemId = await t.run(async (ctx) => {
      return await ctx.db.insert("orderItems", {
        orderId: otherOrderId,
        version: 1,
        variantId: await ctx.db.insert("variants", {
          productId: await ctx.db.insert("products", {
            title: "Other Product",
            handle: "other-product",
            status: "published",
            isGiftcard: false,
            discountable: true,
          }),
          title: "Variant",
          allowBackorder: false,
          manageInventory: true,
          variantRank: 0,
        }),
        quantity: 1,
        unitPrice: 100,
        fulfilledQuantity: 0,
        deliveredQuantity: 0,
        shippedQuantity: 0,
        returnRequestedQuantity: 0,
        returnReceivedQuantity: 0,
        returnDismissedQuantity: 0,
        writtenOffQuantity: 0,
      });
    });

    await expect(async () => {
      await t.mutation(api.admin.fulfillmentItems.createFulfillmentItem, {
        fulfillmentId,
        orderItemId: otherOrderItemId,
        quantity: 1,
      });
    }).rejects.toThrowError("Order item does not match fulfillment order");

    const orderItemId = await t.run(async (ctx) => {
      return await ctx.db.insert("orderItems", {
        orderId,
        version: 1,
        variantId: await ctx.db.insert("variants", {
          productId: await ctx.db.insert("products", {
            title: "Product",
            handle: "product-2",
            status: "published",
            isGiftcard: false,
            discountable: true,
          }),
          title: "Variant",
          allowBackorder: false,
          manageInventory: true,
          variantRank: 0,
        }),
        quantity: 1,
        unitPrice: 100,
        fulfilledQuantity: 0,
        deliveredQuantity: 0,
        shippedQuantity: 0,
        returnRequestedQuantity: 0,
        returnReceivedQuantity: 0,
        returnDismissedQuantity: 0,
        writtenOffQuantity: 0,
      });
    });

    await expect(async () => {
      await t.mutation(api.admin.fulfillmentItems.createFulfillmentItem, {
        fulfillmentId,
        orderItemId,
        quantity: 0,
      });
    }).rejects.toThrowError("Quantity must be greater than 0");

    const fulfillmentItemId = await t.mutation(
      api.admin.fulfillmentItems.createFulfillmentItem,
      {
        fulfillmentId,
        orderItemId,
        quantity: 1,
      },
    );

    await expect(async () => {
      await t.mutation(api.admin.fulfillmentItems.updateFulfillmentItem, {
        fulfillmentItemId,
        quantity: 0,
      });
    }).rejects.toThrowError("Quantity must be greater than 0");
  });
});

describe("admin fulfillment labels/addresses", () => {
  test("create/get/list/update fulfillment labels and addresses", async () => {
    const t = initConvexTest();
    const { orderId } = await createBasicOrder(t);
    const locationId = await t.mutation(api.admin.locations.createLocation, {
      name: "Warehouse",
    });
    const fulfillmentId = await t.mutation(
      api.admin.fulfillments.createFulfillment,
      {
        orderId,
        locationId,
        requiresShipping: true,
      },
    );

    const labelId = await t.mutation(
      api.admin.fulfillmentLabels.createFulfillmentLabel,
      {
        fulfillmentId,
        trackingNumber: "TRACK",
      },
    );

    const labels = await t.query(
      api.admin.fulfillmentLabels.listFulfillmentLabels,
      {
        fulfillmentId,
        limit: 10,
      },
    );
    expect(labels[0]?._id).toBe(labelId);

    const label = await t.query(
      api.admin.fulfillmentLabels.getFulfillmentLabel,
      {
        fulfillmentLabelId: labelId,
      },
    );
    expect(label?.trackingNumber).toBe("TRACK");

    await t.mutation(api.admin.fulfillmentLabels.updateFulfillmentLabel, {
      fulfillmentLabelId: labelId,
      trackingNumber: "UPDATED",
    });
    const updatedLabel = await t.query(
      api.admin.fulfillmentLabels.getFulfillmentLabel,
      { fulfillmentLabelId: labelId },
    );
    expect(updatedLabel?.trackingNumber).toBe("UPDATED");

    const addressId = await t.mutation(
      api.admin.fulfillmentAddresses.createFulfillmentAddress,
      {
        fulfillmentId,
        firstName: "Ada",
        lastName: "Lovelace",
      },
    );

    const addresses = await t.query(
      api.admin.fulfillmentAddresses.listFulfillmentAddresses,
      { fulfillmentId, limit: 10 },
    );
    expect(addresses[0]?._id).toBe(addressId);

    const address = await t.query(
      api.admin.fulfillmentAddresses.getFulfillmentAddress,
      { fulfillmentAddressId: addressId },
    );
    expect(address?.firstName).toBe("Ada");

    await t.mutation(api.admin.fulfillmentAddresses.updateFulfillmentAddress, {
      fulfillmentAddressId: addressId,
      city: "Testville",
    });
    const updatedAddress = await t.query(
      api.admin.fulfillmentAddresses.getFulfillmentAddress,
      { fulfillmentAddressId: addressId },
    );
    expect(updatedAddress?.city).toBe("Testville");
  });

  test("fulfillment label/address validation failures", async () => {
    const t = initConvexTest();
    const missingFulfillmentId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("fulfillments", {
        orderId: await ctx.db.insert("orders", {
          cartId: await ctx.db.insert("carts", {
            currencyCode: "usd",
            subtotal: 0,
            shippingTotal: 0,
            total: 0,
          }),
          currencyCode: "usd",
          status: "pending",
          paymentStatus: "not_paid",
          total: 0,
        }),
        locationId: await ctx.db.insert("locations", { name: "Temp" }),
        requiresShipping: true,
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.fulfillmentLabels.createFulfillmentLabel, {
        fulfillmentId: missingFulfillmentId,
      });
    }).rejects.toThrowError("Fulfillment not found");

    await expect(async () => {
      await t.mutation(
        api.admin.fulfillmentAddresses.createFulfillmentAddress,
        {
          fulfillmentId: missingFulfillmentId,
        },
      );
    }).rejects.toThrowError("Fulfillment not found");
  });
});

describe("admin order shipping methods", () => {
  test("create/get/list/update order shipping methods", async () => {
    const t = initConvexTest();
    const { orderId } = await createBasicOrder(t);
    const methodId = await t.mutation(
      api.admin.orderShippingMethods.createOrderShippingMethod,
      {
        orderId,
        name: "Standard",
        amount: 500,
        isTaxInclusive: false,
        isCustomAmount: true,
        shippingOptionId: "ship-1",
      },
    );

    const byOrder = await t.query(
      api.admin.orderShippingMethods.listOrderShippingMethods,
      { orderId, limit: 10 },
    );
    expect(byOrder[0]?._id).toBe(methodId);

    const byShippingOption = await t.query(
      api.admin.orderShippingMethods.listOrderShippingMethods,
      { shippingOptionId: "ship-1", limit: 10 },
    );
    expect(byShippingOption[0]?._id).toBe(methodId);

    const method = await t.query(
      api.admin.orderShippingMethods.getOrderShippingMethod,
      { orderShippingMethodId: methodId },
    );
    expect(method?.name).toBe("Standard");

    await t.mutation(api.admin.orderShippingMethods.updateOrderShippingMethod, {
      orderShippingMethodId: methodId,
      amount: 700,
    });
    const updated = await t.query(
      api.admin.orderShippingMethods.getOrderShippingMethod,
      { orderShippingMethodId: methodId },
    );
    expect(updated?.amount).toBe(700);
  });

  test("order shipping method validation failures", async () => {
    const t = initConvexTest();
    const missingOrderId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("orders", {
        cartId: await ctx.db.insert("carts", {
          currencyCode: "usd",
          subtotal: 0,
          shippingTotal: 0,
          total: 0,
        }),
        currencyCode: "usd",
        status: "pending",
        paymentStatus: "not_paid",
        total: 0,
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(
        api.admin.orderShippingMethods.createOrderShippingMethod,
        {
          orderId: missingOrderId,
          name: "Standard",
          amount: 0,
          isTaxInclusive: false,
          isCustomAmount: true,
        },
      );
    }).rejects.toThrowError("Order not found");

    const missingMethodId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("orderShippingMethods", {
        orderId: await ctx.db.insert("orders", {
          cartId: await ctx.db.insert("carts", {
            currencyCode: "usd",
            subtotal: 0,
            shippingTotal: 0,
            total: 0,
          }),
          currencyCode: "usd",
          status: "pending",
          paymentStatus: "not_paid",
          total: 0,
        }),
        name: "Temp",
        amount: 0,
        isTaxInclusive: false,
        isCustomAmount: true,
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(
        api.admin.orderShippingMethods.updateOrderShippingMethod,
        {
          orderShippingMethodId: missingMethodId,
          name: "Nope",
        },
      );
    }).rejects.toThrowError("Order shipping method not found");
  });
});

describe("admin payments and attempts", () => {
  test("create/get/list/update payments and attempts", async () => {
    const t = initConvexTest();
    const { cartId, orderId } = await createBasicOrder(t);
    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      orderId,
      providerId: "stripe",
      status: "awaiting",
      amount: 1200,
      currencyCode: "usd",
      paymentIntentId: "pi_1",
    });

    const byCart = await t.query(api.admin.payments.listPayments, {
      cartId,
      limit: 10,
    });
    expect(byCart[0]?._id).toBe(paymentId);

    const byIntent = await t.query(api.admin.payments.listPayments, {
      paymentIntentId: "pi_1",
      limit: 10,
    });
    expect(byIntent[0]?._id).toBe(paymentId);

    const payment = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(payment?.providerId).toBe("stripe");

    await t.mutation(api.admin.payments.updatePayment, {
      paymentId,
      status: "authorized",
    });
    const updated = await t.query(api.admin.payments.getPayment, { paymentId });
    expect(updated?.status).toBe("authorized");

    const attemptId = await t.mutation(
      api.admin.paymentAttempts.createPaymentAttempt,
      {
        paymentId,
        status: "created",
      },
    );

    const byPayment = await t.query(
      api.admin.paymentAttempts.listPaymentAttempts,
      {
        paymentId,
        limit: 10,
      },
    );
    expect(byPayment[0]?._id).toBe(attemptId);

    const attempt = await t.query(api.admin.paymentAttempts.getPaymentAttempt, {
      paymentAttemptId: attemptId,
    });
    expect(attempt?.status).toBe("created");

    await t.mutation(api.admin.paymentAttempts.updatePaymentAttempt, {
      paymentAttemptId: attemptId,
      status: "succeeded",
    });
    const updatedAttempt = await t.query(
      api.admin.paymentAttempts.getPaymentAttempt,
      { paymentAttemptId: attemptId },
    );
    expect(updatedAttempt?.status).toBe("succeeded");
  });

  test("payment validation failures", async () => {
    const t = initConvexTest();
    const { cartId, orderId } = await createBasicOrder(t);
    const otherOrderId = await t.run(async (ctx) => {
      return await ctx.db.insert("orders", {
        cartId: await ctx.db.insert("carts", {
          currencyCode: "usd",
          subtotal: 0,
          shippingTotal: 0,
          total: 0,
        }),
        currencyCode: "usd",
        status: "pending",
        paymentStatus: "not_paid",
        total: 0,
      });
    });

    await expect(async () => {
      await t.mutation(api.admin.payments.createPayment, {
        cartId,
        orderId: otherOrderId,
        providerId: "stripe",
        status: "awaiting",
        amount: 100,
        currencyCode: "usd",
      });
    }).rejects.toThrowError("Order does not match cart");

    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      orderId,
      providerId: "stripe",
      status: "awaiting",
      amount: 100,
      currencyCode: "usd",
    });

    await expect(async () => {
      await t.mutation(api.admin.payments.updatePayment, {
        paymentId,
        orderId: otherOrderId,
      });
    }).rejects.toThrowError("Order does not match cart");

    const missingPaymentId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("payments", {
        cartId,
        providerId: "stripe",
        status: "awaiting",
        amount: 100,
        currencyCode: "usd",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.payments.updatePayment, {
        paymentId: missingPaymentId,
        status: "completed",
      });
    }).rejects.toThrowError("Payment not found");
  });

  test("payment attempt validation failures", async () => {
    const t = initConvexTest();
    const { cartId } = await createBasicOrder(t);
    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      providerId: "stripe",
      status: "awaiting",
      amount: 100,
      currencyCode: "usd",
    });

    const missingPaymentId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("payments", {
        cartId,
        providerId: "stripe",
        status: "awaiting",
        amount: 100,
        currencyCode: "usd",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.paymentAttempts.createPaymentAttempt, {
        paymentId: missingPaymentId,
        status: "created",
      });
    }).rejects.toThrowError("Payment not found");

    const attemptId = await t.mutation(
      api.admin.paymentAttempts.createPaymentAttempt,
      {
        paymentId,
        status: "created",
      },
    );

    await expect(async () => {
      await t.mutation(api.admin.paymentAttempts.updatePaymentAttempt, {
        paymentAttemptId: attemptId,
        paymentId: missingPaymentId,
      });
    }).rejects.toThrowError("Payment not found");

    const missingAttemptId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("paymentAttempts", {
        paymentId,
        status: "created",
        createdAt: Date.now(),
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.paymentAttempts.updatePaymentAttempt, {
        paymentAttemptId: missingAttemptId,
        status: "failed",
      });
    }).rejects.toThrowError("Payment attempt not found");
  });
});

describe("admin refunds", () => {
  test("create/get/list/update/delete refunds", async () => {
    const t = initConvexTest();
    const { cartId } = await createBasicOrder(t);
    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      providerId: "stripe",
      status: "awaiting",
      amount: 200,
      currencyCode: "usd",
    });
    const refundReasonId = await t.mutation(
      api.admin.refundReasons.createRefundReason,
      {
        code: "damaged",
        label: "Damaged",
      },
    );

    const refundId = await t.mutation(api.admin.refunds.createRefund, {
      paymentId,
      amount: 100,
      refundReasonId,
    });

    const byPayment = await t.query(api.admin.refunds.listRefunds, {
      paymentId,
      limit: 10,
    });
    expect(byPayment[0]?._id).toBe(refundId);

    const refund = await t.query(api.admin.refunds.getRefund, { refundId });
    expect(refund?.amount).toBe(100);

    await t.mutation(api.admin.refunds.updateRefund, {
      refundId,
      amount: 120,
    });
    const updated = await t.query(api.admin.refunds.getRefund, { refundId });
    expect(updated?.amount).toBe(120);

    await t.mutation(api.admin.refunds.deleteRefund, { refundId });
    const deleted = await t.query(api.admin.refunds.getRefund, { refundId });
    expect(deleted).toBeNull();
  });

  test("refund validation failures", async () => {
    const t = initConvexTest();
    const { cartId } = await createBasicOrder(t);
    const paymentId = await t.mutation(api.admin.payments.createPayment, {
      cartId,
      providerId: "stripe",
      status: "awaiting",
      amount: 200,
      currencyCode: "usd",
    });
    const missingPaymentId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("payments", {
        cartId,
        providerId: "stripe",
        status: "awaiting",
        amount: 200,
        currencyCode: "usd",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.refunds.createRefund, {
        paymentId: missingPaymentId,
        amount: 100,
      });
    }).rejects.toThrowError("Payment not found");

    const missingReasonId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("refundReasons", {
        code: "temp",
        label: "Temp",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.refunds.createRefund, {
        paymentId,
        amount: 100,
        refundReasonId: missingReasonId,
      });
    }).rejects.toThrowError("Refund reason not found");

    const refundId = await t.mutation(api.admin.refunds.createRefund, {
      paymentId,
      amount: 100,
    });

    await expect(async () => {
      await t.mutation(api.admin.refunds.updateRefund, {
        refundId,
        paymentId: missingPaymentId,
      });
    }).rejects.toThrowError("Payment not found");

    await expect(async () => {
      await t.mutation(api.admin.refunds.updateRefund, {
        refundId,
        refundReasonId: missingReasonId,
      });
    }).rejects.toThrowError("Refund reason not found");

    const missingRefundId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("refunds", {
        paymentId,
        amount: 10,
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.refunds.deleteRefund, {
        refundId: missingRefundId,
      });
    }).rejects.toThrowError("Refund not found");
  });
});

describe("admin refund reasons", () => {
  test("create/get/list/update/delete refund reasons", async () => {
    const t = initConvexTest();
    const reasonId = await t.mutation(
      api.admin.refundReasons.createRefundReason,
      {
        code: "damaged",
        label: "Damaged",
      },
    );

    const byCode = await t.query(api.admin.refundReasons.listRefundReasons, {
      code: "damaged",
      limit: 10,
    });
    expect(byCode[0]?._id).toBe(reasonId);

    const reason = await t.query(api.admin.refundReasons.getRefundReason, {
      refundReasonId: reasonId,
    });
    expect(reason?.label).toBe("Damaged");

    await t.mutation(api.admin.refundReasons.updateRefundReason, {
      refundReasonId: reasonId,
      label: "Updated",
    });
    const updated = await t.query(api.admin.refundReasons.getRefundReason, {
      refundReasonId: reasonId,
    });
    expect(updated?.label).toBe("Updated");

    await t.mutation(api.admin.refundReasons.deleteRefundReason, {
      refundReasonId: reasonId,
    });
    const deleted = await t.query(api.admin.refundReasons.getRefundReason, {
      refundReasonId: reasonId,
    });
    expect(deleted).toBeNull();
  });

  test("refund reason validation failures", async () => {
    const t = initConvexTest();
    const missingReasonId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("refundReasons", {
        code: "temp",
        label: "Temp",
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.refundReasons.updateRefundReason, {
        refundReasonId: missingReasonId,
        label: "Nope",
      });
    }).rejects.toThrowError("Refund reason not found");

    await expect(async () => {
      await t.mutation(api.admin.refundReasons.deleteRefundReason, {
        refundReasonId: missingReasonId,
      });
    }).rejects.toThrowError("Refund reason not found");
  });
});
