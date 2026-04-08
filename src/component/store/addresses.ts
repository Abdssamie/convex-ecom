import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireDoc } from "../shared/guards";
import { addressRoleValidator } from "../shared/validators";

export const createOrderAddress = mutation({
  args: {
    role: addressRoleValidator,
    cartId: v.id("carts"),
    orderId: v.optional(v.id("orders")),
    customerId: v.optional(v.id("customers")),
    company: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    address1: v.optional(v.string()),
    address2: v.optional(v.string()),
    city: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    province: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("orderAddresses"),
  handler: async (ctx, args) => {
    const cart = await requireDoc(ctx, "carts", args.cartId, "Cart not found");
    if (cart.completedAt !== undefined) {
      throw new Error("Cart already completed");
    }

    if (args.orderId) {
      const order = await requireDoc(
        ctx,
        "orders",
        args.orderId,
        "Order not found",
      );
      if (order.cartId !== args.cartId) {
        throw new Error("Order does not match cart");
      }
    }

    if (args.customerId) {
      await requireDoc(ctx, "customers", args.customerId, "Customer not found");
    }

    // Guard against duplicate role for the same cart
    const existing = await ctx.db
      .query("orderAddresses")
      .withIndex("by_cart_id", (q) => q.eq("cartId", args.cartId))
      .filter((q) => q.eq(q.field("role"), args.role))
      .first();
    if (existing) {
      throw new Error(
        `An address with role "${args.role}" already exists for this cart`,
      );
    }

    return await ctx.db.insert("orderAddresses", {
      role: args.role,
      cartId: args.cartId,
      orderId: args.orderId,
      customerId: args.customerId,
      company: args.company,
      firstName: args.firstName,
      lastName: args.lastName,
      address1: args.address1,
      address2: args.address2,
      city: args.city,
      countryCode: args.countryCode,
      province: args.province,
      postalCode: args.postalCode,
      phone: args.phone,
      metadata: args.metadata,
    });
  },
});
