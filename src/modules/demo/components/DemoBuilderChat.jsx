import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DemoBuilderDraft from "./DemoBuilderDraft";
import DemoBuilderMessages from "./DemoBuilderMessages";
import DemoBuilderSaveDialog from "./DemoBuilderSaveDialog";
import { DEMO_CHAT_ROLES, DEMO_STEP_RESULTS } from "../utils/demo.constants";
import { runDemoSteps } from "../utils/demo.utils";
import { requestDemoApi } from "../utils/demo.utils3";

const DemoBuilderChat = ({ featureId, featureName = "", presetId, presetName = "", onSaved, onCancel }) => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const [demoAction, setDemoAction] = useState({ steps: [], paramOverrides: {} });
  const [narration, setNarration] = useState("");
  const [proposedTestCase, setProposedTestCase] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const [previewResults, setPreviewResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(-1);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveAsTest, setSaveAsTest] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sendToAI = async (history) => {
    setIsThinking(true);
    try {
      const d = await requestDemoApi("/builder/chat", { method: "POST", body: { featureId, messages: history } });
      if (!d.success) throw new Error(d.message || "Builder chat failed");

      setMessages((prev) => [...prev, { role: DEMO_CHAT_ROLES.ASSISTANT, content: d.data?.message }]);

      if (d.data?.demoAction?.steps?.length) setDemoAction(d.data.demoAction);
      if (d.data?.narration) setNarration(d.data.narration);
      if (d.data?.proposedTestCase) setProposedTestCase(d.data.proposedTestCase);
      if (d.data?.ready) setIsReady(true);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsThinking(false);
    }
  };

  // start the interview on mount
  useEffect(() => {
    sendToAI([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isThinking) return;

    const newHistory = [...messages, { role: DEMO_CHAT_ROLES.USER, content: text }];
    setMessages(newHistory);
    setInput("");
    setPreviewResults([]);
    await sendToAI(newHistory);
  };

  const handlePreview = async () => {
    if (!demoAction.steps.length || isRunning) return;
    setIsRunning(true);
    setPreviewResults([]);
    setPreviewIdx(-1);

    const results = await runDemoSteps(demoAction.steps, {
      navigate,
      paramOverrides: demoAction.paramOverrides || {},
      onStepStart: (i) => setPreviewIdx(i),
      onStepComplete: (i, step) =>
        setPreviewResults((p) => [...p, { index: i, status: DEMO_STEP_RESULTS.PASS, step }]),
      onStepError: (i, step, err) =>
        setPreviewResults((p) => [...p, { index: i, status: DEMO_STEP_RESULTS.FAIL, step, error: err.message }]),
    });

    setPreviewIdx(-1);
    setIsRunning(false);

    const passed = results.filter((r) => r.status === DEMO_STEP_RESULTS.PASS).length;
    const failed = results.filter((r) => r.status === DEMO_STEP_RESULTS.FAIL).length;
    if (failed === 0) toast.success(`Preview complete — all ${passed} steps passed`);
    else toast.warn(`Preview: ${passed} passed, ${failed} failed — review steps in red`);
  };

  const handleSave = async () => {
    if (!presetId) {
      toast.error("Load a preset in Configure first");
      return;
    }
    setIsSaving(true);
    try {
      const d = await requestDemoApi("/builder/save", {
        method: "POST",
        body: {
          presetId,
          featureId,
          narration,
          demoAction,
          saveAsTestCase: saveAsTest,
          proposedTestCase: saveAsTest ? proposedTestCase : null,
        },
      });
      if (!d.success) throw new Error(d.message);
      toast.success(
        saveAsTest && d.data?.testCase
          ? `Saved demo + test case "${d.data.testCase.name}"`
          : `Saved demo action for "${featureName}"`,
      );
      setShowSaveDialog(false);
      onSaved?.();
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full gap-0 overflow-hidden">
      <DemoBuilderMessages
        featureName={featureName}
        messages={messages}
        input={input}
        isThinking={isThinking}
        onInputChange={setInput}
        onSend={handleSend}
        onCancel={onCancel}
      />
      <DemoBuilderDraft
        demoAction={demoAction}
        narration={narration}
        proposedTestCase={proposedTestCase}
        isReady={isReady}
        isRunning={isRunning}
        previewIdx={previewIdx}
        previewResults={previewResults}
        onPreview={handlePreview}
        onApprove={() => setShowSaveDialog(true)}
      />
      <DemoBuilderSaveDialog
        isOpen={showSaveDialog}
        featureName={featureName}
        presetLabel={presetName || presetId}
        proposedTestCase={proposedTestCase}
        saveAsTest={saveAsTest}
        isSaving={isSaving}
        onSaveAsTestChange={setSaveAsTest}
        onClose={() => setShowSaveDialog(false)}
        onConfirm={handleSave}
      />
    </div>
  );
};

export default DemoBuilderChat;
