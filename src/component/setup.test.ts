/// <reference types="vite/client" />
import { test } from "vitest";
import schema from "./schema";
import { convexTest } from "convex-test";
export const modules = import.meta.glob("./**/*.*s");

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

export function initConvexTest() {
  const t = createConvexTest();
  return t.withIdentity(
    makeIdentity("admin-user", { role: "admin", roles: ["admin"] }),
  );
}
test("setup", () => {});
