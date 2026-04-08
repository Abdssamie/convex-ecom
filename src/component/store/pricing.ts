import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export async function getBasePriceForVariant(
  ctx: QueryCtx | MutationCtx,
  variantId: Id<"variants">,
  currencyCode: string,
  priceListId?: Id<"priceLists">,
  isPriceListActive?: boolean,
): Promise<Doc<"prices"> | null> {
  if (priceListId) {
    let isActive = isPriceListActive;
    if (isActive === undefined) {
      const priceList = await ctx.db.get(priceListId);
      if (priceList) {
        const now = Date.now();
        isActive =
          priceList.status === "active" &&
          (priceList.startsAt === undefined || now >= priceList.startsAt) &&
          (priceList.endsAt === undefined || now <= priceList.endsAt);
      } else {
        isActive = false;
      }
    }

    if (isActive) {
        const listPrice = await ctx.db
          .query("prices")
          .withIndex("by_variant_currency_and_price_list_id", (q) =>
            q
              .eq("variantId", variantId)
              .eq("currencyCode", currencyCode)
              .eq("priceListId", priceListId),
          )
          .first();
        if (listPrice) {
          return listPrice;
        }
      }
  }

  return await ctx.db
    .query("prices")
    .withIndex("by_variant_currency_and_price_list_id", (q) =>
      q
        .eq("variantId", variantId)
        .eq("currencyCode", currencyCode)
        .eq("priceListId", null),
    )
    .first();
}
