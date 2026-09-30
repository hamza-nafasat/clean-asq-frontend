import { AI_TOOLS } from "@/components/shared/aiChat/utils/aiChat.toolNames.constants.js";
import { CHAT_ROLES } from "@/components/shared/aiChat/utils/aiChat.constants.js";
import { postJson } from "@/components/shared/aiChat/utils/aiChat.toolHelpers.utils.js";

// post to a chat endpoint and return its data, throwing on failure
export const requestChat = async (endpoint, payload) => {
  const chatResponse = await postJson(endpoint, payload);
  if (!chatResponse.success) {
    throw Object.assign(new Error(chatResponse.message || "AI request failed"), { status: chatResponse.status });
  }
  return chatResponse.data;
};

// transcript as sent to the AI
export const buildSendHistory = (messages) =>
  messages
    // visual-only bubbles have empty content the AI rejects
    .filter((m) => m.role !== CHAT_ROLES.ASSISTANT || m.content || m.function_call)
    .map((m) => {
      const msg = { role: m.role, content: m.content ?? null };
      if (m.function_call) msg.function_call = m.function_call;
      if (m.name) msg.name = m.name;
      // keep suggested hex values so the AI can apply them exactly
      if (m.toolCall?.tool === AI_TOOLS.SUGGEST_COLORS && m.toolCall?.colors?.length) {
        const colorList = m.toolCall.colors.map((c) => `${c.hex}→${c.targetProperty || c.purpose}`).join(", ");
        msg.content = `${msg.content ?? ""}\n[Suggested colors: ${colorList}]`;
      }
      return msg;
    });
