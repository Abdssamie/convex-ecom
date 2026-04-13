import { httpRouter } from "convex/server";
import { components, internal } from "./_generated/api";
import { registerRoutes } from "@convex-dev/stripe";

const http = httpRouter();

// Register Stripe webhook handler at /stripe/webhook
registerRoutes(http, components.stripe as any, {
  webhookPath: "/stripe/webhook",
  events: {
    "payment_intent.succeeded": async (ctx, event) => {
      const intent = event.data.object as {
        id: string;
        amount: number;
        currency: string;
        metadata?: { paymentId?: string };
      };
      await ctx.runMutation(
        // @ts-expect-error - stripeWebhooks not exposed in component API
        internal.store.stripeWebhooks.handleStripePaymentIntent,
        {
          paymentIntentId: intent.id,
          paymentId: intent.metadata?.paymentId,
          status: "succeeded",
          amount: intent.amount,
          currency: intent.currency,
        },
      );
    },
    "payment_intent.payment_failed": async (ctx, event) => {
      const intent = event.data.object as {
        id: string;
        amount: number;
        currency: string;
        metadata?: { paymentId?: string };
      };
      await ctx.runMutation(
        // @ts-expect-error - stripeWebhooks not exposed in component API
        internal.store.stripeWebhooks.handleStripePaymentIntent,
        {
          paymentIntentId: intent.id,
          paymentId: intent.metadata?.paymentId,
          status: "payment_failed",
          amount: intent.amount,
          currency: intent.currency,
        },
      );
    },
    "payment_intent.canceled": async (ctx, event) => {
      const intent = event.data.object as {
        id: string;
        amount: number;
        currency: string;
        metadata?: { paymentId?: string };
      };
      await ctx.runMutation(
        // @ts-expect-error - stripeWebhooks not exposed in component API
        internal.store.stripeWebhooks.handleStripePaymentIntent,
        {
          paymentIntentId: intent.id,
          paymentId: intent.metadata?.paymentId,
          status: "canceled",
          amount: intent.amount,
          currency: intent.currency,
        },
      );
    },
    "charge.refunded": async (ctx, event) => {
      const charge = event.data.object as {
        amount_refunded: number;
        currency: string;
        payment_intent?: string | null;
        metadata?: { paymentId?: string };
      };
      if (!charge.payment_intent) {
        return;
      }
      await ctx.runMutation(
        // @ts-expect-error - stripeWebhooks not exposed in component API
        internal.store.stripeWebhooks.handleStripeRefund,
        {
          paymentIntentId: charge.payment_intent,
          paymentId: charge.metadata?.paymentId,
          amountRefunded: charge.amount_refunded,
          currency: charge.currency,
        },
      );
    },
  },
});

export default http;
