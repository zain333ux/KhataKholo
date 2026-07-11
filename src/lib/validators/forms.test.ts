import { describe, expect, it } from "vitest";

import { actionError } from "./forms";

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
});
