import { naicsToMcc } from "@/../public/NAICStoMCC.js";

const MAX_NAICS_SUGGESTIONS = 20;

export const NAICS_KEYS = {
  CODE: "NAICS Code",
  DESCRIPTION: "NAICS Description",
  MCC_CODE: "MCC Code",
  MCC_DESCRIPTION: "MCC Description",
};

// codes starting with the value first, then description matches
export const filterNaicsSuggestions = (value) => {
  const startsWithNumber = naicsToMcc.filter((item) => item[NAICS_KEYS.CODE].startsWith(value));
  const containsInDescription = naicsToMcc.filter(
    (item) =>
      !item[NAICS_KEYS.CODE].startsWith(value) &&
      item[NAICS_KEYS.DESCRIPTION].toLowerCase().includes(value.toLowerCase()),
  );
  return [...startsWithNumber, ...containsInDescription].slice(0, MAX_NAICS_SUGGESTIONS);
};

export const buildNaicsSelection = (item) => ({
  NAICS: `${item[NAICS_KEYS.CODE]}, ${item[NAICS_KEYS.DESCRIPTION]} ${item[NAICS_KEYS.MCC_CODE] ? `, ${item[NAICS_KEYS.MCC_CODE]}` : ""} ${item[NAICS_KEYS.MCC_DESCRIPTION] ? `, ${item[NAICS_KEYS.MCC_DESCRIPTION]}` : ""}`,
  NAICS_Description: item[NAICS_KEYS.DESCRIPTION],
  MCC: item[NAICS_KEYS.MCC_CODE] || "",
  MCC_Description: item[NAICS_KEYS.MCC_DESCRIPTION] || "",
});

export const buildNaicsFromMatch = (match) => ({
  NAICS: `${match?.naics}, ${match?.naicsDescription}`,
  MCC: `${match?.mcc || ""}, ${match?.mccDescription || ""}`,
});

// swap the best match with the clicked other match
export const promoteNaicsMatch = (naicsApiData, index) => {
  const bestMatch = { ...naicsApiData?.bestMatch };
  const clickedMatch = { ...naicsApiData?.otherMatches[index] };
  const remainingOtherMatches = naicsApiData?.otherMatches.filter((_, i) => i !== index);
  bestMatch.naics = clickedMatch.naics;
  bestMatch.naicsDescription = clickedMatch.naicsDescription;
  bestMatch.mcc = clickedMatch.mcc;
  bestMatch.mccDescription = clickedMatch.mccDescription;
  remainingOtherMatches.push(naicsApiData?.bestMatch);
  return { otherMatches: remainingOtherMatches, bestMatch };
};
