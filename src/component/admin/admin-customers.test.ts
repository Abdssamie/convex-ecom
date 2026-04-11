import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { initConvexTest } from "../setup.test";

describe("admin customers", () => {
  test("create/get/list/update customers", async () => {
    const t = initConvexTest();
    const customerId = await t.mutation(api.admin.customers.createCustomer, {
      userId: "user-1",
      email: "ada@example.com",
      hasAccount: true,
    });

    const byUser = await t.query(api.admin.customers.listCustomers, {
      paginationOpts: { numItems: 10, cursor: null },
      userId: "user-1",
    });
    expect(byUser.page[0]?._id).toBe(customerId);

    const byEmail = await t.query(api.admin.customers.listCustomers, {
      paginationOpts: { numItems: 10, cursor: null },
      email: "ada@example.com",
    });
    expect(byEmail.page[0]?._id).toBe(customerId);

    const customer = await t.query(api.admin.customers.getCustomer, {
      customerId,
    });
    expect(customer?.email).toBe("ada@example.com");

    await t.mutation(api.admin.customers.updateCustomer, {
      customerId,
      firstName: "Ada",
    });
    const updated = await t.query(api.admin.customers.getCustomer, {
      customerId,
    });
    expect(updated?.firstName).toBe("Ada");
  });

  test("customer validation failures", async () => {
    const t = initConvexTest();
    await t.mutation(api.admin.customers.createCustomer, {
      userId: "dup",
      hasAccount: false,
    });

    await expect(async () => {
      await t.mutation(api.admin.customers.createCustomer, {
        userId: "dup",
        hasAccount: true,
      });
    }).rejects.toThrowError("Customer with this userId already exists");

    const missingId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("customers", {
        userId: "temp",
        hasAccount: false,
      });
      await ctx.db.delete(id);
      return id;
    });

    await expect(async () => {
      await t.mutation(api.admin.customers.updateCustomer, {
        customerId: missingId,
        firstName: "Nope",
      });
    }).rejects.toThrowError("Customer not found");
  });
});
