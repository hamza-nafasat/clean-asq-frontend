const NAV_ONLY_RE = /\b(open|go to|take me to|navigate to|show me the|redirect)\b/i;
const INVENTED_TASK_RE = /\b(create|design|set up|configure|build)\b/i;

/**
 * Decide what happens after cross-page navigation lands.
 * - greeting: show destination page greeting only (no auto-sent user message)
 * - task: auto-send followUpTask to the destination AI
 */
export function resolveNavigationHandoff({ handoffMode, followUpTask, lastUserMessage, greeting }) {
  if (handoffMode === "greeting") {
    return greeting ? { type: "greeting", content: greeting } : { type: "none" };
  }

  const userText = typeof lastUserMessage === "string" ? lastUserMessage : "";
  const taskText = (followUpTask || "").trim();

  // AI often omits handoffMode and invents a create/edit task for simple "open page" requests.
  if (NAV_ONLY_RE.test(userText) && INVENTED_TASK_RE.test(taskText) && greeting) {
    return { type: "greeting", content: greeting, reason: "nav-only-heuristic" };
  }

  if (taskText) return { type: "task", task: taskText };
  if (greeting) return { type: "greeting", content: greeting };
  return { type: "none" };
}
