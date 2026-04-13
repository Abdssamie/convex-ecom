/// <reference types="vite/client" />
import { test } from "vitest";
import schema from "./schema";
import { convexTest } from "convex-test";
import stripeSchema from "../../node_modules/@convex-dev/stripe/src/component/schema.js";
export const modules = import.meta.glob("./**/*.*s");
const stripeModules = import.meta.glob(
  "../../node_modules/@convex-dev/stripe/src/component/**/*.*s",
);

const issuer = "https://example.com";

export function makeIdentity(
  subject: string,
  claims?: Record<string, unknown>,
) {
  return {
    tokenIdentifier: `${issuer}|${subject}`,
    subject,
    issuer,
    ...claims,
  };
}

export function createConvexTest() {
  return convexTest(schema, modules);
}

export function registerStripeTestComponent(
  t: ReturnType<typeof createConvexTest>,
) {
  t.registerComponent("stripe", stripeSchema, stripeModules);
}

export function initConvexTest() {
  const t = createConvexTest();
  return t.withIdentity(
    makeIdentity("admin-user", { role: "admin", roles: ["admin"] }),
  );
}
test("setup", () => {});
