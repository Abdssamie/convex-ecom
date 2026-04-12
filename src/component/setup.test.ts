/// <reference types="vite/client" />
import { test } from "vitest";
import schema from "./schema";
import { convexTest } from "convex-test";
export const modules = import.meta.glob("./**/*.*s");

export function initConvexTest() {
  const t = convexTest(schema, modules);
  return t.withIdentity({
    tokenIdentifier: "https://example.com|test-user",
    subject: "test-user",
    issuer: "https://example.com",
  });
}
test("setup", () => {});
