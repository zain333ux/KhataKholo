import { describe, expect, it } from "vitest";

import { validateCloudinaryReceiptReference } from "./cloudinary";

describe("validateCloudinaryReceiptReference", () => {
  it("accepts a matching receipt reference", () => {
    expect(validateCloudinaryReceiptReference(
      "https://res.cloudinary.com/demo/image/upload/v1/khatakholo/receipts/abc.webp",
      "khatakholo/receipts/abc",
      "demo",
    )).toBeNull();
  });

  it("rejects external or incomplete receipt references", () => {
    expect(validateCloudinaryReceiptReference("https://example.com/a.webp", "khatakholo/receipts/abc", "demo"))
      .toBe("Receipt upload URL is invalid.");
    expect(validateCloudinaryReceiptReference("https://res.cloudinary.com/demo/image/upload/a.webp", null, "demo"))
      .toContain("incomplete");
  });
});
