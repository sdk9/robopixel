// Accounts that get every paid course without a purchase. Access is granted by verified
// email address only; no password or secret is stored in the code.
const FULL_ACCESS_EMAILS = new Set(["iacobdev@gmail.com"]);

type Claims = { email?: string; user_metadata?: { email_verified?: boolean } };

export function hasFullAccess(claims: unknown): boolean {
  const { email, user_metadata } = (claims ?? {}) as Claims;
  // Require a confirmed address so nobody can claim access by signing up with this email.
  return (
    typeof email === "string" &&
    user_metadata?.email_verified === true &&
    FULL_ACCESS_EMAILS.has(email.trim().toLowerCase())
  );
}
