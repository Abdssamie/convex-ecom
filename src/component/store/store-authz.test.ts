import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { createConvexTest, makeIdentity } from "../setup.test";

describe("store authz", () => {
  test("customer can only access own cart and order", async () => {
    const base = createConvexTest();
    const admin = base.withIdentity(
      makeIdentity("admin-user", { role: "admin", roles: ["admin"] }),
    );
    const userA = base.withIdentity(makeIdentity("user-a"));
    const userB = base.withIdentity(makeIdentity("user-b"));

    const productId = await admin.mutation(api.admin.products.createProduct, {
      product: {
        title: "Authz Product",
        handle: "authz-product",
        status: "published",
        isGiftcard: false,
        discountable: true,
      },
    });
    const variantId = await admin.mutation(api.admin.variants.createVariant, {
      variant: {
        productId,
        title: "Default",
        allowBackorder: false,
        manageInventory: true,
        variantRank: 0,
      },
    });
    await admin.mutation(api.admin.prices.createPrice, {
      price: {
        variantId,
        currencyCode: "usd",
        amount: 1200,
        priceListId: null,
      },
    });

    const customerAId = await admin.mutation(
      api.admin.customers.createCustomer,
      {
        userId: makeIdentity("user-a").tokenIdentifier,
        email: "user-a@example.com",
        hasAccount: true,
      },
    );
    const customerBId = await admin.mutation(
      api.admin.customers.createCustomer,
      {
        userId: makeIdentity("user-b").tokenIdentifier,
        email: "user-b@example.com",
        hasAccount: true,
      },
    );

    const cartAId = await userA.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "user-a@example.com",
    });
    await userA.mutation(api.store.carts.setCustomer, {
      cartId: cartAId,
      customerId: customerAId,
    });
    await userA.mutation(api.store.carts.addItem, {
      cartId: cartAId,
      variantId,
      quantity: 1,
    });
    await userA.mutation(api.store.addresses.createOrderAddress, {
      role: "shipping",
      cartId: cartAId,
      firstName: "User",
      lastName: "A",
      address1: "1 Main St",
      city: "Testville",
      countryCode: "US",
      postalCode: "11111",
    });

    const cartBId = await userB.mutation(api.store.carts.createCart, {
      currencyCode: "usd",
      email: "user-b@example.com",
    });
    await userB.mutation(api.store.carts.setCustomer, {
      cartId: cartBId,
      customerId: customerBId,
    });
    const cartBItemId = await userB.mutation(api.store.carts.addItem, {
      cartId: cartBId,
      variantId,
      quantity: 1,
    });
    await userB.mutation(api.store.addresses.createOrderAddress, {
      role: "shipping",
      cartId: cartBId,
      firstName: "User",
      lastName: "B",
      address1: "2 Main St",
      city: "Testville",
      countryCode: "US",
      postalCode: "22222",
    });

    const orderAId = await userA.mutation(
      api.store.orders.createOrderFromCart,
      {
        cartId: cartAId,
      },
    );
    const orderBId = await userB.mutation(
      api.store.orders.createOrderFromCart,
      {
        cartId: cartBId,
      },
    );

    const ownOrder = await userA.query(api.store.orders.getOrder, {
      orderId: orderAId,
    });
    expect(ownOrder?.order.customerId).toBe(customerAId);

    await expect(async () => {
      await userA.query(api.store.carts.getCart, { cartId: cartBId });
    }).rejects.toThrowError("Forbidden");

    await expect(async () => {
      await userA.mutation(api.store.carts.updateItem, {
        cartItemId: cartBItemId,
        quantity: 2,
      });
    }).rejects.toThrowError("Forbidden");

    await expect(async () => {
      await userA.query(api.store.orders.getOrder, { orderId: orderBId });
    }).rejects.toThrowError("Forbidden");

    await expect(async () => {
      await userA.mutation(api.store.orders.setOrderStatus, {
        orderId: orderBId,
        status: "canceled",
      });
    }).rejects.toThrowError("Forbidden");

    await expect(async () => {
      await userA.query(api.store.orders.listOrdersByCustomer, {
        customerId: customerBId,
        paginationOpts: { numItems: 10, cursor: null },
      });
    }).rejects.toThrowError("Forbidden");

    const ownOrders = await userA.query(api.store.orders.listOrdersByCustomer, {
      customerId: customerAId,
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(ownOrders.page).toHaveLength(1);
    expect(ownOrders.page[0]?._id).toBe(orderAId);
  });
});
