// replace [field] words in the prompt with company information values
export const buildDocumentsAiPrompt = (companyInfoData, prompt) => {
  let newPrompt = prompt;
  prompt.split(" ").forEach((word) => {
    if (word.startsWith("[") && word.endsWith("]")) {
      const exactWord = word.slice(1, -1);
      const uniqueId = Object.keys(companyInfoData)?.find((key) => companyInfoData?.[key]?.name?.includes(exactWord));
      const wordValue = companyInfoData?.[uniqueId]?.value;
      newPrompt = newPrompt.replace(word, (wordValue || word).toString());
    }
  });
  return newPrompt;
};

export const parseDocumentUrls = (urlsRaw) => {
  if (typeof urlsRaw === "string" && urlsRaw.trim())
    return urlsRaw
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
  if (Array.isArray(urlsRaw)) return urlsRaw;
  return [];
};
