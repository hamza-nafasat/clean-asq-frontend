import { NAICS_COLUMNS, NAICS_SUGGESTION_LIMIT } from "./applicant.constants";

// codes starting with the value first, then description matches
export const filterNaicsSuggestions = (value, list) => {
  const startsWithNumber = list.filter((item) => item[NAICS_COLUMNS.NAICS_CODE].startsWith(value));
  const containsInDescription = list.filter(
    (item) =>
      !item[NAICS_COLUMNS.NAICS_CODE].startsWith(value) &&
      item[NAICS_COLUMNS.NAICS_DESCRIPTION].toLowerCase().includes(value.toLowerCase()),
  );
  return [...startsWithNumber, ...containsInDescription].slice(0, NAICS_SUGGESTION_LIMIT);
};

export const formatNaicsSelection = (item) => ({
  NAICS: `${item[NAICS_COLUMNS.NAICS_CODE]}, ${item[NAICS_COLUMNS.NAICS_DESCRIPTION]} ${item[NAICS_COLUMNS.MCC_CODE] ? `, ${item[NAICS_COLUMNS.MCC_CODE]}` : ""} ${item[NAICS_COLUMNS.MCC_DESCRIPTION] ? `, ${item[NAICS_COLUMNS.MCC_DESCRIPTION]}` : ""}`,
  NAICS_Description: item[NAICS_COLUMNS.NAICS_DESCRIPTION],
  MCC: item[NAICS_COLUMNS.MCC_CODE] || "",
  MCC_Description: item[NAICS_COLUMNS.MCC_DESCRIPTION] || "",
});

export const formatNaicsBestMatch = (bestMatch) => ({
  NAICS: `${bestMatch?.naics}, ${bestMatch?.naicsDescription}`,
  MCC: `${bestMatch?.mcc || ""}, ${bestMatch?.mccDescription || ""}`,
});

// swap the clicked other match with the current best match
export const swapNaicsBestMatch = (naicsApiData, index) => {
  const bestMatch = { ...naicsApiData?.bestMatch };
  const clickedMatch = { ...naicsApiData?.otherMatches[index] };
  const otherMatches = naicsApiData?.otherMatches.filter((_, i) => i !== index);
  bestMatch.naics = clickedMatch.naics;
  bestMatch.naicsDescription = clickedMatch.naicsDescription;
  bestMatch.mcc = clickedMatch.mcc;
  bestMatch.mccDescription = clickedMatch.mccDescription;
  otherMatches.push(naicsApiData?.bestMatch);
  return { otherMatches, bestMatch };
};

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

export const buildUpdatedBy = (user) => ({
  _id: user?._id,
  email: user?.email,
  name: user?.firstName + " " + user?.lastName,
  role: user?.role?.name,
});

// keep the first createdAt of a section; keepOwn also trusts the incoming value
export const resolveCreatedAt = (ownCreatedAt, oldCreatedAt, { keepOwn = false } = {}) => {
  if (!ownCreatedAt && !oldCreatedAt) return new Date().toISOString();
  if (oldCreatedAt) return oldCreatedAt;
  if (keepOwn && ownCreatedAt) return ownCreatedAt;
  return new Date().toISOString();
};

// a required value counts as filled when strings, arrays and nested values are non-empty
export const isRequiredValueFilled = (val, { checkObjects = true } = {}) => {
  if (val == null) return false;
  if (typeof val === "string") return val.trim() !== "";
  if (Array.isArray(val))
    return (
      val.length > 0 &&
      val.every((item) =>
        typeof item === "object"
          ? Object.values(item).every((v) => v?.toString().trim() !== "")
          : item?.toString().trim() !== "",
      )
    );
  if (checkObjects && typeof val === "object") return Object.values(val).every((v) => v?.toString().trim() !== "");
  return true;
};
