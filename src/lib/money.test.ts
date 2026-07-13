import { describe, expect, it } from "vitest";

import { assertPositiveMoney, MAX_MONEY_PAISA, rupeesToPaisa } from "./money";

describe("money validation", () => {
  it("rejects values that exceed the database integer range", () => {
    expect(assertPositiveMoney(MAX_MONEY_PAISA + 1)).toBe("Amount is too large.");
  });

  it("accepts normal positive amounts", () => {
    expect(assertPositiveMoney(rupeesToPaisa("900.50"))).toBeNull();
  });
});
