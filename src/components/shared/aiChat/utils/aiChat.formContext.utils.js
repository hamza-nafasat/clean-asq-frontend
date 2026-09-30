import { CHAT_ROLES } from "@/components/shared/aiChat/utils/aiChat.constants.js";

// "name" (displayed as "header") [id] for every form
export const formatFormList = (forms) =>
  forms
    .map(
      (f) => `"${f.name}"${f.headerText && f.headerText !== f.name ? ` (displayed as "${f.headerText}")` : ""} [${f._id}]`,
    )
    .join(", ");

export const buildConfirmedBlock = (confirmedValues) => {
  const entries = Object.entries(confirmedValues);
  return entries.length > 0 ? ` [CONFIRMED THIS SESSION: ${entries.map(([k, v]) => `${k}="${v}"`).join(", ")}]` : "";
};

// copy of ctx with its field list replaced
export const withFields = (ctx, fields) => ({
  ...ctx,
  currentState: { ...ctx.currentState, fields },
});

// transcript entries that record a tool call and its result
export const buildToolResultEntries = (toolName, toolArgs, resultSummary) => [
  { role: CHAT_ROLES.ASSISTANT, content: null, function_call: { name: toolName, arguments: JSON.stringify(toolArgs) } },
  { role: CHAT_ROLES.FUNCTION, name: toolName, content: resultSummary },
];
