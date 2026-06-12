import { describe, expect, it } from "vitest";

import { calculateEqualShares, validateCustomShares } from "./splits";

describe("split calculations", () => {
  it("splits equally when amount divides cleanly", () => {
    expect(calculateEqualShares(90000, ["ali", "bilal", "hamza"])).toEqual([
      { roommateId: "ali", sharePaisa: 30000 },
      { roommateId: "bilal", sharePaisa: 30000 },
      { roommateId: "hamza", sharePaisa: 30000 },
    ]);
  });

  it("distributes remaining paisa in stable order", () => {
    expect(calculateEqualShares(100, ["a", "b", "c"])).toEqual([
      { roommateId: "a", sharePaisa: 34 },
      { roommateId: "b", sharePaisa: 33 },
      { roommateId: "c", sharePaisa: 33 },
    ]);
  });

  it("accepts custom shares that match the total", () => {
    expect(
      validateCustomShares(90000, [
        { roommateId: "ali", sharePaisa: 20000 },
        { roommateId: "bilal", sharePaisa: 30000 },
        { roommateId: "hamza", sharePaisa: 40000 },
      ]),
    ).toBeNull();
  });

  it("rejects custom shares that do not match the total", () => {
    expect(
      validateCustomShares(90000, [
        { roommateId: "ali", sharePaisa: 20000 },
        { roommateId: "bilal", sharePaisa: 30000 },
      ]),
    ).toBe("Custom shares must add up to the total expense amount.");
  });
});

