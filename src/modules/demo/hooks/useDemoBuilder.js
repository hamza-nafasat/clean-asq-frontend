import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DEMO_BUILDER_LEVELS, DEMO_STORAGE_KEYS, DEMO_TABS } from "@/modules/demo/utils/demo.constants";
import {
  buildBuilderRequest,
  findSavedEntry,
  isChapterLevel,
  parseChapterIndex,
  requestDemoApi,
} from "@/modules/demo/utils/demo.utils3";

const readStoredAction = () => {
  try {
    return JSON.parse(sessionStorage.getItem(DEMO_STORAGE_KEYS.BUILDER_PROPOSED_ACTION)) || null;
  } catch {
    return null;
  }
};

const syncStorage = (key, value) => {
  if (value) sessionStorage.setItem(key, value);
  else sessionStorage.removeItem(key);
};

const useDemoBuilder = ({ features, activePreset, applySavedPreset, loadPresets, triggerAutoMessage, setActiveTab }) => {
  const [builderFeatureId, setBuilderFeatureId] = useState(
    () => sessionStorage.getItem(DEMO_STORAGE_KEYS.BUILDER_FEATURE_ID) || null,
  );
  const [builderLevel, setBuilderLevel] = useState(() => sessionStorage.getItem(DEMO_STORAGE_KEYS.BUILDER_LEVEL) || null);
  const [builderProposedAction, setBuilderProposedAction] = useState(readStoredAction);
  const [isSavingAction, setIsSavingAction] = useState(false);

  // persist builder context across refreshes
  useEffect(() => {
    syncStorage(DEMO_STORAGE_KEYS.BUILDER_FEATURE_ID, builderFeatureId);
  }, [builderFeatureId]);
  useEffect(() => {
    syncStorage(DEMO_STORAGE_KEYS.BUILDER_LEVEL, builderLevel);
  }, [builderLevel]);
  useEffect(() => {
    syncStorage(
      DEMO_STORAGE_KEYS.BUILDER_PROPOSED_ACTION,
      builderProposedAction ? JSON.stringify(builderProposedAction) : null,
    );
  }, [builderProposedAction]);

  const openBuilderForLevel = (featureId, level = DEMO_BUILDER_LEVELS.INTRO) => {
    const feature = features.find((f) => f.id === featureId);
    if (!feature) return;

    setBuilderFeatureId(featureId);
    setBuilderLevel(level);
    setActiveTab(DEMO_TABS.BUILDER);

    const savedEntry = findSavedEntry(activePreset, featureId);
    const { proposedAction, message } = buildBuilderRequest({ feature, featureId, level, savedEntry });
    setBuilderProposedAction(proposedAction);
    triggerAutoMessage(message);
  };

  const saveBuilderAction = async () => {
    if (!builderProposedAction || !activePreset?._id) return;
    setIsSavingAction(true);
    const effectiveLevel = builderProposedAction.level || builderLevel || DEMO_BUILDER_LEVELS.INTRO;
    const isChapter = isChapterLevel(effectiveLevel);
    const chIdx = builderProposedAction.chapterIndex ?? (isChapter ? parseChapterIndex(effectiveLevel) : undefined);
    try {
      const body = {
        featureId: builderProposedAction.featureId,
        demoAction: builderProposedAction.demoAction,
        narration: builderProposedAction.narration || "",
        level: isChapter ? DEMO_BUILDER_LEVELS.CHAPTER : DEMO_BUILDER_LEVELS.INTRO,
      };
      if (isChapter) body.chapterIndex = chIdx;
      const d = await requestDemoApi(`/presets/${activePreset._id}/action`, { method: "PATCH", body });
      if (d.success) {
        applySavedPreset(d.data);
        loadPresets();
        setBuilderProposedAction(null);
        const featureName =
          features.find((f) => f.id === builderProposedAction.featureId)?.name || builderProposedAction.featureId;
        const levelLabel = effectiveLevel === DEMO_BUILDER_LEVELS.INTRO ? "" : ` (Chapter ${(chIdx ?? 0) + 1})`;
        toast.success(`Demo action saved for "${featureName}"${levelLabel}`);
      } else {
        toast.error(d.message || "Save failed");
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setIsSavingAction(false);
    }
  };

  const clearBuilderTarget = () => {
    setBuilderFeatureId(null);
    setBuilderLevel(null);
    setBuilderProposedAction(null);
  };

  const clearProposedSteps = () => {
    if (!window.confirm("Clear all steps and remove this action?")) return;
    setBuilderProposedAction((prev) => ({ ...prev, demoAction: { steps: [], paramOverrides: {} }, narration: "" }));
  };

  const removeProposedStep = (index) =>
    setBuilderProposedAction((prev) => ({
      ...prev,
      demoAction: { ...prev.demoAction, steps: prev.demoAction.steps.filter((_, j) => j !== index) },
    }));

  const setProposedParam = (name, value) =>
    setBuilderProposedAction((prev) => ({
      ...prev,
      demoAction: {
        ...prev.demoAction,
        paramOverrides: { ...(prev.demoAction?.paramOverrides || {}), [name]: value },
      },
    }));

  return {
    builderFeatureId,
    setBuilderFeatureId,
    builderLevel,
    builderProposedAction,
    setBuilderProposedAction,
    isSavingAction,
    openBuilderForLevel,
    saveBuilderAction,
    clearBuilderTarget,
    clearProposedSteps,
    removeProposedStep,
    setProposedParam,
  };
};

export default useDemoBuilder;
