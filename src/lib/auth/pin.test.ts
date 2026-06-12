import { describe, expect, it } from "vitest";

import { hashPin, verifyPin } from "./pin";

describe("PIN hashing", () => {
  it("verifies the correct PIN", async () => {
    const hash = await hashPin("123456");

    expect(hash).not.toContain("123456");
    await expect(verifyPin("123456", hash)).resolves.toBe(true);
  });

  it("rejects the wrong PIN", async () => {
    const hash = await hashPin("123456");

    await expect(verifyPin("654321", hash)).resolves.toBe(false);
  });
});

