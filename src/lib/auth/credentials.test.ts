import { describe, expect, it } from "vitest";

import { isValidPin, loginMatchesRoommate, normalizeRoomCode } from "./credentials";

describe("custom credentials", () => {
  it("normalizes room code", () => {
    expect(normalizeRoomCode(" room-12 ")).toBe("ROOM12");
  });

  it("validates 6-digit PINs", () => {
    expect(isValidPin("123456")).toBe(true);
    expect(isValidPin("12345")).toBe(false);
    expect(isValidPin("abcdef")).toBe(false);
  });

  it("matches by username or phone", () => {
    expect(loginMatchesRoommate("Ali", "ali", "03001234567")).toBe(true);
    expect(loginMatchesRoommate("0300-1234567", "ali", "03001234567")).toBe(true);
    expect(loginMatchesRoommate("bilal", "ali", "03001234567")).toBe(false);
  });
});

