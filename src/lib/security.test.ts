import { describe, expect, it } from "vitest";

import { containsOnlyExpectedCoursePrice } from "@/lib/payment-validation";
import { safeInternalRedirect } from "@/lib/safe-redirect";

describe("safeInternalRedirect", () => {
  it("accepts paths on the application origin", () => {
    expect(safeInternalRedirect("/account?tab=billing#orders")).toBe("/account?tab=billing#orders");
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\\\evil.example",
    "/%5c%5cevil.example",
    "account",
  ])("rejects an unsafe redirect: %s", (value) => {
    expect(safeInternalRedirect(value)).toBeUndefined();
  });
});

describe("containsOnlyExpectedCoursePrice", () => {
  it("accepts one unit of the configured price", () => {
    expect(
      containsOnlyExpectedCoursePrice([{ price: { id: "pri_course" }, quantity: 1 }], "pri_course"),
    ).toBe(true);
  });

  it.each([
    undefined,
    [],
    [{ price: { id: "pri_other" }, quantity: 1 }],
    [{ price: { id: "pri_course" }, quantity: 2 }],
    [
      { price: { id: "pri_course" }, quantity: 1 },
      { price: { id: "pri_other" }, quantity: 1 },
    ],
  ])("rejects a transaction that is not exactly the course item", (items) => {
    expect(containsOnlyExpectedCoursePrice(items, "pri_course")).toBe(false);
  });
});
