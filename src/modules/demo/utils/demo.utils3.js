import getEnv from "@/utils/env";
import {
  DEMO_BUILDER_LEVELS,
  DEMO_CHAPTER_KEY_SEPARATOR,
  DEMO_CHAPTER_LEVEL_PREFIX,
  DEMO_PARAM_FIELDS,
  DEMO_STEP_SUMMARY_LIMIT,
} from "./demo.constants";

const SERVER_URL = getEnv("SERVER_URL");

const CHAPTER_STEP_PATTERN = new RegExp(`^(.+)${DEMO_CHAPTER_KEY_SEPARATOR}(\\d+)$`);

export const fetchDemoApi = (path, { method, body } = {}) => {
  const options = { credentials: "include" };
  if (method) options.method = method;
  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }
  return fetch(`${SERVER_URL}/api/demo${path}`, options);
};

export const requestDemoApi = async (path, options) => {
  const res = await fetchDemoApi(path, options);
  return res.json();
};

export const formatDemoDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export const isChapterLevel = (level) => Boolean(level?.startsWith(DEMO_CHAPTER_LEVEL_PREFIX));

export const toChapterLevel = (index) => `${DEMO_CHAPTER_LEVEL_PREFIX}${index}`;

export const parseChapterIndex = (level) => parseInt(level.replace(DEMO_CHAPTER_LEVEL_PREFIX, ""), 10);

export const toChapterKey = (stepId, index) => `${stepId}${DEMO_CHAPTER_KEY_SEPARATOR}${index}`;

export const findSavedEntry = (preset, featureId) => preset?.savedScript?.find((s) => s.featureId === featureId);

export const toChapterOutline = (chapters = []) =>
  chapters.map((ch) => ({ title: ch.title, summary: ch.summary || "" }));

export const hasSavedNarration = (preset) =>
  !!preset?.savedScript?.some((s) => s.introNarration || s.narration || s.chapters?.some((ch) => ch.narration));

const summarizeSteps = (steps) => {
  const summary = steps
    .slice(0, DEMO_STEP_SUMMARY_LIMIT)
    .map((s, i) => `  ${i + 1}. ${s.action}${s.selector ? ` ${s.selector}` : ""}${s.value ? ` "${s.value}"` : ""}`)
    .join("\n");
  const more = steps.length > DEMO_STEP_SUMMARY_LIMIT ? `\n  … +${steps.length - DEMO_STEP_SUMMARY_LIMIT} more` : "";
  return `Here's what's currently built (${steps.length} steps):\n${summary}${more}`;
};

// the proposed action and the chat message that open the builder
export const buildBuilderRequest = ({ feature, featureId, level, savedEntry }) => {
  if (level === DEMO_BUILDER_LEVELS.INTRO) {
    if (savedEntry?.introDemoAction?.steps?.length) {
      return {
        proposedAction: {
          featureId,
          level: DEMO_BUILDER_LEVELS.INTRO,
          demoAction: savedEntry.introDemoAction,
          narration: savedEntry.introNarration || "",
        },
        message: `I want to edit the intro demo action for the "${feature.name}" feature (featureId: ${featureId}).\n\n${summarizeSteps(savedEntry.introDemoAction.steps)}\n\nWhat would you like to change?`,
      };
    }
    const intro = savedEntry?.intro || "";
    const notes = intro ? `\n\nPresenter intro notes: "${intro}"` : "";
    return {
      proposedAction: null,
      message: `Let's build the intro demo action for "${feature.name}" (featureId: ${featureId}).${notes}\n\nLet's go step by step — start by asking what screen the demo begins on.`,
    };
  }

  const chIdx = parseChapterIndex(level);
  const ch = savedEntry?.chapters?.[chIdx];
  const chapterLabel = ch?.title || `Chapter ${chIdx + 1}`;
  if (ch?.demoAction?.steps?.length) {
    return {
      proposedAction: { featureId, level, chapterIndex: chIdx, demoAction: ch.demoAction, narration: ch.narration || "" },
      message: `I want to edit chapter ${chIdx + 1} ("${chapterLabel}") of the "${feature.name}" feature (featureId: ${featureId}).\n\n${summarizeSteps(ch.demoAction.steps)}\n\nWhat would you like to change?`,
    };
  }
  const summary = ch?.summary || "";
  const notes = summary ? `\n\nChapter notes: "${summary}"` : "";
  return {
    proposedAction: null,
    message: `Let's build chapter ${chIdx + 1} ("${chapterLabel}") of the "${feature.name}" demo (featureId: ${featureId}).${notes}\n\nLet's go step by step — start by asking what screen this chapter begins on.`,
  };
};

export const getBuilderLevelLabel = (builderLevel, savedEntry) => {
  if (!isChapterLevel(builderLevel)) return "Intro";
  const chIdx = parseChapterIndex(builderLevel);
  const ch = savedEntry?.chapters?.[chIdx] || {};
  return `Chapter ${chIdx + 1}${ch?.title ? ` — ${ch.title}` : ""}`;
};

export const enrichSavedScript = (savedScript, features) =>
  savedScript.map((ss) => {
    const feat = features.find((f) => f.id === ss.featureId);
    const base = feat ? { ...feat } : { featureId: ss.featureId, id: ss.featureId, name: ss.featureId, category: "" };
    return {
      ...base,
      headline: ss.headline || "",
      intro: ss.intro || "",
      introNarration: ss.introNarration || "",
      introDemoAction: ss.introDemoAction || null,
      narration: ss.narration || "",
      demoAction: ss.demoAction || null,
      chapters: ss.chapters || [],
    };
  });

const emptyScriptEntry = (featureId, narration = "") => ({
  featureId,
  headline: "",
  intro: "",
  introNarration: narration,
  introDemoAction: null,
  narration,
  demoAction: null,
  chapters: [],
});

// merge a live generated script into the saved script entries
export const mergeLiveScript = (savedScript = [], scriptSteps = []) => {
  const existingMap = {};
  for (const e of savedScript) {
    existingMap[e.featureId] = { ...e, chapters: e.chapters ? e.chapters.map((c) => ({ ...c })) : [] };
  }

  for (const s of scriptSteps) {
    const chMatch = s.id?.match(CHAPTER_STEP_PATTERN);
    if (chMatch) {
      const [, baseId, chIdxStr] = chMatch;
      const chIdx = parseInt(chIdxStr, 10);
      if (!existingMap[baseId]) existingMap[baseId] = emptyScriptEntry(baseId);
      const chapters = existingMap[baseId].chapters;
      while (chapters.length <= chIdx) {
        chapters.push({ title: `Chapter ${chapters.length + 1}`, summary: "", narration: "", demoAction: null });
      }
      chapters[chIdx] = { ...chapters[chIdx], narration: s.narration };
    } else if (!existingMap[s.id]) {
      existingMap[s.id] = emptyScriptEntry(s.id, s.narration);
    } else {
      existingMap[s.id] = { ...existingMap[s.id], introNarration: s.narration, narration: s.narration };
    }
  }

  return Object.values(existingMap);
};

export const getParamNames = (steps = []) => [
  ...new Set(
    steps.flatMap((s) =>
      DEMO_PARAM_FIELDS.flatMap((f) => (s[f] ? [...s[f].matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]) : [])),
    ),
  ),
];
