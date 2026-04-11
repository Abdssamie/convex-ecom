export function mapStripeStatus(status: string) {
  switch (status) {
    case "succeeded":
      return "completed" as const;
    case "canceled":
      return "canceled" as const;
    case "payment_failed":
      return "failed" as const;
    case "processing":
    case "requires_action":
    case "requires_confirmation":
    case "requires_payment_method":
      return "awaiting" as const;
    case "requires_capture":
      return "authorized" as const;
    default:
      return "awaiting" as const;
  }
}
