import { toast } from "react-toastify";
import { useScreenContext } from "@/hooks/useScreenContext";
import { DEMO_BUILDER_LEVELS, DEMO_SCREEN_CONTEXT, DEMO_TABS } from "@/modules/demo/utils/demo.constants";
import getEnv from "@/utils/env";

const SERVER_URL = getEnv("SERVER_URL");

const useDemoScreenContext = ({ presets, builder, hasActiveSession, setActiveTab }) => {
  const {
    features,
    presets: presetList,
    activePreset,
    selectedSteps,
    setSelectedSteps,
    personalityPrompt,
    setPersonalityPrompt,
    applySavedPreset,
    loadPresets,
  } = presets;
  const { builderLevel, builderProposedAction, setBuilderProposedAction, setBuilderFeatureId } = builder;

  useScreenContext({
    screenId: DEMO_SCREEN_CONTEXT.SCREEN_ID,
    screenName: DEMO_SCREEN_CONTEXT.SCREEN_NAME,
    assistantName: DEMO_SCREEN_CONTEXT.ASSISTANT_NAME,
    description: DEMO_SCREEN_CONTEXT.DESCRIPTION,
    aiEndpoint: `${SERVER_URL}/api/ai/demo-chat`,
    greeting: DEMO_SCREEN_CONTEXT.GREETING,
    currentState: {
      features,
      presets: presetList.map((p) => ({ _id: p._id, name: p.name, steps: p.steps, savedScript: p.savedScript })),
      activePreset,
      selectedSteps,
      personalityPrompt,
      builderProposedAction,
    },
    actions: {
      updateBuilderSteps: ({ steps }) => {
        setBuilderProposedAction((prev) => ({ ...prev, demoAction: { ...prev?.demoAction, steps } }));
      },
      addStepToBuilder: ({ featureId, step, paramOverrides }) => {
        setBuilderProposedAction((prev) => ({
          featureId: featureId || prev?.featureId,
          demoAction: {
            steps: [...(prev?.demoAction?.steps || []), step],
            paramOverrides: { ...(prev?.demoAction?.paramOverrides || {}), ...(paramOverrides || {}) },
          },
          narration: prev?.narration || "",
          level: prev?.level || builderLevel || DEMO_BUILDER_LEVELS.INTRO,
        }));
        if (featureId) setBuilderFeatureId(featureId);
        setActiveTab(DEMO_TABS.BUILDER);
      },
      buildDemoAction: (actionData) => {
        setBuilderProposedAction({
          featureId: actionData.featureId,
          demoAction: { steps: actionData.steps, paramOverrides: actionData.paramOverrides || {} },
          narration: actionData.narration,
          level: builderLevel || DEMO_BUILDER_LEVELS.INTRO,
        });
        if (actionData.featureId) setBuilderFeatureId(actionData.featureId);
        setActiveTab(DEMO_TABS.BUILDER);
      },
      saveDemoAction: async (saveData) => {
        const savedPreset = saveData._savedPreset;
        if (savedPreset) {
          applySavedPreset(savedPreset);
          loadPresets();
          const featureId = saveData.featureId || builderProposedAction?.featureId;
          const featureName = features.find((f) => f.id === featureId)?.name || featureId || "feature";
          toast.success(`Demo action saved for "${featureName}" — see the Script tab for the updated sequence.`);
        }
        setBuilderProposedAction(null);
      },
      selectFeatures: ({ featureIds }) => {
        const ordered = featureIds.map((id) => features.find((f) => f.id === id)).filter(Boolean);
        setSelectedSteps(ordered);
        setActiveTab(DEMO_TABS.CONFIGURE);
      },
      setNarrationInstructions: ({ instructions }) => {
        setPersonalityPrompt(instructions);
      },
    },
    enabled: !hasActiveSession,
    deps: [
      features.length,
      presetList.length,
      activePreset?._id,
      selectedSteps.length,
      personalityPrompt,
      builderProposedAction,
      hasActiveSession,
      builderLevel,
    ],
  });
};

export default useDemoScreenContext;
