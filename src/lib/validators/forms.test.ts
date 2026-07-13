import { describe, expect, it } from "vitest";

import { actionError, assertIsoDate, assertTextLength } from "./forms";

describe("actionError", () => {
  it("turns low-level fetch failures into a useful service message", () => {
    expect(actionError(new Error("TypeError: fetch failed"))).toEqual({
      ok: false,
      message: "The room service is temporarily unavailable. Please try again shortly.",
    });
  });

  it("explains duplicate room codes without exposing database details", () => {
    expect(actionError(new Error('duplicate key value violates unique constraint "groups_room_code_key"'))).toEqual({
      ok: false,
      message: "That room code is already in use. Please choose another one.",
    });
  });

  it("preserves safe validation messages", () => {
    expect(actionError(new Error("PIN must be exactly 6 digits."))).toEqual({
      ok: false,
      message: "PIN must be exactly 6 digits.",
    });
  });

  it("validates text lengths before database constraints", () => {
    expect(() => assertTextLength("A", "Room name", 2, 80)).toThrow(
      "Room name must be between 2 and 80 characters.",
    );
    expect(() => assertTextLength("Valid room", "Room name", 2, 80)).not.toThrow();
  });

  it("rejects malformed and impossible dates", () => {
    expect(() => assertIsoDate("2026-02-28")).not.toThrow();
    expect(() => assertIsoDate("2026-02-31")).toThrow("Date must be a valid date.");
    expect(() => assertIsoDate("31-02-2026")).toThrow("Date must be a valid date.");
  });

  it("returns a specific message for duplicate roommate logins", () => {
    expect(actionError(new Error('duplicate key violates "roommates_group_login_unique"'))).toEqual({
      ok: false,
      message: "That username or phone is already used in this room.",
    });
  });
});
