export function normalizeLoginId(value: string): string {
  const trimmed = value.trim().toLowerCase();
  const digits = normalizePhone(trimmed);
  const onlyPhoneCharacters = /^[\d\s()+.-]+$/.test(trimmed);

  if (digits && onlyPhoneCharacters) {
    return digits;
  }

  return trimmed;
}

export function normalizePhone(value: string | null): string | null {
  const digits = String(value ?? "").replace(/\D/g, "");

  return digits || null;
}

export function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

export function loginMatchesRoommate(input: string, loginId: string, phone: string | null): boolean {
  const normalizedInput = normalizeLoginId(input);
  const normalizedLoginId = normalizeLoginId(loginId);
  const inputPhone = normalizePhone(input);
  const loginIdPhone = normalizePhone(loginId);
  const roommatePhone = normalizePhone(phone);

  return (
    normalizedInput === normalizedLoginId
    || Boolean(inputPhone && loginIdPhone && inputPhone === loginIdPhone)
    || Boolean(inputPhone && roommatePhone && inputPhone === roommatePhone)
  );
}
