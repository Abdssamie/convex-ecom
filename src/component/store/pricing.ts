import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireDoc } from "../shared/guards";

export async function getBasePriceForVariant(
  ctx: QueryCtx | MutationCtx,
  variantId: Id<"variants">,
  currencyCode: string,
  priceListId?: Id<"priceLists">,
): Promise<Doc<"prices"> | null> {
  if (priceListId) {
    const priceList = await requireDoc(
      ctx,
      "priceLists",
      priceListId,
      "Price list not found",
    );
    if (priceList.status !== "active") {
      return null;
    }
    const now = Date.now();
    if (priceList.startsAt !== undefined && now < priceList.startsAt) {
      return null;
    }
    if (priceList.endsAt !== undefined && now > priceList.endsAt) {
      return null;
    }

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
