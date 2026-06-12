export type SplitShare = {
  roommateId: string;
  sharePaisa: number;
};

export function calculateEqualShares(totalPaisa: number, roommateIds: string[]): SplitShare[] {
  if (!Number.isInteger(totalPaisa) || totalPaisa <= 0) {
    throw new Error("Total amount must be greater than zero.");
  }

  if (roommateIds.length === 0) {
    throw new Error("Select at least one roommate.");
  }

  const baseShare = Math.floor(totalPaisa / roommateIds.length);
  const remainder = totalPaisa % roommateIds.length;

  return roommateIds.map((roommateId, index) => ({
    roommateId,
    sharePaisa: baseShare + (index < remainder ? 1 : 0),
  }));
}

export function validateCustomShares(totalPaisa: number, shares: SplitShare[]): string | null {
  if (!Number.isInteger(totalPaisa) || totalPaisa <= 0) {
    return "Total amount must be greater than zero.";
  }

  if (shares.length === 0) {
    return "Select at least one roommate.";
  }

  const invalidShare = shares.find((share) => !Number.isInteger(share.sharePaisa) || share.sharePaisa < 0);
  if (invalidShare) {
    return "Every selected roommate needs a valid share amount.";
  }

  const totalShares = shares.reduce((sum, share) => sum + share.sharePaisa, 0);
  if (totalShares !== totalPaisa) {
    return "Custom shares must add up to the total expense amount.";
  }

  return null;
}

