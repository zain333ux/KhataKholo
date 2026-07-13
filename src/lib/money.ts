const moneyFormatter = new Intl.NumberFormat("en-PK");
export const MAX_MONEY_PAISA = 2_000_000_000;

export function rupeesToPaisa(value: FormDataEntryValue | string | number | null): number {
  const text = String(value ?? "").trim().replace(/,/g, "");

  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    return Number.NaN;
  }

  const [rupees, paisa = ""] = text.split(".");
  const paddedPaisa = paisa.padEnd(2, "0");

  return Number(rupees) * 100 + Number(paddedPaisa);
}

export function paisaToRupees(amountPaisa: number): string {
  const sign = amountPaisa < 0 ? "-" : "";
  const absolute = Math.abs(amountPaisa);
  const rupees = Math.floor(absolute / 100);
  const paisa = absolute % 100;

  if (paisa === 0) {
    return `${sign}${moneyFormatter.format(rupees)}`;
  }

  return `${sign}${moneyFormatter.format(rupees)}.${paisa.toString().padStart(2, "0")}`;
}

export function formatRupees(amountPaisa: number): string {
  return `Rs. ${paisaToRupees(amountPaisa)}`;
}

export function assertPositiveMoney(amountPaisa: number, label = "Amount"): string | null {
  if (!Number.isInteger(amountPaisa) || amountPaisa <= 0) {
    return `${label} must be greater than zero.`;
  }

  if (amountPaisa > MAX_MONEY_PAISA) {
    return `${label} is too large.`;
  }

  return null;
}
