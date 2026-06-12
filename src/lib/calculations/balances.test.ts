import { describe, expect, it } from "vitest";

import { calculateBalanceTotals, validatePaymentReduction } from "./balances";
import type { Balance } from "../../types/app";

const baseBalance: Balance = {
  id: "balance",
  group_id: "group",
  roommate_one_id: "ali",
  roommate_two_id: "bilal",
  debtor_roommate_id: "bilal",
  creditor_roommate_id: "ali",
  amount_paisa: 30000,
  created_at: "now",
  updated_at: "now",
};

describe("balance helpers", () => {
  it("summarizes what a roommate owes and receives", () => {
    const totals = calculateBalanceTotals("ali", [
      baseBalance,
      {
        ...baseBalance,
        id: "balance-2",
        debtor_roommate_id: "ali",
        creditor_roommate_id: "hamza",
        amount_paisa: 10000,
      },
    ]);

    expect(totals).toEqual({
      totalOwePaisa: 10000,
      totalReceivePaisa: 30000,
      netPaisa: 20000,
    });
  });

  it("rejects overpayment", () => {
    expect(validatePaymentReduction(30000, 50000)).toBe("Payment cannot be more than the current pending balance.");
  });

  it("accepts partial payment", () => {
    expect(validatePaymentReduction(30000, 5000)).toBeNull();
  });
});
