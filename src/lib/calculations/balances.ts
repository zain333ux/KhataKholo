import type { Balance } from "@/types/app";

export type BalanceTotals = {
  totalOwePaisa: number;
  totalReceivePaisa: number;
  netPaisa: number;
};

export function calculateBalanceTotals(roommateId: string, balances: Balance[]): BalanceTotals {
  const totalOwePaisa = balances
    .filter((balance) => balance.debtor_roommate_id === roommateId)
    .reduce((sum, balance) => sum + balance.amount_paisa, 0);

  const totalReceivePaisa = balances
    .filter((balance) => balance.creditor_roommate_id === roommateId)
    .reduce((sum, balance) => sum + balance.amount_paisa, 0);

  return {
    totalOwePaisa,
    totalReceivePaisa,
    netPaisa: totalReceivePaisa - totalOwePaisa,
  };
}

export function validatePaymentReduction(currentBalancePaisa: number, paymentPaisa: number): string | null {
  if (!Number.isInteger(paymentPaisa) || paymentPaisa <= 0) {
    return "Payment amount must be greater than zero.";
  }

  if (paymentPaisa > currentBalancePaisa) {
    return "Payment cannot be more than the current pending balance.";
  }

  return null;
}

