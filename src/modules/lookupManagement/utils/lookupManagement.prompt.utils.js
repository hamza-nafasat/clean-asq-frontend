import { EXTRACT_AS_TYPES, NO_OUTPUT_EXTRACT_AS, PROMPT_NAMES } from "./lookupManagement.constants";

const EXAMPLE_VALUES = {
  [EXTRACT_AS_TYPES.NUMBER]: "123",
  [EXTRACT_AS_TYPES.LIST]: '["item1", "item2", "item3"]',
  [EXTRACT_AS_TYPES.ADDRESS]: "123 Main St, City, State 12345",
  [EXTRACT_AS_TYPES.DATE]: "2025-01-07",
};

const getActiveStrategiesWithPrompts = (strategiesData) =>
  (strategiesData || [])
    .filter(
      (strategy) =>
        strategy?.isActive &&
        strategy?.extractionPrompt &&
        strategy?.extractionPrompt.trim() !== "" &&
        strategy.extractAs !== NO_OUTPUT_EXTRACT_AS,
    )
    .sort((a, b) => a.order - b.order);

// output format from active lookups
export const generateExtractionDetails = (strategiesData) => {
  const activeStrategiesWithPrompts = getActiveStrategiesWithPrompts(strategiesData);
  if (!activeStrategiesWithPrompts.length)
    return "No active search strategies with extraction prompts found. Please configure search strategies first.";

  const instructions = activeStrategiesWithPrompts
    .map((strategy, index) => {
      const extractType = strategy?.extractAs || EXTRACT_AS_TYPES.SIMPLE_TEXT;
      return `${index + 1}. **${strategy?.searchObjectKey}** (Extract as: ${extractType})
   ${strategy?.extractionPrompt}`;
    })
    .join("\n\n");

  // value and source field per lookup
  const jsonFields = activeStrategiesWithPrompts.reduce((acc, strategy) => {
    const fieldName = strategy?.searchObjectKey;
    const extractType = strategy?.extractAs || EXTRACT_AS_TYPES.SIMPLE_TEXT;
    acc[fieldName] = EXAMPLE_VALUES[extractType] ?? "example text";
    acc[`${fieldName}_source`] =
      "Copy the exact 'Title Source Attribution' or 'Snippet Source Attribution' text from the search evidence where you found this information";
    return acc;
  }, {});

  const jsonFormat = JSON.stringify(jsonFields, null, 2);

  return `**EXTRACTION INSTRUCTIONS:**

${instructions}

**REQUIRED JSON OUTPUT FORMAT:**

You MUST return a JSON object using the EXACT field names specified below. Do not rename or modify field names:

\`\`\`json
${jsonFormat}
\`\`\`

**CRITICAL FORMATTING REQUIREMENTS:**
- YOU MUST use the EXACT field names shown in the JSON structure above
- For each data field (e.g., "legalname"), provide both the value and source:
  * Main field: Contains the actual extracted value (e.g., "legalname": "Company Inc.")
  * Source field: Copy the EXACT "Title Source Attribution" or "Snippet Source Attribution" text from the search evidence
- Source attribution examples:
  * From title: "Google search, company legal name, result 1 (https://example.com), title"
  * From snippet: "Google search, employee count, result 3 (https://example.com), snippet"
  * From website: "Website, contact-us page"
  * If not found: "Not found"
- DO NOT modify or create your own source attribution format - copy exactly from the search evidence
- For missing information, use "unknown" for value and "Not found" for source
- For List/Array fields, always return an array even if only one item is found
- For Number fields, return actual numbers, not strings
- For Date fields, use ISO format (YYYY-MM-DD) when possible
- Ensure all JSON is properly formatted and valid
- FIELD NAMES MUST BE EXACTLY AS SPECIFIED - NO VARIATIONS ALLOWED

**EXTRACTION COUNT:** ${activeStrategiesWithPrompts?.length} fields to extract from search results.`;
};

export const buildFullPrompt = (promptData, strategiesData) => {
  if (!promptData || !strategiesData) return "";
  const extractionDetails = generateExtractionDetails(strategiesData);

  return [...promptData]
    .sort((a, b) => Number(a?.section) - Number(b?.section))
    .map((doc) => {
      if (doc.name === PROMPT_NAMES.OUTPUT_FORMAT) return extractionDetails;
      return doc.prompt
        .replace("{companyName}", "Test Company")
        .replace("{dynamicExtractionDetails}", extractionDetails);
    })
    .join("\n\n");
};
