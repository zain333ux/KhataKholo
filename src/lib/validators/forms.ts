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

    if (/duplicate key|groups_room_code_key/i.test(message)) {
      return {
        ok: false,
        message: "That room code is already in use. Please choose another one.",
      };
    }

    return { ok: false, message };
  }

  return { ok: false, message: "Something went wrong. Please try again." };
}

export function actionSuccess(message: string): ActionState {
  return { ok: true, message };
}
