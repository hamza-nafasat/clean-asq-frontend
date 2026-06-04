import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import getEnv from "@/lib/env";
import {
  FiPlay,
  FiSave,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiRefreshCw,
  FiEdit2,
  FiX,
  FiCheck,
  FiPlus,
  FiZap,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { useDemoSession } from "@/hooks/DemoSessionContext";
import { UseAIChat } from "@/context/AiChatContext";
import { useScreenContext } from "@/hooks/useScreenContext";

const SERVER_URL = getEnv("SERVER_URL");

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function Demo() {
  const { session, sessionStatus, scriptSteps, startDemo: ctxStartDemo } = useDemoSession();
  const { triggerAutoMessage } = UseAIChat();

  const [features, setFeatures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSteps, setSelectedSteps] = useState([]);
  const [personalityPrompt, setPersonalityPrompt] = useState("");
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("demo-active-tab") || "configure");
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState("");
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSavingScript, setIsSavingScript] = useState(false);
  const [expandedScript, setExpandedScript] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedNarrations, setEditedNarrations] = useState({});

  const [activePreset, setActivePreset] = useState(null);
  const [previewScript, setPreviewScript] = useState([]);

  // Outline section: which cards are collapsed
  const [collapsedOutline, setCollapsedOutline] = useState({});
  // Subtle "saving..." indicator for outline auto-saves
  const [savingOutline, setSavingOutline] = useState({}); // { [featureId]: true }

  // Builder tab state — persisted in sessionStorage so refresh restores context
  const [builderFeatureId, setBuilderFeatureId] = useState(
    () => sessionStorage.getItem("demo-builder-feature-id") || null,
  );
  const [builderLevel, setBuilderLevel] = useState(() => sessionStorage.getItem("demo-builder-level") || null);
  const [builderProposedAction, setBuilderProposedAction] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("demo-builder-proposed-action")) || null;
    } catch {
      return null;
    }
  });
  const [isSavingAction, setIsSavingAction] = useState(false);

  // Derived session flags
  const isGenerating = sessionStatus === "generating";
  const hasLiveScript = scriptSteps.length > 0;
  const hasActiveSession = session && sessionStatus && sessionStatus !== "ended";

  useScreenContext({
    screenId: "demo",
    screenName: "Sales Demo",
    assistantName: "Demo Assistant",
    description:
      "The Sales Demo page lets you configure and run an AI-powered product demonstration. " +
      "Select features, set the presentation order, add talking-point context, and launch an interactive demo. " +
      "The Builder tab lets you build live action sequences for each feature — the AI interviews you about each feature and constructs browser automation steps.",
    aiEndpoint: `${SERVER_URL}/api/ai/demo-chat`,
    greeting: `Hi! I'm your **Demo Assistant**.\n\nI can help you:\n- **Build demo actions** — walk me through a feature and I'll construct a live browser automation sequence\n- **Select features** for a demo run\n- **Set narration tone and audience** instructions\n- **Save** approved action sequences to your active preset\n\nWhat would you like to do?`,
    currentState: {
      features,
      presets: presets.map((p) => ({ _id: p._id, name: p.name, steps: p.steps, savedScript: p.savedScript })),
      activePreset,
      selectedSteps,
      personalityPrompt,
      builderProposedAction,
    },
    actions: {
      updateBuilderSteps: ({ steps }) => {
        setBuilderProposedAction((prev) => ({
          ...prev,
          demoAction: { ...prev?.demoAction, steps },
        }));
      },
      addStepToBuilder: ({ featureId, step, paramOverrides }) => {
        setBuilderProposedAction((prev) => ({
          featureId: featureId || prev?.featureId,
          demoAction: {
            steps: [...(prev?.demoAction?.steps || []), step],
            paramOverrides: { ...(prev?.demoAction?.paramOverrides || {}), ...(paramOverrides || {}) },
          },
          narration: prev?.narration || "",
          level: prev?.level || builderLevel || "intro",
        }));
        if (featureId) setBuilderFeatureId(featureId);
        setActiveTab("builder");
      },
      buildDemoAction: (actionData) => {
        setBuilderProposedAction({
          featureId: actionData.featureId,
          demoAction: { steps: actionData.steps, paramOverrides: actionData.paramOverrides || {} },
          narration: actionData.narration,
          level: builderLevel || "intro",
        });
        if (actionData.featureId) setBuilderFeatureId(actionData.featureId);
        setActiveTab("builder");
      },
      saveDemoAction: async (saveData) => {
        const savedPreset = saveData._savedPreset;
        if (savedPreset) {
          setActivePreset(savedPreset);
          rebuildPreviewScript(savedPreset);
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
        setActiveTab("configure");
      },
      setNarrationInstructions: ({ instructions }) => {
        setPersonalityPrompt(instructions);
      },
    },
    enabled: !hasActiveSession,
    deps: [
      features.length,
      presets.length,
      activePreset?._id,
      selectedSteps.length,
      personalityPrompt,
      builderProposedAction,
      hasActiveSession,
      builderLevel,
    ],
  });

  const displayScript = hasLiveScript ? scriptSteps : previewScript;
  const scriptSource = hasLiveScript ? "live" : previewScript.length ? "saved" : null;
  const hasSavedScript = !!activePreset?.savedScript?.some(
    (s) => s.introNarration || s.narration || s.chapters?.some((ch) => ch.narration),
  );
  const savedScriptDate = activePreset?.scriptGeneratedAt ? formatDate(activePreset.scriptGeneratedAt) : null;

  useEffect(() => {
    fetch(`${SERVER_URL}/api/demo/features`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setFeatures(d.features);
          setCategories(d.categories);
        }
      })
      .catch(() => toast.error("Failed to load demo features"));
    loadPresets(true); // auto-load most recent preset on first mount
  }, [loadPresets]);

  // Persist tab + builder context across refreshes
  useEffect(() => {
    sessionStorage.setItem("demo-active-tab", activeTab);
  }, [activeTab]);
  useEffect(() => {
    if (builderFeatureId) sessionStorage.setItem("demo-builder-feature-id", builderFeatureId);
    else sessionStorage.removeItem("demo-builder-feature-id");
  }, [builderFeatureId]);
  useEffect(() => {
    if (builderLevel) sessionStorage.setItem("demo-builder-level", builderLevel);
    else sessionStorage.removeItem("demo-builder-level");
  }, [builderLevel]);
  useEffect(() => {
    if (builderProposedAction)
      sessionStorage.setItem("demo-builder-proposed-action", JSON.stringify(builderProposedAction));
    else sessionStorage.removeItem("demo-builder-proposed-action");
  }, [builderProposedAction]);

  // When a live script arrives and user is on configure, switch to script tab
  useEffect(() => {
    if (hasLiveScript && activeTab === "configure") setActiveTab("script");
  }, [hasLiveScript]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPresets = useCallback(
    async (autoLoadIfEmpty = false) => {
      fetch(`${SERVER_URL}/api/demo/presets`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => {
          if (!d.success) return;
          setPresets(d.presets);
          // Auto-load the most recently updated preset on first mount (if nothing loaded yet)
          if (autoLoadIfEmpty && d.presets.length > 0) {
            loadPreset(d.presets[0]); // server returns sorted by updatedAt desc
          }
        })
        .catch(() => {});
    },
    [loadPreset],
  );

  // ── Outline PATCH helper ──────────────────────────────────────────────────
  const saveFeatureOutline = async (featureId, updates) => {
    if (!activePreset?._id) return null;
    setSavingOutline((p) => ({ ...p, [featureId]: true }));
    try {
      const res = await fetch(`${SERVER_URL}/api/demo/presets/${activePreset._id}/outline`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureId, ...updates }),
      });
      const d = await res.json();
      if (d.success) {
        setActivePreset(d.preset);
        rebuildPreviewScript(d.preset);
        return d.preset;
      } else {
        toast.error(d.message || "Failed to save");
        return null;
      }
    } catch {
      toast.error("Failed to save outline");
      return null;
    } finally {
      setSavingOutline((p) => {
        const n = { ...p };
        delete n[featureId];
        return n;
      });
    }
  };

  // ── Chapter management ───────────────────────────────────────────────────
  const addChapter = async (featureId) => {
    const savedEntry = activePreset?.savedScript?.find((s) => s.featureId === featureId);
    const current = savedEntry?.chapters || [];
    const newChapters = [...current, { title: `Chapter ${current.length + 1}`, summary: "" }];
    // Pass all chapters to preserve existing structure
    await saveFeatureOutline(featureId, {
      chapters: newChapters.map((ch) => ({ title: ch.title, summary: ch.summary || "" })),
    });
  };

  const removeChapter = async (featureId, idx) => {
    if (!window.confirm(`Delete Chapter ${idx + 1}? This will remove its action sequence.`)) return;
    const savedEntry = activePreset?.savedScript?.find((s) => s.featureId === featureId);
    const updated = (savedEntry?.chapters || [])
      .filter((_, i) => i !== idx)
      .map((ch) => ({ title: ch.title, summary: ch.summary || "" }));
    await saveFeatureOutline(featureId, { chapters: updated });
  };

  // ── Open builder for a level ─────────────────────────────────────────────
  // level: "intro" | "ch0" | "ch1" | ...
  const openBuilderForLevel = (featureId, level = "intro") => {
    const feat = features.find((f) => f.id === featureId);
    if (!feat) return;

    setBuilderFeatureId(featureId);
    setBuilderLevel(level);
    setActiveTab("builder");

    const savedEntry = activePreset?.savedScript?.find((s) => s.featureId === featureId);

    if (level === "intro") {
      if (savedEntry?.introDemoAction?.steps?.length) {
        setBuilderProposedAction({
          featureId,
          level: "intro",
          demoAction: savedEntry.introDemoAction,
          narration: savedEntry.introNarration || "",
        });
        const stepSummary = savedEntry.introDemoAction.steps
          .slice(0, 6)
          .map(
            (s, i) => `  ${i + 1}. ${s.action}${s.selector ? ` ${s.selector}` : ""}${s.value ? ` "${s.value}"` : ""}`,
          )
          .join("\n");
        const more =
          savedEntry.introDemoAction.steps.length > 6
            ? `\n  … +${savedEntry.introDemoAction.steps.length - 6} more`
            : "";
        const msg = `I want to edit the intro demo action for the "${feat.name}" feature (featureId: ${featureId}).\n\nHere's what's currently built (${savedEntry.introDemoAction.steps.length} steps):\n${stepSummary}${more}\n\nWhat would you like to change?`;
        triggerAutoMessage(msg);
      } else {
        setBuilderProposedAction(null);
        const intro = savedEntry?.intro || "";
        const notes = intro ? `\n\nPresenter intro notes: "${intro}"` : "";
        const msg = `Let's build the intro demo action for "${feat.name}" (featureId: ${featureId}).${notes}\n\nLet's go step by step — start by asking what screen the demo begins on.`;
        triggerAutoMessage(msg);
      }
      return;
    }

    // Chapter level: level = "ch0", "ch1", etc.
    const chIdx = parseInt(level.replace("ch", ""), 10);
    const ch = savedEntry?.chapters?.[chIdx];
    const chapterLabel = ch?.title || `Chapter ${chIdx + 1}`;

    if (ch?.demoAction?.steps?.length) {
      setBuilderProposedAction({
        featureId,
        level,
        chapterIndex: chIdx,
        demoAction: ch.demoAction,
        narration: ch.narration || "",
      });
      const stepSummary = ch.demoAction.steps
        .slice(0, 6)
        .map((s, i) => `  ${i + 1}. ${s.action}${s.selector ? ` ${s.selector}` : ""}${s.value ? ` "${s.value}"` : ""}`)
        .join("\n");
      const more = ch.demoAction.steps.length > 6 ? `\n  … +${ch.demoAction.steps.length - 6} more` : "";
      const msg = `I want to edit chapter ${chIdx + 1} ("${chapterLabel}") of the "${feat.name}" feature (featureId: ${featureId}).\n\nHere's what's currently built (${ch.demoAction.steps.length} steps):\n${stepSummary}${more}\n\nWhat would you like to change?`;
      triggerAutoMessage(msg);
    } else {
      setBuilderProposedAction(null);
      const summary = ch?.summary || "";
      const notes = summary ? `\n\nChapter notes: "${summary}"` : "";
      const msg = `Let's build chapter ${chIdx + 1} ("${chapterLabel}") of the "${feat.name}" demo (featureId: ${featureId}).${notes}\n\nLet's go step by step — start by asking what screen this chapter begins on.`;
      triggerAutoMessage(msg);
    }
  };

  // ── Rebuild previewScript from a preset ──────────────────────────────────
  const rebuildPreviewScript = useCallback(
    (preset, featureList) => {
      if (!preset?.savedScript?.length) return;
      const fList = featureList || features;
      const enriched = preset.savedScript.map((ss) => {
        const feat = fList.find((f) => f.id === ss.featureId);
        const base = feat
          ? { ...feat }
          : { featureId: ss.featureId, id: ss.featureId, name: ss.featureId, category: "" };
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
      setPreviewScript(enriched);
    },
    [features],
  );

  // ── Preset CRUD ──────────────────────────────────────────────────────────
  const savePreset = async () => {
    if (!presetName.trim()) return toast.error("Enter a demo name first");
    const isUpdate = !!activePreset?._id;
    const url = isUpdate ? `${SERVER_URL}/api/demo/presets/${activePreset._id}` : `${SERVER_URL}/api/demo/presets`;

    const res = await fetch(url, {
      method: isUpdate ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: presetName, personalityPrompt, steps: selectedSteps }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success(isUpdate ? "Demo updated" : "Demo saved");
      setActivePreset(d.preset);
      loadPresets();
    } else toast.error(d.message || "Save failed");
  };

  const loadPreset = useCallback(
    (preset) => {
      setSelectedSteps(preset.steps || []);
      setPersonalityPrompt(preset.personalityPrompt || "");
      setPresetName(preset.name);
      setActivePreset(preset);
      setShowPresetDropdown(false);

      if (preset.savedScript?.length) {
        rebuildPreviewScript(preset);
        toast.success(`Loaded: ${preset.name} (saved script available)`);
      } else {
        setPreviewScript([]);
        toast.success(`Loaded: ${preset.name}`);
      }
    },
    [rebuildPreviewScript],
  );

  const deletePreset = async (id) => {
    if (!window.confirm("Delete this demo? This cannot be undone.")) return;
    await fetch(`${SERVER_URL}/api/demo/presets/${id}`, { method: "DELETE", credentials: "include" });
    if (activePreset?._id === id) {
      setActivePreset(null);
      setPreviewScript([]);
      setPresetName("");
    }
    loadPresets();
    toast.success("Demo deleted");
  };

  const handleNewDemo = () => {
    setActivePreset(null);
    setPreviewScript([]);
    setPresetName("");
    setSelectedSteps([]);
    setPersonalityPrompt("");
    setActiveTab("configure");
  };

  const saveScriptToPreset = async () => {
    if (!activePreset?._id || !hasLiveScript) return;
    setIsSavingScript(true);
    try {
      const existingMap = {};
      for (const e of activePreset.savedScript || []) {
        existingMap[e.featureId] = {
          ...e,
          chapters: e.chapters ? e.chapters.map((c) => ({ ...c })) : [],
        };
      }

      for (const s of scriptSteps) {
        const chMatch = s.id?.match(/^(.+)__ch(\d+)$/);
        if (chMatch) {
          const [, baseId, chIdxStr] = chMatch;
          const chIdx = parseInt(chIdxStr, 10);
          if (!existingMap[baseId])
            existingMap[baseId] = {
              featureId: baseId,
              headline: "",
              intro: "",
              introNarration: "",
              introDemoAction: null,
              narration: "",
              demoAction: null,
              chapters: [],
            };
          const chapters = existingMap[baseId].chapters;
          while (chapters.length <= chIdx)
            chapters.push({ title: `Chapter ${chapters.length + 1}`, summary: "", narration: "", demoAction: null });
          chapters[chIdx] = { ...chapters[chIdx], narration: s.narration };
        } else {
          if (!existingMap[s.id])
            existingMap[s.id] = {
              featureId: s.id,
              headline: "",
              intro: "",
              introNarration: s.narration,
              introDemoAction: null,
              narration: s.narration,
              demoAction: null,
              chapters: [],
            };
          else existingMap[s.id] = { ...existingMap[s.id], introNarration: s.narration, narration: s.narration };
        }
      }

      const payload = Object.values(existingMap);
      const res = await fetch(`${SERVER_URL}/api/demo/presets/${activePreset._id}/script`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedScript: payload, scriptPersonalityPrompt: personalityPrompt }),
      });
      const d = await res.json();
      if (d.success) {
        setActivePreset(d.preset);
        rebuildPreviewScript(d.preset);
        toast.success(`Script saved to "${activePreset.name}"`);
        loadPresets();
      } else toast.error(d.message || "Failed to save script");
    } finally {
      setIsSavingScript(false);
    }
  };

  const startEditing = () => {
    const initial = {};
    displayScript.forEach((step) => {
      initial[step.id] = step.introNarration || step.narration || step.description || "";
      step.chapters?.forEach((ch, ci) => {
        initial[`${step.id}__ch${ci}`] = ch.narration || "";
      });
    });
    setEditedNarrations(initial);
    setIsEditing(true);
    const allOpen = {};
    displayScript.forEach((step) => {
      allOpen[step.id] = true;
    });
    setExpandedScript(allOpen);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedNarrations({});
  };

  const saveEdits = async () => {
    if (!activePreset?._id) {
      toast.error("Save this configuration as a demo first, then you can save script edits.");
      return;
    }
    setIsSavingScript(true);
    try {
      const updatedScript = displayScript.map((step) => {
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
            narration: editedNarrations[`${step.id}__ch${ci}`] ?? ch.narration ?? "",
          }));
        }
        return entry;
      });
      const res = await fetch(`${SERVER_URL}/api/demo/presets/${activePreset._id}/script`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedScript: updatedScript, scriptPersonalityPrompt: personalityPrompt }),
      });
      const d = await res.json();
      if (d.success) {
        setActivePreset(d.preset);
        setPreviewScript(
          displayScript.map((step) => ({
            ...step,
            introNarration: editedNarrations[step.id] ?? step.introNarration,
            narration: editedNarrations[step.id] ?? step.narration,
            chapters: step.chapters?.length
              ? step.chapters.map((ch, ci) => ({
                  ...ch,
                  narration: editedNarrations[`${step.id}__ch${ci}`] ?? ch.narration,
                }))
              : step.chapters,
          })),
        );
        setIsEditing(false);
        setEditedNarrations({});
        toast.success("Script edits saved");
        loadPresets();
      } else toast.error(d.message || "Failed to save edits");
    } finally {
      setIsSavingScript(false);
    }
  };

  const handleStartDemo = async (useSaved = false) => {
    setIsStarting(true);
    const savedScript = activePreset?.savedScript?.length ? activePreset.savedScript : null;
    const ok = await ctxStartDemo(selectedSteps, personalityPrompt, { savedScript, regenerate: !useSaved });
    setIsStarting(false);
    if (ok) setActiveTab("script");
  };

  const handleRegenerate = async () => {
    setPreviewScript([]);
    await handleStartDemo(false);
  };

  // ── Save builder action ───────────────────────────────────────────────────
  const saveBuilderAction = async () => {
    if (!builderProposedAction || !activePreset?._id) return;
    setIsSavingAction(true);
    const effectiveLevel = builderProposedAction.level || builderLevel || "intro";
    const chIdx =
      builderProposedAction.chapterIndex ??
      (effectiveLevel.startsWith("ch") ? parseInt(effectiveLevel.replace("ch", ""), 10) : undefined);
    try {
      const body = {
        featureId: builderProposedAction.featureId,
        demoAction: builderProposedAction.demoAction,
        narration: builderProposedAction.narration || "",
        level: effectiveLevel.startsWith("ch") ? "chapter" : "intro",
      };
      if (effectiveLevel.startsWith("ch")) {
        body.chapterIndex = chIdx;
      }
      const res = await fetch(`${SERVER_URL}/api/demo/presets/${activePreset._id}/action`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.success) {
        setActivePreset(d.preset);
        rebuildPreviewScript(d.preset);
        loadPresets();
        setBuilderProposedAction(null);
        const featureName =
          features.find((f) => f.id === builderProposedAction.featureId)?.name || builderProposedAction.featureId;
        const levelLabel = effectiveLevel === "intro" ? "" : ` (Chapter ${(chIdx ?? 0) + 1})`;
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

  const tabs = [
    { id: "configure", label: "Menu" },
    { id: "script", label: "Script", badge: scriptSource !== null },
    { id: "builder", label: "Builder", badge: false },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Sales Demo</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure and run an AI-powered interactive product presentation.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.badge && <span className="ml-2 h-2 w-2 rounded-full bg-green-500 inline-block align-middle" />}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {/* ── Configure tab (Menu) ─────────────────────────────────────────── */}
        {activeTab === "configure" && (
          <div className="h-full flex flex-col overflow-hidden">
            {/* ── Top bar: preset management + narrative instructions ── */}
            <div className="shrink-0 border-b border-gray-200 bg-white px-5 py-3 space-y-3">
              {/* Preset row */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Demo name (e.g. Credit Union Pitch)"
                  className="flex-1 min-w-40 rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={savePreset}
                  className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
                >
                  <FiSave size={13} /> {activePreset?._id ? "Update" : "Save"}
                </button>
                <div className="relative shrink-0">
                  <button
                    onClick={() => setShowPresetDropdown((p) => !p)}
                    disabled={!presets.length}
                    className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Load <FiChevronDown size={13} />
                  </button>
                  {showPresetDropdown && (
                    <div className="absolute left-0 top-full mt-1 z-20 min-w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
                      {presets.map((p) => (
                        <div key={p._id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                          <button onClick={() => loadPreset(p)} className="text-sm text-gray-700 text-left flex-1">
                            <span className="font-medium">{p.name}</span>
                            <span className="block text-xs text-gray-400">
                              {p.steps?.length || 0} steps
                              {p.savedScript?.length ? ` · saved ${formatDate(p.scriptGeneratedAt)}` : " · no script"}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {activePreset?._id && (
                  <button
                    onClick={() => deletePreset(activePreset._id)}
                    className="flex items-center gap-1.5 rounded-md border border-red-100 px-2.5 py-1.5 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                    title="Delete this demo"
                  >
                    <FiTrash2 size={13} />
                  </button>
                )}
                {activePreset?._id && (
                  <button
                    onClick={handleNewDemo}
                    className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
                    title="Clear and start a new demo"
                  >
                    <FiPlus size={13} /> New
                  </button>
                )}
                <div className="flex-1" />
                {selectedSteps.length > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    {hasSavedScript && (
                      <button
                        onClick={handleRegenerate}
                        disabled={isStarting}
                        className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                      >
                        <FiRefreshCw size={13} /> Regenerate
                      </button>
                    )}
                    <button
                      onClick={() => handleStartDemo(hasSavedScript)}
                      disabled={isStarting}
                      className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {isStarting ? (
                        <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <HiOutlineSparkles size={13} />
                      )}
                      {isStarting ? "Generating…" : "Create Script"}
                    </button>
                  </div>
                )}
              </div>
              {activePreset && (
                <p className="text-xs text-gray-400 -mt-1">
                  Active: <span className="font-medium text-gray-600">{activePreset.name}</span>
                  {hasSavedScript && <span className="ml-1 text-green-600">· script saved {savedScriptDate}</span>}
                  {!hasSavedScript && <span className="ml-1">· no saved script</span>}
                </p>
              )}

              {/* Narrative instructions */}
              <div className="flex items-start gap-2">
                <HiOutlineSparkles className="text-primary mt-0.5 shrink-0" size={14} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Narrative Instructions</p>
                  <textarea
                    value={personalityPrompt}
                    onChange={(e) => setPersonalityPrompt(e.target.value)}
                    rows={2}
                    placeholder="Describe your audience and desired tone — the AI uses this to shape narration for every section…"
                    className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ── Feature list by category (scrollable) ── */}
            <div className="flex-1 overflow-y-auto">
              {/* Selection summary row */}
              <div className="flex items-center justify-between px-5 py-2 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
                <p className="text-xs text-gray-500">
                  {selectedSteps.length > 0 ? (
                    <>
                      <span className="font-medium text-gray-700">{selectedSteps.length}</span> feature
                      {selectedSteps.length !== 1 ? "s" : ""} selected
                    </>
                  ) : (
                    "No features selected — check items below to include them in the presentation"
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedSteps(features.map((f, i) => ({ featureId: f.id, enabled: true, order: i })))
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSteps([])}
                    className="text-xs text-gray-400 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {categories.map((cat) => {
                const catFeatures = features.filter((f) => f.category === cat);
                const selectedInCat = catFeatures.filter((f) => selectedSteps.some((s) => s.featureId === f.id)).length;
                return (
                  <div key={cat}>
                    {/* Category header */}
                    <div className="flex items-center justify-between px-5 py-2 bg-gray-50 border-b border-gray-200">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{cat}</span>
                      <span className="text-[10px] text-gray-400">
                        {selectedInCat}/{catFeatures.length}
                      </span>
                    </div>

                    {catFeatures.map((feat) => {
                      const isSelected = selectedSteps.some((s) => s.featureId === feat.id);
                      const savedEntry = activePreset?.savedScript?.find((s) => s.featureId === feat.id);
                      const isExpanded = isSelected && collapsedOutline[feat.id] !== true;
                      const isSaving = savingOutline[feat.id];
                      const chapters = savedEntry?.chapters || [];
                      const introAction = savedEntry?.introDemoAction || savedEntry?.demoAction;

                      const toggleFeature = () => {
                        if (isSelected) {
                          setSelectedSteps((prev) => prev.filter((s) => s.featureId !== feat.id));
                        } else {
                          const maxOrder = selectedSteps.reduce((m, s) => Math.max(m, s.order ?? 0), -1);
                          setSelectedSteps((prev) => [
                            ...prev,
                            { featureId: feat.id, enabled: true, order: maxOrder + 1 },
                          ]);
                        }
                      };

                      return (
                        <div
                          key={feat.id}
                          className={`border-b border-gray-100 transition-colors ${isSelected ? "bg-primary/2" : "bg-white"}`}
                        >
                          {/* Feature row */}
                          <div className="flex items-center gap-3 px-5 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={toggleFeature}
                              className="accent-primary cursor-pointer shrink-0 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium leading-tight ${isSelected ? "text-gray-900" : "text-gray-600"}`}
                              >
                                {feat.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate mt-0.5 leading-snug">{feat.description}</p>
                            </div>
                            {/* Status badges (only when selected and has saved content) */}
                            {isSelected && savedEntry && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                {savedEntry.headline && (
                                  <span className="text-[10px] text-primary/70 italic truncate max-w-32">
                                    "{savedEntry.headline}"
                                  </span>
                                )}
                                {chapters.length > 0 && (
                                  <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 rounded px-1.5">
                                    {chapters.length} ch
                                  </span>
                                )}
                                {introAction?.steps?.length > 0 && (
                                  <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 rounded px-1.5 flex items-center gap-0.5">
                                    <FiZap size={9} />
                                    {introAction.steps.length}
                                  </span>
                                )}
                              </div>
                            )}
                            {isSaving && <span className="text-[10px] text-gray-400 italic shrink-0">Saving…</span>}
                            {isSelected && (
                              <button
                                type="button"
                                onClick={() => setCollapsedOutline((p) => ({ ...p, [feat.id]: isExpanded }))}
                                className="text-gray-400 hover:text-gray-600 shrink-0"
                                title={isExpanded ? "Collapse" : "Expand outline"}
                              >
                                {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                              </button>
                            )}
                          </div>

                          {/* Inline outline editor */}
                          {isSelected && isExpanded && (
                            <div className="px-5 pb-4 pt-2 border-t border-gray-100 bg-primary/2.5 space-y-3">
                              {/* Headline */}
                              <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                                  Section Headline
                                </label>
                                <input
                                  type="text"
                                  defaultValue={savedEntry?.headline || ""}
                                  key={`headline-${feat.id}-${activePreset?._id}`}
                                  placeholder={feat.name}
                                  onBlur={(e) => {
                                    if (!activePreset?._id) return;
                                    saveFeatureOutline(feat.id, { headline: e.target.value });
                                  }}
                                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                              </div>

                              {/* Intro block: narrative notes → demo */}
                              <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
                                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                    {chapters.length > 0 ? "Intro" : "Narrative"} · Opening
                                  </span>
                                </div>
                                <div className="p-3 space-y-2">
                                  <div>
                                    <label className="text-[10px] text-gray-400 block mb-1">
                                      Narrative notes — AI writes the script from these
                                    </label>
                                    <textarea
                                      defaultValue={savedEntry?.intro || ""}
                                      key={`intro-${feat.id}-${activePreset?._id}`}
                                      rows={3}
                                      placeholder="What you want to say here — key points, tone cues, audience hooks…"
                                      onBlur={(e) => {
                                        if (!activePreset?._id) return;
                                        saveFeatureOutline(feat.id, { intro: e.target.value });
                                      }}
                                      className="w-full rounded border border-gray-100 bg-gray-50 px-2 py-1.5 text-xs text-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-400 block mb-1">Demo action</label>
                                    {introAction?.steps?.length > 0 ? (
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => openBuilderForLevel(feat.id, "intro")}
                                          className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-1.5 hover:bg-green-100 transition-colors"
                                        >
                                          <FiZap size={11} />
                                          {introAction.steps.length} step{introAction.steps.length !== 1 ? "s" : ""} ·
                                          Edit Demo →
                                        </button>
                                        <button
                                          onClick={async () => {
                                            if (!window.confirm("Remove this demo action?")) return;
                                            const res = await fetch(
                                              `${SERVER_URL}/api/demo/presets/${activePreset._id}/action`,
                                              {
                                                method: "PATCH",
                                                credentials: "include",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                  featureId: feat.id,
                                                  demoAction: null,
                                                  narration: "",
                                                  level: "intro",
                                                }),
                                              },
                                            );
                                            const d = await res.json();
                                            if (d.success) {
                                              setActivePreset(d.preset);
                                              rebuildPreviewScript(d.preset);
                                            } else toast.error(d.message || "Failed to remove action");
                                          }}
                                          title="Remove demo action"
                                          className="flex items-center justify-center rounded-md border border-red-200 p-1.5 text-red-400 hover:bg-red-50 transition-colors"
                                        >
                                          <FiTrash2 size={11} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          if (!activePreset?._id) {
                                            toast.warn("Enter a demo name above and click Save first");
                                            return;
                                          }
                                          openBuilderForLevel(feat.id, "intro");
                                        }}
                                        className="flex items-center gap-1.5 text-xs text-gray-500 border border-dashed border-gray-300 rounded-md px-3 py-1.5 hover:border-primary/40 hover:text-primary hover:bg-primary/3 transition-colors"
                                      >
                                        <FiZap size={11} /> + Build Demo
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Chapters — each with narrative + demo */}
                              {chapters.map((ch, ci) => (
                                <div key={ci} className="rounded-md border border-gray-200 bg-white overflow-hidden">
                                  {/* Chapter header */}
                                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                    <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                                      CH {ci + 1}
                                    </span>
                                    <input
                                      type="text"
                                      defaultValue={ch.title || `Chapter ${ci + 1}`}
                                      key={`ch-title-${feat.id}-${ci}-${activePreset?._id}`}
                                      placeholder={`Chapter ${ci + 1} title`}
                                      onBlur={(e) => {
                                        if (!activePreset?._id) return;
                                        const updated = chapters.map((c, i) =>
                                          i === ci
                                            ? { title: e.target.value, summary: c.summary || "" }
                                            : { title: c.title, summary: c.summary || "" },
                                        );
                                        saveFeatureOutline(feat.id, { chapters: updated });
                                      }}
                                      className="flex-1 text-xs font-semibold text-gray-700 bg-transparent focus:outline-none min-w-0 placeholder:text-gray-400"
                                    />
                                    <button
                                      onClick={() => removeChapter(feat.id, ci)}
                                      className="text-gray-300 hover:text-red-400 shrink-0 transition-colors"
                                      title="Remove chapter"
                                    >
                                      <FiX size={12} />
                                    </button>
                                  </div>
                                  {/* Chapter body: narrative + demo */}
                                  <div className="p-3 space-y-2">
                                    <div>
                                      <label className="text-[10px] text-gray-400 block mb-1">Narrative notes</label>
                                      <textarea
                                        defaultValue={ch.summary || ""}
                                        key={`ch-summary-${feat.id}-${ci}-${activePreset?._id}`}
                                        rows={2}
                                        placeholder="What the narrator says here — story beats, key points to hit…"
                                        onBlur={(e) => {
                                          if (!activePreset?._id) return;
                                          const updated = chapters.map((c, i) =>
                                            i === ci
                                              ? { title: c.title, summary: e.target.value }
                                              : { title: c.title, summary: c.summary || "" },
                                          );
                                          saveFeatureOutline(feat.id, { chapters: updated });
                                        }}
                                        className="w-full text-xs rounded border border-gray-100 bg-gray-50 px-2 py-1.5 text-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-gray-400 block mb-1">Demo action</label>
                                      {ch.demoAction?.steps?.length > 0 ? (
                                        <button
                                          onClick={() => openBuilderForLevel(feat.id, `ch${ci}`)}
                                          className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-1.5 hover:bg-green-100 transition-colors"
                                        >
                                          <FiZap size={11} />
                                          {ch.demoAction.steps.length} step{ch.demoAction.steps.length !== 1 ? "s" : ""}{" "}
                                          · Edit Demo →
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => openBuilderForLevel(feat.id, `ch${ci}`)}
                                          className="flex items-center gap-1.5 text-xs text-gray-500 border border-dashed border-gray-300 rounded-md px-3 py-1.5 hover:border-primary/40 hover:text-primary hover:bg-primary/3 transition-colors"
                                        >
                                          <FiZap size={11} /> + Build Demo
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Add Chapter */}
                              <button
                                onClick={() => {
                                  if (!activePreset?._id) {
                                    toast.warn("Enter a demo name above and click Save first");
                                    return;
                                  }
                                  addChapter(feat.id);
                                }}
                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary hover:underline transition-colors"
                              >
                                <FiPlus size={11} /> Add Chapter
                              </button>
                              {!activePreset?._id && (
                                <p className="text-[10px] text-amber-500">Save a preset name above to enable editing</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {features.length === 0 && (
                <div className="text-center py-16 text-sm text-gray-400">Loading features…</div>
              )}
            </div>
          </div>
        )}

        {/* ── Script tab ───────────────────────────────────────────────────── */}
        {activeTab === "script" && (
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {/* Generating spinner */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">Writing your demo script…</p>
                  <p className="text-xs text-gray-400 mt-1">
                    AI is generating narration for {session?.totalSteps || selectedSteps.length} steps.
                  </p>
                </div>
              </div>
            )}

            {/* Script content */}
            {!isGenerating && displayScript.length > 0 && (
              <>
                {/* Script header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-800">
                      {scriptSource === "saved" ? "Saved Script" : "Generated Script"}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {displayScript.length} step{displayScript.length !== 1 ? "s" : ""}
                      {" · "}
                      {displayScript.reduce((s, x) => s + (x.estimatedMins || 0), 0)} min estimated
                      {scriptSource === "saved" && savedScriptDate && (
                        <span className="ml-1 text-green-600">· saved {savedScriptDate}</span>
                      )}
                      {scriptSource === "saved" && activePreset?.scriptPersonalityPrompt && (
                        <span className="ml-1 text-gray-400 italic">
                          · persona: "{activePreset.scriptPersonalityPrompt.slice(0, 60)}
                          {activePreset.scriptPersonalityPrompt.length > 60 ? "…" : ""}"
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdits}
                          disabled={isSavingScript}
                          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          {isSavingScript ? (
                            <span className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : (
                            <FiCheck size={13} />
                          )}
                          Save Edits
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <FiX size={13} /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={startEditing}
                          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <FiEdit2 size={13} /> Edit Script
                        </button>
                        <button
                          onClick={handleRegenerate}
                          disabled={isStarting || !selectedSteps.length}
                          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        >
                          <FiRefreshCw size={13} /> Regenerate
                        </button>
                        {scriptSource === "live" && activePreset?._id && (
                          <button
                            onClick={saveScriptToPreset}
                            disabled={isSavingScript}
                            className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            {isSavingScript ? (
                              <span className="h-3 w-3 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                            ) : (
                              <FiSave size={13} />
                            )}
                            Save to "{activePreset.name}"
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Script steps */}
                <div className="space-y-3">
                  {displayScript.map((step, idx) => {
                    const isExpanded = expandedScript[step.id] !== false;
                    const stepNarration = step.introNarration || step.narration;
                    return (
                      <div key={step.id || idx} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedScript((p) => ({ ...p, [step.id]: !isExpanded }))}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-mono text-gray-400 w-5 text-right shrink-0">{idx + 1}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-gray-800 truncate">
                                  {step.headline || step.name}
                                </p>
                                {step.naturalPause && (
                                  <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 rounded px-1 shrink-0">
                                    pause
                                  </span>
                                )}
                                {step.chapters?.length > 0 ? (
                                  <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 rounded px-1.5 shrink-0">
                                    {step.chapters.length} chapter{step.chapters.length !== 1 ? "s" : ""}
                                  </span>
                                ) : (
                                  (step.introDemoAction || step.demoAction)?.steps?.length > 0 && (
                                    <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 rounded px-1.5 shrink-0 flex items-center gap-0.5">
                                      <FiZap size={9} />
                                      {(step.introDemoAction || step.demoAction).steps.length} action
                                      {(step.introDemoAction || step.demoAction).steps.length !== 1 ? "s" : ""}
                                    </span>
                                  )
                                )}
                              </div>
                              <p className="text-xs text-gray-400 truncate">{step.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            {step.estimatedMins > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                                <FiClock size={11} />
                                {step.estimatedMins}m
                              </span>
                            )}
                            {isExpanded ? (
                              <FiChevronUp size={14} className="text-gray-400" />
                            ) : (
                              <FiChevronDown size={14} className="text-gray-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-gray-100 px-4 py-3 bg-primary/3">
                            {/* Intro narration always shown */}
                            <div className="mb-3">
                              <div className="flex items-center gap-1.5 mb-2">
                                <HiOutlineSparkles size={12} className="text-primary" />
                                <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                                  {step.chapters?.length > 0 ? "Intro Script" : "Script"}
                                </span>
                              </div>
                              {isEditing ? (
                                <textarea
                                  value={editedNarrations[step.id] ?? stepNarration ?? ""}
                                  onChange={(e) => setEditedNarrations((p) => ({ ...p, [step.id]: e.target.value }))}
                                  rows={5}
                                  className="w-full rounded-md border border-primary/30 bg-white px-3 py-2 text-sm text-gray-700 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                              ) : (
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {stepNarration || step.description}
                                </p>
                              )}

                              {/* Intro demo action */}
                              {(() => {
                                const introAction = step.introDemoAction || step.demoAction;
                                if (!step.chapters?.length) {
                                  if (introAction?.steps?.length > 0) {
                                    return (
                                      <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2.5">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                          <div className="flex items-center gap-1.5">
                                            <FiZap size={11} className="text-green-600" />
                                            <span className="text-[10px] font-semibold text-green-700 uppercase tracking-wide">
                                              Live Action · {introAction.steps.length} step
                                              {introAction.steps.length !== 1 ? "s" : ""}
                                            </span>
                                          </div>
                                          <button
                                            onClick={() => openBuilderForLevel(step.id, "intro")}
                                            className="text-[10px] text-green-600 hover:underline"
                                          >
                                            Edit in Builder →
                                          </button>
                                        </div>
                                        <div className="space-y-1">
                                          {introAction.steps.slice(0, 4).map((a, ai) => (
                                            <div
                                              key={ai}
                                              className="flex items-center gap-1.5 text-[11px] text-gray-600"
                                            >
                                              <span className="font-mono text-green-700 shrink-0">{a.action}</span>
                                              {a.selector && (
                                                <span className="text-gray-400 truncate">{a.selector}</span>
                                              )}
                                              {a.value && <span className="text-gray-500 truncate">"{a.value}"</span>}
                                            </div>
                                          ))}
                                          {introAction.steps.length > 4 && (
                                            <p className="text-[10px] text-gray-400 italic">
                                              +{introAction.steps.length - 4} more…
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  } else if (!isEditing) {
                                    return (
                                      <button
                                        onClick={() => openBuilderForLevel(step.id, "intro")}
                                        className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-primary transition-colors"
                                      >
                                        <FiZap size={11} /> Build live action for this step →
                                      </button>
                                    );
                                  }
                                }
                                return null;
                              })()}
                            </div>

                            {/* Chapters */}
                            {step.chapters?.length > 0 && (
                              <div>
                                <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wide">
                                  {step.chapters.length} Chapter{step.chapters.length !== 1 ? "s" : ""}
                                </span>
                                <div className="space-y-2 mt-2">
                                  {step.chapters.map((ch, ci) => {
                                    const chKey = `${step.id}__ch${ci}`;
                                    const chNarration = ch.narration;
                                    return (
                                      <div
                                        key={ci}
                                        className="rounded-md border border-purple-100 bg-white overflow-hidden"
                                      >
                                        <div className="flex items-center justify-between px-3 py-2 bg-purple-50">
                                          <span className="text-xs font-semibold text-purple-700">
                                            {ch.title || `Chapter ${ci + 1}`}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            {ch.demoAction?.steps?.length > 0 && (
                                              <span className="text-[10px] text-green-600 flex items-center gap-0.5">
                                                <FiZap size={9} />
                                                {ch.demoAction.steps.length} action
                                                {ch.demoAction.steps.length !== 1 ? "s" : ""}
                                              </span>
                                            )}
                                            {!isEditing && (
                                              <button
                                                onClick={() => openBuilderForLevel(step.id, `ch${ci}`)}
                                                className="text-[10px] text-purple-500 hover:underline"
                                              >
                                                {ch.demoAction?.steps?.length > 0 ? "Edit action →" : "Build action →"}
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <div className="px-3 py-2">
                                          <div className="flex items-center gap-1 mb-1">
                                            <HiOutlineSparkles size={10} className="text-primary" />
                                            <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                                              Script
                                            </span>
                                          </div>
                                          {isEditing ? (
                                            <textarea
                                              value={editedNarrations[chKey] ?? chNarration ?? ""}
                                              onChange={(e) =>
                                                setEditedNarrations((p) => ({ ...p, [chKey]: e.target.value }))
                                              }
                                              rows={4}
                                              className="w-full rounded-md border border-primary/30 bg-white px-3 py-2 text-sm text-gray-700 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"
                                            />
                                          ) : (
                                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                              {chNarration || (
                                                <span className="text-gray-400 italic">
                                                  No script yet — click Edit Script above to add narration.
                                                </span>
                                              )}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Empty state */}
            {!isGenerating && displayScript.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="rounded-full bg-gray-100 p-5">
                  <HiOutlineSparkles size={28} className="text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">No script yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedSteps.length > 0
                      ? 'Use "Create Script" on the Configure tab to generate narration.'
                      : "Go to Configure, select features, then come back here to generate a script."}
                  </p>
                </div>
                {!selectedSteps.length && (
                  <button onClick={() => setActiveTab("configure")} className="text-sm text-primary hover:underline">
                    Go to Configure →
                  </button>
                )}
                {selectedSteps.length > 0 && (
                  <button
                    onClick={() => {
                      handleStartDemo(hasSavedScript);
                    }}
                    disabled={isStarting}
                    className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {isStarting ? (
                      <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <HiOutlineSparkles size={14} />
                    )}
                    {isStarting ? "Generating…" : "Create Script"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Builder tab ──────────────────────────────────────────────────── */}
        {activeTab === "builder" &&
          (() => {
            const activeFeat = features.find((f) => f.id === builderFeatureId);

            if (!builderFeatureId) {
              return (
                <div className="h-full overflow-y-auto p-6 flex flex-col items-center justify-center text-center gap-4 py-20">
                  <div className="rounded-full bg-gray-100 p-5">
                    <FiZap size={28} className="text-gray-400" />
                  </div>
                  <div className="max-w-sm">
                    <p className="text-sm font-semibold text-gray-700">No active builder target</p>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Click <strong>"Build Demo"</strong> on any feature in the Configure tab's Presentation Outline to
                      start building a live action sequence here.
                    </p>
                  </div>
                  <button onClick={() => setActiveTab("configure")} className="text-sm text-primary hover:underline">
                    Go to Configure →
                  </button>
                </div>
              );
            }

            const savedEntry = activePreset?.savedScript?.find((s) => s.featureId === builderFeatureId);
            const chIdx = builderLevel?.startsWith("ch") ? parseInt(builderLevel.replace("ch", ""), 10) : null;
            const isChapter = chIdx !== null;
            const ch = isChapter ? savedEntry?.chapters?.[chIdx] || {} : null;
            const levelLabel = isChapter ? `Chapter ${chIdx + 1}${ch?.title ? ` — ${ch.title}` : ""}` : "Intro";

            return (
              <div className="h-full overflow-y-auto p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setBuilderFeatureId(null);
                      setBuilderLevel(null);
                      setBuilderProposedAction(null);
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    ← Configure
                  </button>
                  <div>
                    <h2 className="text-base font-bold text-gray-800">{activeFeat?.name || builderFeatureId}</h2>
                    <p className="text-xs text-gray-500">
                      Building: <span className="font-medium text-gray-700">{levelLabel}</span>
                    </p>
                  </div>
                </div>

                {!activePreset?._id && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Load or create a demo preset in the{" "}
                    <button onClick={() => setActiveTab("configure")} className="font-semibold underline">
                      Configure tab
                    </button>{" "}
                    first — the Builder needs a preset to save into.
                  </div>
                )}

                {/* Proposed action panel */}
                {builderProposedAction?.featureId === builderFeatureId ? (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FiZap size={14} className="text-primary" />
                        <span className="text-sm font-semibold text-primary">Proposed Action</span>
                        <span className="text-xs text-gray-500">
                          ({builderProposedAction.demoAction?.steps?.length || 0} steps)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {activePreset?._id && (
                          <button
                            onClick={saveBuilderAction}
                            disabled={isSavingAction}
                            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                          >
                            {isSavingAction ? (
                              <span className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                              <FiSave size={11} />
                            )}
                            {isSavingAction ? "Saving…" : "Save Action"}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (!window.confirm("Clear all steps and remove this action?")) return;
                            setBuilderProposedAction((prev) => ({
                              ...prev,
                              demoAction: { steps: [], paramOverrides: {} },
                              narration: "",
                            }));
                          }}
                          title="Clear all steps"
                          className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <FiTrash2 size={11} /> Clear
                        </button>
                      </div>
                    </div>
                    {builderProposedAction.narration && (
                      <div className="rounded-md bg-white border border-gray-200 px-3 py-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                          Narration
                        </p>
                        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {builderProposedAction.narration}
                        </p>
                      </div>
                    )}
                    <div className="rounded-md bg-white border border-gray-200 px-3 py-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Steps</p>
                      <div className="space-y-1.5">
                        {builderProposedAction.demoAction?.steps?.map((s, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs group">
                            <span className="font-mono text-primary shrink-0 w-4 text-right mt-0.5">{i + 1}</span>
                            <span className="font-semibold text-gray-700 shrink-0">{s.action}</span>
                            {s.selector && <span className="text-gray-400 truncate">{s.selector}</span>}
                            {s.value && <span className="text-primary/70 italic truncate">"{s.value}"</span>}
                            {s.message && <span className="text-gray-500 truncate">{s.message}</span>}
                            <button
                              onClick={() =>
                                setBuilderProposedAction((prev) => ({
                                  ...prev,
                                  demoAction: {
                                    ...prev.demoAction,
                                    steps: prev.demoAction.steps.filter((_, j) => j !== i),
                                  },
                                }))
                              }
                              className="ml-auto shrink-0 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove step"
                            >
                              <FiX size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Variables — editable {{token}} values */}
                    {(() => {
                      const steps = builderProposedAction.demoAction?.steps || [];
                      const paramNames = [
                        ...new Set(
                          steps.flatMap((s) =>
                            ["value", "selector", "contains"].flatMap((f) =>
                              s[f] ? [...s[f].matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]) : [],
                            ),
                          ),
                        ),
                      ];
                      if (!paramNames.length) return null;
                      const overrides = builderProposedAction.demoAction?.paramOverrides || {};
                      return (
                        <div className="rounded-md bg-white border border-blue-200 px-3 py-2 space-y-2">
                          <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">Variables</p>
                          <p className="text-[10px] text-gray-400">
                            These values are used in the steps above. Edit them here — changes are saved with the
                            action.
                          </p>
                          {paramNames.map((name) => (
                            <div key={name} className="flex items-center gap-2">
                              <label
                                className="text-xs text-gray-500 font-mono shrink-0 w-32 truncate"
                                title={name}
                              >{`{{${name}}}`}</label>
                              <input
                                type="text"
                                value={overrides[name] ?? ""}
                                onChange={(e) =>
                                  setBuilderProposedAction((prev) => ({
                                    ...prev,
                                    demoAction: {
                                      ...prev.demoAction,
                                      paramOverrides: {
                                        ...(prev.demoAction?.paramOverrides || {}),
                                        [name]: e.target.value,
                                      },
                                    },
                                  }))
                                }
                                placeholder={`Enter ${name}…`}
                                className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    <p className="text-xs text-gray-500 italic">
                      Review the steps above. Use the AI widget to request adjustments, or click Save Action when it
                      looks right.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                    <FiZap size={24} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm font-semibold text-gray-600">No action built yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Use the AI chat widget (bottom right) to describe what you want to demonstrate for this level.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
      </div>
    </div>
  );
}
