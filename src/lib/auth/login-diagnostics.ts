type LoginDiagnostic = {
  roomFound?: boolean;
  roommateFound?: boolean;
  pinMatched?: boolean;
  sessionCreated?: boolean;
  cookieSet?: boolean;
  redirectTarget?: string;
  errorCode?: string;
};

export function logLoginDiagnostic(step: string, diagnostic: LoginDiagnostic) {
  console.info("[auth:login]", {
    step,
    ...diagnostic,
  });
}

