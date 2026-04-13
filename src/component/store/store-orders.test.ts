import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { initConvexTest } from "../setup.test";

async function createCartWithItem(
  t: ReturnType<typeof initConvexTest>,
  options?: { priceListId?: Id<"priceLists"> },
) {
  const productId = await t.mutation(api.admin.products.createProduct, {
    product: {
      title: "Checkout Product",
      handle: `checkout-product-${Math.random()}`,
      status: "published",
      isGiftcard: false,
      discountable: true,
    },
  });
  const variantId = await t.mutation(api.admin.variants.createVariant, {
    variant: {
      productId,
      title: "Default Variant",
      sku: `checkout-sku-${Math.random()}`,
      barcode: "checkout-barcode",
      allowBackorder: false,
      manageInventory: true,
      variantRank: 0,
    },
  });
  await t.mutation(api.admin.prices.createPrice, {
    price: {
      variantId,
      currencyCode: "usd",
      amount: 1200,
      priceListId: null,
    },
  });
  if (options?.priceListId) {
    await t.mutation(api.admin.prices.createPrice, {
      price: {
        variantId,
        currencyCode: "usd",
        amount: 900,
        priceListId: options.priceListId,
      },
    });
  }

  const cartId = await t.mutation(api.store.carts.createCart, {
    currencyCode: "usd",
    email: "checkout@example.com",
    ...(options?.priceListId ? { priceListId: options.priceListId } : {}),
  });

  await t.mutation(api.store.carts.addItem, {
    cartId,
    variantId,
    quantity: 1,
  });

  return { cartId, variantId };
}

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

  test("create order rejects cart when linked price list expired before checkout", async () => {
    const t = initConvexTest();
    const priceListId = await t.mutation(api.admin.priceLists.createPriceList, {
      priceList: {
        title: "Flash Sale",
        description: "Short lived",
        status: "active",
        type: "sale",
      },
    });

    const { cartId } = await createCartWithItem(t, { priceListId });
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

    await t.mutation(api.admin.priceLists.updatePriceList, {
      priceListId,
      endsAt: Date.now() - 1,
    });

    await expect(async () => {
      await t.mutation(api.store.orders.createOrderFromCart, { cartId });
    }).rejects.toThrowError("Price list has expired");
  });

  test("create order requires shipping address", async () => {
    const t = initConvexTest();
    const { cartId } = await createCartWithItem(t);

    await t.mutation(api.store.addresses.createOrderAddress, {
      role: "billing",
      cartId,
      firstName: "Ada",
      lastName: "Lovelace",
      address1: "123 Main",
      city: "Testville",
      countryCode: "US",
      postalCode: "12345",
    });

    await expect(async () => {
      await t.mutation(api.store.orders.createOrderFromCart, { cartId });
    }).rejects.toThrowError("Shipping address is required to create an order");
  });

  test("create order rejects incomplete address fields", async () => {
    const t = initConvexTest();
    const { cartId } = await createCartWithItem(t);

    await t.mutation(api.store.addresses.createOrderAddress, {
      role: "shipping",
      cartId,
      firstName: "Ada",
      lastName: "Lovelace",
      city: "Testville",
      countryCode: "US",
      postalCode: "12345",
    });

    await expect(async () => {
      await t.mutation(api.store.orders.createOrderFromCart, { cartId });
    }).rejects.toThrowError(
      "shipping address address1 is required to create an order",
    );
  });

  test("list orders by customer paginates consistently", async () => {
    const t = initConvexTest();
    const customerId = await t.mutation(api.admin.customers.createCustomer, {
      userId: "paged-customer",
      email: "paged@example.com",
      hasAccount: true,
    });

    const orderIds = [];
    for (let index = 0; index < 3; index += 1) {
      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert("orders", {
          customerId,
          cartId: await ctx.db.insert("carts", {
            customerId,
            currencyCode: "usd",
            subtotal: 0,
            shippingTotal: 0,
            total: 0,
          }),
          currencyCode: "usd",
          status: "pending",
          paymentStatus: "not_paid",
          total: index,
        });
      });
      orderIds.push(orderId);
    }

    const firstPage = await t.query(api.store.orders.listOrdersByCustomer, {
      customerId,
      paginationOpts: { numItems: 2, cursor: null },
    });
    const secondPage = await t.query(api.store.orders.listOrdersByCustomer, {
      customerId,
      paginationOpts: { numItems: 2, cursor: firstPage.continueCursor },
    });

    expect(firstPage.page).toHaveLength(2);
    expect(secondPage.page).toHaveLength(1);
    expect(firstPage.page[0]?._id).toBe(orderIds[2]);
    expect(firstPage.page[1]?._id).toBe(orderIds[1]);
    expect(secondPage.page[0]?._id).toBe(orderIds[0]);
  });
});
