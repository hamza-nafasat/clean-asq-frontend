/** HTTP status, when the rejection carries one. */
const statusOf = (err) => (typeof err?.originalStatus === "number" ? err.originalStatus : err?.status);

export const apiErrorMessage = (err) => {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  // 1. A message the server actually sent.
  const serverMessage = err?.data?.message ?? (typeof err?.data === "string" ? err.data : null) ?? err?.error?.message;
  if (typeof serverMessage === "string" && serverMessage.trim()) return serverMessage.trim();
  // 2. A thrown Error.
  if (typeof err?.message === "string" && err.message.trim()) return err.message.trim();
  // 3. No message at all - say what the transport reported instead of "undefined".
  const status = statusOf(err);
  if (status === 404) return "Endpoint not found (404) - the server has no route for this request";
  if (status === 401 || status === 403) return `Not authorized (${status})`;
  if (typeof status === "number") return `Request failed with status ${status}`;
  if (typeof status === "string") return `Request failed (${status})`; // FETCH_ERROR, PARSING_ERROR, ...
  if (typeof err?.error === "string" && err.error.trim()) return err.error.trim();

  return "Request failed with no error message";
};
