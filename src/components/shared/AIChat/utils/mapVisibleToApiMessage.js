/** Map a visible chat message to the API payload shape (embeds tool metadata in content). */
export function mapVisibleToApiMessage(m) {
  const msg = { role: m.role, content: m.content ?? null };
  if (m.function_call) msg.function_call = m.function_call;
  if (m.name) msg.name = m.name;
  if (m.toolCall?.tool === "suggestColors" && m.toolCall?.colors?.length) {
    const colorList = m.toolCall.colors.map((c) => `${c.hex}→${c.targetProperty || c.purpose}`).join(", ");
    msg.content = `${msg.content ?? ""}\n[Suggested colors: ${colorList}]`;
  }
  return msg;
}

export function mapVisibleHistoryToApi(messages) {
  return messages.map(mapVisibleToApiMessage);
}
