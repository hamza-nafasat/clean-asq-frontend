import { useState } from "react";
import { toast } from "react-toastify";
import { mergeLiveScript, requestDemoApi } from "@/modules/demo/utils/demo.utils3";
import {
  applyEditsToScript,
  buildEditedScript,
  buildExpandedScript,
  buildInitialNarrations,
} from "@/modules/demo/utils/demo.utils4";

const useDemoScriptEditor = ({ displayScript, scriptSteps, hasLiveScript, presets }) => {
  const { activePreset, personalityPrompt, applySavedPreset, setActivePreset, setPreviewScript, loadPresets } = presets;
  const [isSavingScript, setIsSavingScript] = useState(false);
  const [expandedScript, setExpandedScript] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedNarrations, setEditedNarrations] = useState({});

  const postScript = (savedScript) =>
    requestDemoApi(`/presets/${activePreset._id}/script`, {
      method: "POST",
      body: { savedScript, scriptPersonalityPrompt: personalityPrompt },
    });

  const saveScriptToPreset = async () => {
    if (!activePreset?._id || !hasLiveScript) return;
    setIsSavingScript(true);
    try {
      const d = await postScript(mergeLiveScript(activePreset.savedScript || [], scriptSteps));
      if (d.success) {
        applySavedPreset(d.data);
        toast.success(`Script saved to "${activePreset.name}"`);
        loadPresets();
      } else toast.error(d.message || "Failed to save script");
    } finally {
      setIsSavingScript(false);
    }
  };

  const startEditing = () => {
    setEditedNarrations(buildInitialNarrations(displayScript));
    setIsEditing(true);
    setExpandedScript(buildExpandedScript(displayScript));
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
      const d = await postScript(buildEditedScript(displayScript, editedNarrations));
      if (d.success) {
        setActivePreset(d.data);
        setPreviewScript(applyEditsToScript(displayScript, editedNarrations));
        setIsEditing(false);
        setEditedNarrations({});
        toast.success("Script edits saved");
        loadPresets();
      } else toast.error(d.message || "Failed to save edits");
    } finally {
      setIsSavingScript(false);
    }
  };

  return {
    isSavingScript,
    expandedScript,
    setExpandedScript,
    isEditing,
    editedNarrations,
    setEditedNarrations,
    saveScriptToPreset,
    startEditing,
    cancelEditing,
    saveEdits,
  };
};

export default useDemoScriptEditor;
