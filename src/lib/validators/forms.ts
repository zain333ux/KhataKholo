export type ActionState = {
  ok: boolean;
  message: string;
};

export const emptyActionState: ActionState = {
  ok: false,
  message: "",
};

export function getText(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export function getRequiredText(formData: FormData, key: string, label: string): string {
  const value = getText(formData, key);

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

export function assertTextLength(value: string, label: string, min: number, max: number): void {
  if (value.length < min || value.length > max) {
    throw new Error(`${label} must be between ${min} and ${max} characters.`);
  }
}

export function assertIsoDate(value: string, label = "Date"): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must be a valid date.`);
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} must be a valid date.`);
  }
}

export function getAllText(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

export function actionError(error: unknown): ActionState {
  if (error instanceof Error) {
    const message = error.message;

    if (/fetch failed|enotfound|econnrefused|network/i.test(message)) {
      return {
        ok: false,
        message: "The room service is temporarily unavailable. Please try again shortly.",
      };
    }

    if (/groups_room_code_key/i.test(message)) {
      return {
        ok: false,
        message: "That room code is already in use. Please choose another one.",
      };
    }

    if (/roommates_group_login_unique/i.test(message)) {
      return {
        ok: false,
        message: "That username or phone is already used in this room.",
      };
    }

    if (/duplicate key/i.test(message)) {
      return { ok: false, message: "That value is already in use." };
    }

    if (/groups_name_check/i.test(message)) {
      return { ok: false, message: "Room name must be between 2 and 80 characters." };
    }

    return { ok: false, message };
  }

  return { ok: false, message: "Something went wrong. Please try again." };
}

export function actionSuccess(message: string): ActionState {
  return { ok: true, message };
}
