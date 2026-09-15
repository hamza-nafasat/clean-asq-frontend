import { useEffect, useState } from "react";
import useAiChat from "@/hooks/useAiChat";
import useDemoBuilder from "./hooks/useDemoBuilder";
import useDemoPresets from "./hooks/useDemoPresets";
import useDemoScreenContext from "./hooks/useDemoScreenContext";
import useDemoScriptEditor from "./hooks/useDemoScriptEditor";
import useDemoSession from "./hooks/useDemoSession";
import DemoBuilderTab from "./components/DemoBuilderTab";
import DemoFeatureList from "./components/DemoFeatureList";
import DemoHeading from "./components/DemoHeading";
import DemoPresetBar from "./components/DemoPresetBar";
import DemoScriptTab from "./components/DemoScriptTab";
import {
  DEMO_SCRIPT_SOURCES,
  DEMO_SESSION_STATUSES,
  DEMO_STORAGE_KEYS,
  DEMO_TAB_OPTIONS,
  DEMO_TABS,
} from "./utils/demo.constants";
import { formatDemoDate, hasSavedNarration } from "./utils/demo.utils3";

const Demo = () => {
  const { session, sessionStatus, scriptSteps, startDemo } = useDemoSession();
  const { triggerAutoMessage } = useAiChat();
  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem(DEMO_STORAGE_KEYS.ACTIVE_TAB) || DEMO_TABS.CONFIGURE,
  );
  const [isStarting, setIsStarting] = useState(false);
  const [collapsedOutline, setCollapsedOutline] = useState({});

  const presets = useDemoPresets();
  const { features, activePreset, previewScript, selectedSteps, personalityPrompt } = presets;
  const builder = useDemoBuilder({
    features,
    activePreset,
    applySavedPreset: presets.applySavedPreset,
    loadPresets: presets.loadPresets,
    triggerAutoMessage,
    setActiveTab,
  });

  const isGenerating = sessionStatus === DEMO_SESSION_STATUSES.GENERATING;
  const hasLiveScript = scriptSteps.length > 0;
  const hasActiveSession = session && sessionStatus && sessionStatus !== DEMO_SESSION_STATUSES.ENDED;
  const displayScript = hasLiveScript ? scriptSteps : previewScript;
  const scriptSource = hasLiveScript
    ? DEMO_SCRIPT_SOURCES.LIVE
    : previewScript.length
      ? DEMO_SCRIPT_SOURCES.SAVED
      : null;
  const hasSavedScript = hasSavedNarration(activePreset);
  const savedScriptDate = activePreset?.scriptGeneratedAt ? formatDemoDate(activePreset.scriptGeneratedAt) : null;

  const editor = useDemoScriptEditor({ displayScript, scriptSteps, hasLiveScript, presets });
  useDemoScreenContext({ presets, builder, hasActiveSession, setActiveTab });

  // persist the tab across refreshes
  useEffect(() => {
    sessionStorage.setItem(DEMO_STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  // show the script tab when a live script arrives
  useEffect(() => {
    if (hasLiveScript && activeTab === DEMO_TABS.CONFIGURE) setActiveTab(DEMO_TABS.SCRIPT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLiveScript]);

  const handleStartDemo = async (useSaved = false) => {
    setIsStarting(true);
    const savedScript = activePreset?.savedScript?.length ? activePreset.savedScript : null;
    const ok = await startDemo(selectedSteps, personalityPrompt, { savedScript, regenerate: !useSaved });
    setIsStarting(false);
    if (ok) setActiveTab(DEMO_TABS.SCRIPT);
  };

  const handleRegenerate = async () => {
    presets.setPreviewScript([]);
    await handleStartDemo(false);
  };

  const handleNewDemo = () => {
    presets.resetDemo();
    setActiveTab(DEMO_TABS.CONFIGURE);
  };

  const handleGoToConfigure = () => setActiveTab(DEMO_TABS.CONFIGURE);

  return (
    <article className="flex h-full flex-col">
      <DemoHeading
        heading="Sales Demo"
        subheading="Configure and run an AI-powered interactive product presentation."
      />

      {/* Tabs */}
      <nav className="flex border-b border-gray-200 px-6">
        {DEMO_TAB_OPTIONS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.id === DEMO_TABS.SCRIPT && scriptSource !== null && (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500 inline-block align-middle" />
            )}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-hidden">
        {activeTab === DEMO_TABS.CONFIGURE && (
          <div className="h-full flex flex-col overflow-hidden">
            <DemoPresetBar
              presetName={presets.presetName}
              presets={presets.presets}
              activePreset={activePreset}
              showPresetDropdown={presets.showPresetDropdown}
              hasSelection={selectedSteps.length > 0}
              hasSavedScript={hasSavedScript}
              savedScriptDate={savedScriptDate}
              isStarting={isStarting}
              personalityPrompt={personalityPrompt}
              onPresetNameChange={presets.setPresetName}
              onSavePreset={presets.savePreset}
              onToggleDropdown={() => presets.setShowPresetDropdown((p) => !p)}
              onLoadPreset={presets.loadPreset}
              onDeletePreset={presets.deletePreset}
              onNewDemo={handleNewDemo}
              onRegenerate={handleRegenerate}
              onStartDemo={() => handleStartDemo(hasSavedScript)}
              onPersonalityPromptChange={presets.setPersonalityPrompt}
            />
            <DemoFeatureList
              features={features}
              categories={presets.categories}
              selectedSteps={selectedSteps}
              activePreset={activePreset}
              collapsedOutline={collapsedOutline}
              savingOutline={presets.savingOutline}
              onSelectAll={presets.selectAllFeatures}
              onClear={() => presets.setSelectedSteps([])}
              onToggleFeature={presets.toggleFeature}
              onToggleOutline={(featureId, isExpanded) =>
                setCollapsedOutline((p) => ({ ...p, [featureId]: isExpanded }))
              }
              onSaveOutline={presets.saveFeatureOutline}
              onOpenBuilder={builder.openBuilderForLevel}
              onRemoveIntroAction={presets.removeIntroAction}
              onAddChapter={presets.addChapter}
              onRemoveChapter={presets.removeChapter}
            />
          </div>
        )}

        {activeTab === DEMO_TABS.SCRIPT && (
          <DemoScriptTab
            isGenerating={isGenerating}
            generatingStepCount={session?.totalSteps || selectedSteps.length}
            displayScript={displayScript}
            scriptSource={scriptSource}
            savedScriptDate={savedScriptDate}
            activePreset={activePreset}
            hasSelection={selectedSteps.length > 0}
            isStarting={isStarting}
            editor={editor}
            onRegenerate={handleRegenerate}
            onCreateScript={() => handleStartDemo(hasSavedScript)}
            onGoToConfigure={handleGoToConfigure}
            onOpenBuilder={builder.openBuilderForLevel}
          />
        )}

        {activeTab === DEMO_TABS.BUILDER && (
          <DemoBuilderTab
            features={features}
            activePreset={activePreset}
            builder={builder}
            onGoToConfigure={handleGoToConfigure}
          />
        )}
      </div>
    </article>
  );
};

export default Demo;
