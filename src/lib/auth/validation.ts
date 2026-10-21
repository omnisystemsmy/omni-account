const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_PASSWORD = 8;

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return "Enter your email address.";
  if (!EMAIL.test(v)) return "Enter a valid email address.";
  return null;
}

export function validateNewPassword(value: string): string | null {
  if (value.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`;
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) return "Include at least one letter and one number.";
  return null;
}

export type Strength = { value: number; label: string; color: string };

export function passwordStrength(pw: string): Strength | null {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= MIN_PASSWORD) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { value: 0.25, label: "Weak", color: "#E5547A" };
  if (score === 2) return { value: 0.55, label: "Okay", color: "#F2A413" };
  if (score === 3) return { value: 0.8, label: "Good", color: "#1FC6C1" };
  return { value: 1, label: "Strong", color: "#1B9E5A" };
}

/** Only same-origin relative paths are allowed as post-login targets (blocks open redirects). */
export function safeNext(next: string | null | undefined, fallback = "/account"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
