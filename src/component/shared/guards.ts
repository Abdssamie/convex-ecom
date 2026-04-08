import type { MutationCtx, QueryCtx } from "../_generated/server";
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
