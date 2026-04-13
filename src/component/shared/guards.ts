import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { UserIdentity } from "convex/server";
import type { Doc, Id, TableNames } from "../_generated/dataModel";

type AuthCtx = QueryCtx | MutationCtx;

type IdentityWithClaims = UserIdentity & {
  role?: unknown;
  roles?: unknown;
  customClaims?: {
    role?: unknown;
    roles?: unknown;
  };
};

export async function requireDoc<TableName extends TableNames>(
  ctx: QueryCtx | MutationCtx,
  table: TableName,
  id: Id<TableName>,
  message: string,
): Promise<Doc<TableName>> {
  const doc = await ctx.db.get(table, id);
  if (!doc) {
    throw new Error(message);
  }
  return doc;
}

export async function requireIdentity(
  ctx: QueryCtx | MutationCtx,
  message: string = "Unauthorized",
): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error(message);
  }
  return identity;
}

export function isAdminIdentity(identity: UserIdentity | null): boolean {
  if (!identity) {
    return false;
  }

  const claims = identity as IdentityWithClaims;
  const roleValues = [
    claims.role,
    claims.roles,
    claims.customClaims?.role,
    claims.customClaims?.roles,
  ];

  return roleValues.some((value) => {
    if (value === "admin") {
      return true;
    }
    return Array.isArray(value) && value.includes("admin");
  });
}

export async function requireAdmin(
  ctx: AuthCtx,
  message: string = "Forbidden",
): Promise<UserIdentity> {
  const identity = await requireIdentity(ctx);
  if (!isAdminIdentity(identity)) {
    throw new Error(message);
  }
  return identity;
}

async function getCurrentCustomer(ctx: AuthCtx, identity: UserIdentity) {
  const customerByTokenIdentifier = await ctx.db
    .query("customers")
    .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
    .first();
  if (customerByTokenIdentifier) {
    return customerByTokenIdentifier;
  }

  return await ctx.db
    .query("customers")
    .withIndex("by_user", (q) => q.eq("userId", identity.subject))
    .first();
}

async function requireOwnedCustomer(
  ctx: AuthCtx,
  customerId: Id<"customers">,
  message: string,
) {
  const identity = await requireIdentity(ctx);
  if (isAdminIdentity(identity)) {
    return;
  }

  const customer = await getCurrentCustomer(ctx, identity);
  if (!customer || customer._id !== customerId) {
    throw new Error(message);
  }
}

export async function requireCustomerAccess(
  ctx: AuthCtx,
  customerId: Id<"customers">,
  message: string = "Forbidden",
): Promise<Doc<"customers">> {
  const customer = await requireDoc(
    ctx,
    "customers",
    customerId,
    "Customer not found",
  );
  await requireOwnedCustomer(ctx, customerId, message);
  return customer;
}

export async function requireCartAccess(
  ctx: AuthCtx,
  cartId: Id<"carts">,
  message: string = "Forbidden",
): Promise<Doc<"carts">> {
  const cart = await requireDoc(ctx, "carts", cartId, "Cart not found");
  if (cart.customerId) {
    await requireOwnedCustomer(ctx, cart.customerId, message);
  } else {
    await requireIdentity(ctx);
  }
  return cart;
}

export async function requireOrderAccess(
  ctx: AuthCtx,
  orderId: Id<"orders">,
  message: string = "Forbidden",
): Promise<Doc<"orders">> {
  const order = await requireDoc(ctx, "orders", orderId, "Order not found");
  if (order.customerId) {
    await requireOwnedCustomer(ctx, order.customerId, message);
  } else {
    await requireIdentity(ctx);
  }
  return order;
}
