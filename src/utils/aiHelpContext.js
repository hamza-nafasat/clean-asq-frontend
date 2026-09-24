// html answer as plain text
const toPlainText = (html = "") =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// saved prompt and answer for the assistant
export const buildAiHelpContext = (field) => {
  if (!field?.aiHelp || !field?.aiPrompt) return undefined;
  const answer = toPlainText(field?.aiResponse);
  if (!answer) return `Question: ${field.aiPrompt}`;
  return `Question: ${field.aiPrompt} | Saved answer (reuse it as-is, do not write a new one): ${answer}`;
};
