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

// every saved ai help q&a on a page
export const buildPageFaqs = (section) => {
  const fieldFaqs = (section?.fields ?? [])
    .filter((field) => field?.aiHelp && field?.aiPrompt && toPlainText(field?.aiResponse))
    .map((field) => ({ question: field.aiPrompt, answer: toPlainText(field.aiResponse) }));
  const signatureAnswer = section?.isSignAiHelp && section?.signAiPrompt ? toPlainText(section?.signAiResponse) : "";
  return signatureAnswer ? [...fieldFaqs, { question: section.signAiPrompt, answer: signatureAnswer }] : fieldFaqs;
};
