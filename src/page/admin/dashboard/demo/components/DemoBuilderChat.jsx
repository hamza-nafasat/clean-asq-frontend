/**
 * DemoBuilderChat.jsx
 *
 * AI interview interface for building demo cases (and optionally test cases)
 * one feature at a time.
 *
 * Layout:
 *   Left  — conversation thread with the AI coach
 *   Right — live draft panel showing the proposed action steps + narration
 *
 * Props:
 *   featureId       string    — which feature is being built
 *   featureName     string    — display name
 *   presetId        string    — which preset to save into (required for save)
 *   presetName      string    — for display
 *   onSaved         fn()      — called after a successful save
 *   onCancel        fn()      — called when user dismisses the builder
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import getEnv from "@/lib/env";
import { FiSend, FiPlay, FiCheck, FiX, FiSave, FiChevronDown, FiChevronUp, FiZap } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { runDemoSteps, DEMO_PERSONA } from "../demoStepExecutor";

const SERVER_URL = getEnv("SERVER_URL");

// ── Step display helper ───────────────────────────────────────────────────────
function StepRow({ step, index, status }) {
  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded-md text-xs border ${
      status === "running" ? "border-primary/30 bg-primary/5" :
      status === "pass"    ? "border-green-200 bg-green-50" :
      status === "fail"    ? "border-red-200 bg-red-50" :
                             "border-gray-100 bg-gray-50"
    }`}>
      <span className="font-mono text-gray-400 shrink-0 w-4 text-right">{index + 1}</span>
      <div className="min-w-0 flex-1">
        <span className={`font-semibold ${
          status === "pass" ? "text-green-700" :
          status === "fail" ? "text-red-600" :
          status === "running" ? "text-primary" : "text-gray-600"
        }`}>{step.action}</span>
        {step.selector && <span className="ml-1.5 text-gray-400 truncate">{step.selector}</span>}
        {step.value    && <span className="ml-1.5 text-gray-500">= "{step.value}"</span>}
        {step.message  && <p className="text-gray-400 mt-0.5 italic">{step.message}</p>}
      </div>
      {status === "running" && <span className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0 mt-0.5" />}
      {status === "pass"    && <FiCheck size={12} className="text-green-500 shrink-0 mt-0.5" />}
      {status === "fail"    && <FiX    size={12} className="text-red-400  shrink-0 mt-0.5" />}
    </div>
  );
}

export default function DemoBuilderChat({
  featureId,
  featureName,
  presetId,
  presetName,
  onSaved,
  onCancel,
}) {
  const navigate = useNavigate();

  // Conversation state
  const [messages, setMessages]       = useState([]);   // [{role, content}]
  const [input, setInput]             = useState("");
  const [isThinking, setIsThinking]   = useState(false);

  // Draft state (updated as AI refines)
  const [demoAction, setDemoAction]   = useState({ steps: [], paramOverrides: {} });
  const [narration, setNarration]     = useState("");
  const [proposedTestCase, setProposedTestCase] = useState(null);
  const [isReady, setIsReady]         = useState(false);

  // Preview state
  const [previewResults, setPreviewResults] = useState([]); // { index, status, step }
  const [isRunning, setIsRunning]     = useState(false);
  const [previewIdx, setPreviewIdx]   = useState(-1); // currently executing step index

  // Save dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveAsTest, setSaveAsTest]   = useState(true);
  const [isSaving, setIsSaving]       = useState(false);

  const [showSteps, setShowSteps]     = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Kick off the interview with the first AI message on mount
  useEffect(() => {
    sendToAI([]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── API call ────────────────────────────────────────────────────────────────
  async function sendToAI(history) {
    setIsThinking(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/demo/builder/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureId, messages: history }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message || "Builder chat failed");

      // Append AI reply to conversation
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: d.message },
      ]);

      // Update draft
      if (d.demoAction?.steps?.length) setDemoAction(d.demoAction);
      if (d.narration) setNarration(d.narration);
      if (d.proposedTestCase) setProposedTestCase(d.proposedTestCase);
      if (d.ready) setIsReady(true);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsThinking(false);
    }
  }

  // ── Send user message ────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isThinking) return;

    const newHistory = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newHistory);
    setInput("");
    setPreviewResults([]);
    await sendToAI(newHistory);
  };

  // ── Preview: run steps in live browser ──────────────────────────────────────
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
        setPreviewResults((p) => [...p, { index: i, status: "pass", step }]),
      onStepError: (i, step, err) =>
        setPreviewResults((p) => [...p, { index: i, status: "fail", step, error: err.message }]),
    });

    setPreviewIdx(-1);
    setIsRunning(false);

    const passed = results.filter((r) => r.status === "pass").length;
    const failed = results.filter((r) => r.status === "fail").length;
    if (failed === 0) {
      toast.success(`Preview complete — all ${passed} steps passed`);
    } else {
      toast.warn(`Preview: ${passed} passed, ${failed} failed — review steps in red`);
    }
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!presetId) { toast.error("Load a preset in Configure first"); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/demo/builder/save`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presetId,
          featureId,
          narration,
          demoAction,
          saveAsTestCase: saveAsTest,
          proposedTestCase: saveAsTest ? proposedTestCase : null,
        }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      toast.success(
        saveAsTest && d.testCase
          ? `Saved demo + test case "${d.testCase.name}"`
          : `Saved demo action for "${featureName}"`
      );
      setShowSaveDialog(false);
      onSaved?.();
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const hasSteps     = demoAction.steps.length > 0;
  const resultMap    = Object.fromEntries(previewResults.map((r) => [r.index, r]));

  return (
    <div className="flex h-full gap-0 overflow-hidden">

      {/* ── Left: conversation ────────────────────────────────────────────── */}
      <div className="flex flex-col w-1/2 border-r border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <HiOutlineSparkles size={15} className="text-primary" />
            <span className="text-sm font-semibold text-gray-800">Demo Builder</span>
            <span className="text-xs text-gray-400">— {featureName}</span>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <FiX size={15} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1 mb-1">
                    <HiOutlineSparkles size={11} className="text-primary" />
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Builder AI</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-xl rounded-bl-sm px-3 py-2 flex items-center gap-2">
                <span className="h-3 w-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                <span className="text-xs text-gray-500">thinking…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t border-gray-100 shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Reply to the AI coach…"
            disabled={isThinking}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="rounded-lg bg-primary px-3 py-2 text-white disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            <FiSend size={14} />
          </button>
        </form>
      </div>

      {/* ── Right: draft panel ────────────────────────────────────────────── */}
      <div className="flex flex-col w-1/2 overflow-hidden">
        {/* Draft header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <span className="text-sm font-semibold text-gray-800">Draft</span>
          <div className="flex items-center gap-2">
            {hasSteps && (
              <button
                onClick={handlePreview}
                disabled={isRunning}
                className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                title="Run these steps in the live browser"
              >
                {isRunning
                  ? <span className="h-3 w-3 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                  : <FiPlay size={12} />}
                {isRunning ? "Running…" : "Preview"}
              </button>
            )}
            {(isReady || hasSteps) && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                <FiSave size={12} /> Approve & Save
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Narration preview */}
          {narration && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <HiOutlineSparkles size={11} className="text-primary" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Narration</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{narration}</p>
            </div>
          )}

          {/* Action steps */}
          {hasSteps ? (
            <div>
              <button
                onClick={() => setShowSteps((p) => !p)}
                className="flex items-center gap-2 w-full text-left mb-2"
              >
                <span className="text-xs font-semibold text-gray-700">
                  {demoAction.steps.length} Action Step{demoAction.steps.length !== 1 ? "s" : ""}
                </span>
                {showSteps ? <FiChevronUp size={12} className="text-gray-400" /> : <FiChevronDown size={12} className="text-gray-400" />}
              </button>
              {showSteps && (
                <div className="space-y-1.5">
                  {demoAction.steps.map((step, i) => {
                    const result = resultMap[i];
                    const status = previewIdx === i ? "running" : result?.status ?? null;
                    return <StepRow key={i} step={step} index={i} status={status} />;
                  })}
                </div>
              )}
              {/* Param overrides */}
              {Object.keys(demoAction.paramOverrides || {}).length > 0 && (
                <div className="mt-3 rounded-md border border-gray-100 p-2.5">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Demo Data</p>
                  {Object.entries(demoAction.paramOverrides).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-primary">{`{{${k}}}`}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-700">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="rounded-full bg-gray-100 p-4">
                <FiZap size={22} className="text-gray-300" />
              </div>
              <p className="text-xs text-gray-400">Answer the AI's questions on the left<br />and action steps will appear here.</p>
            </div>
          )}

          {/* Proposed test case summary */}
          {proposedTestCase && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <FiCheck size={11} className="text-green-600" />
                <span className="text-[10px] font-semibold text-green-700 uppercase tracking-wide">Proposed Test Case</span>
              </div>
              <p className="text-xs text-gray-700 font-medium">{proposedTestCase.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{proposedTestCase.steps?.length || 0} steps · area: {proposedTestCase.area}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Save dialog ───────────────────────────────────────────────────── */}
      {showSaveDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-96">
            <h3 className="text-base font-bold text-gray-800 mb-1">Save Demo Action</h3>
            <p className="text-sm text-gray-500 mb-4">
              Saving "{featureName}" demo action to preset <strong>{presetName || presetId}</strong>.
            </p>

            {/* Save as test case toggle */}
            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={saveAsTest}
                onChange={(e) => setSaveAsTest(e.target.checked)}
                disabled={!proposedTestCase}
                className="mt-0.5"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Also create test case</span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {proposedTestCase
                    ? `Will create "${proposedTestCase.name}" in the test suite.`
                    : "No proposed test case yet — continue the interview to generate one."}
                </p>
              </div>
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                disabled={isSaving}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving
                  ? <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <FiSave size={14} />}
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
