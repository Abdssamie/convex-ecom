import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("store orders", () => {
  test("list orders by customer and set status", async () => {
    const t = initConvexTest();
    const customerId = await t.mutation(api.admin.customers.createCustomer, {
      userId: "cust-1",
      email: "cust@example.com",
      hasAccount: true,
    });

    const otherCustomerId = await t.mutation(
      api.admin.customers.createCustomer,
      {
        userId: "cust-2",
        email: "cust2@example.com",
        hasAccount: true,
      },
    );

    const orderId = await t.run(async (ctx) => {
      return await ctx.db.insert("orders", {
        customerId,
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

    await t.run(async (ctx) => {
      await ctx.db.insert("orders", {
        customerId: otherCustomerId,
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

    const list = await t.query(api.store.orders.listOrdersByCustomer, {
      customerId,
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(list.page).toHaveLength(1);
    expect(list.page[0]?._id).toBe(orderId);

    await t.mutation(api.store.orders.setOrderStatus, {
      orderId,
      status: "canceled",
    });
    const order = await t.query(api.store.orders.getOrder, { orderId });
    expect(order?.order.status).toBe("canceled");
    expect(order?.order.canceledAt).toBeDefined();
  });

  test("set order status validation failure", async () => {
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
      await t.mutation(api.store.orders.setOrderStatus, {
        orderId: missingOrderId,
        status: "completed",
      });
    }).rejects.toThrowError("Order not found");
  });
});
