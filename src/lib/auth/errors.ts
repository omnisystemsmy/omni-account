/** Maps Supabase Auth error codes to user-facing copy (same wording as Omni Tools where it exists). */
export function authMessage(code?: string | null, raw?: string | null): string {
  switch (code) {
    case "invalid_credentials":
    case "user_not_found":
      return "Incorrect email or password.";
    case "email_not_confirmed":
      return "Confirm your email first. Check your inbox for the link.";
    case "user_banned":
      return "This account has been disabled. Contact support.";
    case "user_already_exists":
    case "email_exists":
      return "Email already registered. Please sign in or use a different email.";
    case "weak_password":
      return "Choose a stronger password.";
    case "same_password":
      return "Choose a password you have not used on this account.";
    case "validation_failed":
    case "email_address_invalid":
      return "Invalid email address.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Please try again later.";
    case "otp_expired":
      return "That link or code has expired or is not correct. Request a new one.";
    case "signup_disabled":
      return "Sign-ups are closed right now.";
    case "bad_jwt":
    case "session_expired":
    case "session_not_found":
      return "Please sign in again to do this.";
  }
  const text = (raw ?? "").toLowerCase();
  if (text.includes("fetch") || text.includes("network")) return "No internet connection. Check it and try again.";
  if (text.includes("sending") && text.includes("email")) return "We could not send the email right now. Please try again later.";
  return "Something went wrong. Please try again.";
}
