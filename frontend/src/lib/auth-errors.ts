/** Maps thrown errors in auth flows to a short user-facing string. */
export function formatAuthError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
