import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { UserIdentity } from "convex/server";
import type { Doc, Id, TableNames } from "../_generated/dataModel";

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
