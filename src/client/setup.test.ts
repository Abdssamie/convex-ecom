/// <reference types="vite/client" />
import { test } from "vitest";
import { convexTest } from "convex-test";
export const modules = import.meta.glob("./**/*.*s");

import {
  defineSchema,
  type GenericSchema,
  type SchemaDefinition,
  type UserIdentity,
} from "convex/server";
import { type ComponentApi } from "../component/_generated/component";
import { componentsGeneric } from "convex/server";
import { register } from "../test";

export function initConvexTest<
  Schema extends SchemaDefinition<GenericSchema, boolean>,
>(schema?: Schema, identity?: UserIdentity) {
  const base = convexTest(schema ?? defineSchema({}), modules);
  register(base);
  if (!identity) {
    return base;
  }
  const subject = identity.subject ?? "" + JSON.stringify(identity);
  const issuer = identity.issuer ?? "https://convex.test";
  const tokenIdentifier = identity.tokenIdentifier ?? `${issuer}|${subject}`;
  return base.withIdentity({
    ...identity,
    subject,
    issuer,
    tokenIdentifier,
  });
}
export const components = componentsGeneric() as unknown as {
  convexEcommerce: ComponentApi;
};

test("setup", () => {});
