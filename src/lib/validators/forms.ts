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
    return { ok: false, message: error.message };
  }

  return { ok: false, message: "Something went wrong. Please try again." };
}

export function actionSuccess(message: string): ActionState {
  return { ok: true, message };
}

