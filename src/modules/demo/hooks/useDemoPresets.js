import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DEMO_BUILDER_LEVELS } from "@/modules/demo/utils/demo.constants";
import {
  enrichSavedScript,
  fetchDemoApi,
  findSavedEntry,
  requestDemoApi,
  toChapterOutline,
} from "@/modules/demo/utils/demo.utils3";

const useDemoPresets = () => {
  const [features, setFeatures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [presets, setPresets] = useState([]);
  const [activePreset, setActivePreset] = useState(null);
  const [previewScript, setPreviewScript] = useState([]);
  const [presetName, setPresetName] = useState("");
  const [selectedSteps, setSelectedSteps] = useState([]);
  const [personalityPrompt, setPersonalityPrompt] = useState("");
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [savingOutline, setSavingOutline] = useState({});

  const rebuildPreviewScript = (preset) => {
    if (!preset?.savedScript?.length) return;
    setPreviewScript(enrichSavedScript(preset.savedScript, features));
  };

  const applySavedPreset = (preset) => {
    setActivePreset(preset);
    rebuildPreviewScript(preset);
  };

  const loadPreset = (preset) => {
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
  };

  const loadPresets = (autoLoadIfEmpty = false) => {
    requestDemoApi("/presets")
      .then((d) => {
        if (!d.success) return;
        setPresets(d.data);
        // server returns the most recently updated first
        if (autoLoadIfEmpty && d.data.length > 0) loadPreset(d.data[0]);
      })
      .catch(() => {});
  };

  // load features and the latest preset once
  useEffect(() => {
    requestDemoApi("/features")
      .then((d) => {
        if (d.success) {
          setFeatures(d.data.features);
          setCategories(d.data.categories);
        }
      })
      .catch(() => toast.error("Failed to load demo features"));
    loadPresets(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveFeatureOutline = async (featureId, updates) => {
    if (!activePreset?._id) return null;
    setSavingOutline((p) => ({ ...p, [featureId]: true }));
    try {
      const d = await requestDemoApi(`/presets/${activePreset._id}/outline`, {
        method: "PATCH",
        body: { featureId, ...updates },
      });
      if (d.success) {
        applySavedPreset(d.data);
        return d.data;
      }
      toast.error(d.message || "Failed to save");
      return null;
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

  const addChapter = async (featureId) => {
    const current = findSavedEntry(activePreset, featureId)?.chapters || [];
    const newChapters = [...current, { title: `Chapter ${current.length + 1}`, summary: "" }];
    await saveFeatureOutline(featureId, { chapters: toChapterOutline(newChapters) });
  };

  const removeChapter = async (featureId, idx) => {
    if (!window.confirm(`Delete Chapter ${idx + 1}? This will remove its action sequence.`)) return;
    const chapters = findSavedEntry(activePreset, featureId)?.chapters || [];
    await saveFeatureOutline(featureId, { chapters: toChapterOutline(chapters.filter((_, i) => i !== idx)) });
  };

  const removeIntroAction = async (featureId) => {
    if (!window.confirm("Remove this demo action?")) return;
    const d = await requestDemoApi(`/presets/${activePreset._id}/action`, {
      method: "PATCH",
      body: { featureId, demoAction: null, narration: "", level: DEMO_BUILDER_LEVELS.INTRO },
    });
    if (d.success) applySavedPreset(d.data);
    else toast.error(d.message || "Failed to remove action");
  };

  const savePreset = async () => {
    if (!presetName.trim()) return toast.error("Enter a demo name first");
    const isUpdate = !!activePreset?._id;
    const d = await requestDemoApi(isUpdate ? `/presets/${activePreset._id}` : "/presets", {
      method: isUpdate ? "PUT" : "POST",
      body: { name: presetName, personalityPrompt, steps: selectedSteps },
    });
    if (d.success) {
      toast.success(isUpdate ? "Demo updated" : "Demo saved");
      setActivePreset(d.data);
      loadPresets();
    } else toast.error(d.message || "Save failed");
  };

  const clearActivePreset = () => {
    setActivePreset(null);
    setPreviewScript([]);
    setPresetName("");
  };

  const deletePreset = async (id) => {
    if (!window.confirm("Delete this demo? This cannot be undone.")) return;
    await fetchDemoApi(`/presets/${id}`, { method: "DELETE" });
    if (activePreset?._id === id) clearActivePreset();
    loadPresets();
    toast.success("Demo deleted");
  };

  const resetDemo = () => {
    clearActivePreset();
    setSelectedSteps([]);
    setPersonalityPrompt("");
  };

  const toggleFeature = (featureId) => {
    if (selectedSteps.some((s) => s.featureId === featureId)) {
      setSelectedSteps((prev) => prev.filter((s) => s.featureId !== featureId));
      return;
    }
    const maxOrder = selectedSteps.reduce((m, s) => Math.max(m, s.order ?? 0), -1);
    setSelectedSteps((prev) => [...prev, { featureId, enabled: true, order: maxOrder + 1 }]);
  };

  const selectAllFeatures = () =>
    setSelectedSteps(features.map((f, i) => ({ featureId: f.id, enabled: true, order: i })));

  return {
    features,
    categories,
    presets,
    activePreset,
    setActivePreset,
    previewScript,
    setPreviewScript,
    presetName,
    setPresetName,
    selectedSteps,
    setSelectedSteps,
    personalityPrompt,
    setPersonalityPrompt,
    showPresetDropdown,
    setShowPresetDropdown,
    savingOutline,
    rebuildPreviewScript,
    applySavedPreset,
    loadPreset,
    loadPresets,
    saveFeatureOutline,
    addChapter,
    removeChapter,
    removeIntroAction,
    savePreset,
    deletePreset,
    resetDemo,
    toggleFeature,
    selectAllFeatures,
  };
};

export default useDemoPresets;
