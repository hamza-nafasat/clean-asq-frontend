import { useEffect, useRef } from "react";
import { FiCheckCircle, FiXCircle, FiLoader, FiClock } from "react-icons/fi";

const AREA_COLORS = {
  "Authentication":  "bg-purple-100 text-purple-700",
  "Branding":        "bg-blue-100 text-blue-700",
  "Form Builder":    "bg-cyan-100 text-cyan-700",
  "Email Templates": "bg-yellow-100 text-yellow-700",
  "User Management": "bg-orange-100 text-orange-700",
  "Admin Review":    "bg-teal-100 text-teal-700",
  "Applicant Flow":  "bg-indigo-100 text-indigo-700",
  "AI Chat":         "bg-pink-100 text-pink-700",
};

function StatusIcon({ status }) {
  if (status === "pass")    return <FiCheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
  if (status === "fail")    return <FiXCircle      className="h-4 w-4 text-red-500 shrink-0" />;
  return <FiLoader className="h-4 w-4 text-gray-400 shrink-0 animate-spin" />;
}

export default function TestLogStream({ logs, isRunning, runMeta, passCount, failCount }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom as logs arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  const doneCount = passCount + failCount;
  const totalTests = runMeta?.totalTests ?? "?";
  const pct = totalTests !== "?" && totalTests > 0
    ? Math.round((doneCount / totalTests) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Progress bar */}
      {runMeta && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>
              {isRunning ? `Running… ${doneCount}/${totalTests}` : `Completed — ${doneCount}/${totalTests}`}
            </span>
            <span className="font-medium">
              <span className="text-green-600">{passCount} passed</span>
              {failCount > 0 && <span className="text-red-600 ml-2">{failCount} failed</span>}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${failCount > 0 ? "bg-red-400" : "bg-green-400"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Log terminal */}
      <div
        className="flex-1 rounded-lg border border-gray-200 bg-gray-950 p-3 overflow-y-auto font-mono text-xs min-h-0"
        style={{ minHeight: "400px" }}
        data-testid="test-log-stream"
      >
        {logs.length === 0 && (
          <span className="text-gray-400">Connecting to test runner…</span>
        )}

        {logs.map((event, i) => {
          if (event.type === "run-start") {
            return (
              <div key={i} className="text-gray-300 mb-2">
                <span className="text-green-400">▶</span> Starting {event.totalTests} tests
                {event.personaName ? ` with persona "${event.personaName}"` : ""}
                {" "}— {new Date(event.startedAt).toLocaleTimeString()}
              </div>
            );
          }

          if (event.type === "test-start") {
            const areaColor = AREA_COLORS[event.area] || "bg-gray-100 text-gray-600";
            return (
              <div key={i} className="mt-3 mb-1 flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${areaColor}`}>
                  {event.area}
                </span>
                <span className="text-white font-semibold">{event.testName}</span>
              </div>
            );
          }

          if (event.type === "step") {
            const s = event.step;
            return (
              <div key={i} className={`flex items-center gap-2 pl-4 py-0.5 ${s.status === "fail" ? "text-red-400" : "text-gray-200"}`}>
                <StatusIcon status={s.status} />
                <span className="text-gray-400">{s.action}</span>
                {s.message && s.message !== s.action && <span className="text-gray-200">— {s.message}</span>}
                {s.error && <span className="text-red-400 ml-1">↳ {s.error}</span>}
              </div>
            );
          }

          if (event.type === "test-complete") {
            return (
              <div key={i} className={`flex items-center gap-2 pl-4 pb-1 font-semibold ${event.passed ? "text-green-400" : "text-red-400"}`}>
                {event.passed
                  ? <FiCheckCircle className="h-3.5 w-3.5 shrink-0" />
                  : <FiXCircle     className="h-3.5 w-3.5 shrink-0" />
                }
                <span>{event.passed ? "PASS" : "FAIL"}</span>
              </div>
            );
          }

          if (event.type === "run-complete") {
            const r = event.report?.summary;
            return (
              <div key={i} className="mt-4 border-t border-gray-700 pt-3 text-gray-200">
                <span className="text-green-400">■</span> Run complete —{" "}
                <span className="text-green-400">{r?.passed ?? 0} passed</span>
                {r?.failed > 0 && <span className="text-red-400">, {r.failed} failed</span>}
                {" "}({r?.passRate ?? 0}%)
              </div>
            );
          }

          return null;
        })}

        {isRunning && (
          <div className="flex items-center gap-2 mt-2 text-gray-400">
            <FiLoader className="h-3.5 w-3.5 animate-spin" />
            <span>Running…</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
