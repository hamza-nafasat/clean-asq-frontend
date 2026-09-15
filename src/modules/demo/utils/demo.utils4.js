import { toChapterKey } from "./demo.utils3";

export const buildInitialNarrations = (displayScript) => {
  const initial = {};
  displayScript.forEach((step) => {
    initial[step.id] = step.introNarration || step.narration || step.description || "";
    step.chapters?.forEach((ch, ci) => {
      initial[toChapterKey(step.id, ci)] = ch.narration || "";
    });
  });
  return initial;
};

export const buildExpandedScript = (displayScript) => {
  const allOpen = {};
  displayScript.forEach((step) => {
    allOpen[step.id] = true;
  });
  return allOpen;
};

// script payload with the edited narrations
export const buildEditedScript = (displayScript, editedNarrations) =>
  displayScript.map((step) => {
    const entry = {
      featureId: step.id,
      headline: step.headline || "",
      intro: step.intro || "",
      introNarration: editedNarrations[step.id] ?? step.introNarration ?? step.narration ?? "",
      introDemoAction: step.introDemoAction || null,
      narration: editedNarrations[step.id] ?? step.narration ?? "",
      demoAction: step.demoAction || null,
    };
    if (step.chapters?.length) {
      entry.chapters = step.chapters.map((ch, ci) => ({
        ...ch,
        narration: editedNarrations[toChapterKey(step.id, ci)] ?? ch.narration ?? "",
      }));
    }
    return entry;
  });

// preview script with the edited narrations
export const applyEditsToScript = (displayScript, editedNarrations) =>
  displayScript.map((step) => ({
    ...step,
    introNarration: editedNarrations[step.id] ?? step.introNarration,
    narration: editedNarrations[step.id] ?? step.narration,
    chapters: step.chapters?.length
      ? step.chapters.map((ch, ci) => ({
          ...ch,
          narration: editedNarrations[toChapterKey(step.id, ci)] ?? ch.narration,
        }))
      : step.chapters,
  }));
