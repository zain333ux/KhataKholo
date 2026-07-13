import { describe, expect, it } from "vitest";

import { hasCredentialAliasCollision, isValidPin, loginMatchesRoommate, normalizeRoomCode } from "./credentials";

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

  it("detects ambiguous usernames and phone aliases", () => {
    const roommates = [{ id: "one", login_id: "ali", phone: "03001234567" }];

    expect(hasCredentialAliasCollision("03001234567", null, roommates)).toBe(true);
    expect(hasCredentialAliasCollision("bilal", "0300-1234567", roommates)).toBe(true);
    expect(hasCredentialAliasCollision("bilal", "03111234567", roommates)).toBe(false);
    expect(hasCredentialAliasCollision("ali", "03001234567", roommates, "one")).toBe(false);
  });
});
