import { useState } from "react";
import { FiCheckCircle, FiChevronDown, FiChevronRight, FiDownload, FiXCircle } from "react-icons/fi";
import { FULL_PASS_RATE, STEP_ACTION_LABELS, STEP_STATUSES, WARNING_PASS_RATE } from "../utils/testing.constants";

const getPassRateColor = (passRate, { full, warning, low }) =>
  passRate === FULL_PASS_RATE ? full : passRate >= WARNING_PASS_RATE ? warning : low;

const Stat = ({ label, value, color = "" }) => (
  <div className="rounded-lg bg-gray-50 p-3 text-center">
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);

const PassIcon = ({ passed = false }) =>
  passed ? (
    <FiCheckCircle className="h-4 w-4 text-green-500 shrink-0" />
  ) : (
    <FiXCircle className="h-4 w-4 text-red-500 shrink-0" />
  );

const ResultSteps = ({ steps = [] }) => (
  <div className="mb-3 ml-7 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-100 text-left">
          <th className="px-3 py-2 font-semibold text-gray-600 w-4">#</th>
          <th className="px-3 py-2 font-semibold text-gray-600">Action</th>
          <th className="px-3 py-2 font-semibold text-gray-600">Description</th>
          <th className="px-3 py-2 font-semibold text-gray-600">Selector / Data</th>
          <th className="px-3 py-2 font-semibold text-gray-600 text-right">Result</th>
        </tr>
      </thead>
      <tbody>
        {steps.map((s, i) => (
          <tr
            key={i}
            className={`border-b border-gray-100 last:border-0 ${s.status === STEP_STATUSES.FAIL ? "bg-red-50" : ""}`}
          >
            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
            <td className="px-3 py-2 font-mono text-gray-600 whitespace-nowrap">
              {STEP_ACTION_LABELS[s.action] || s.action}
            </td>
            <td className="px-3 py-2 text-gray-700">{s.message || "—"}</td>
            <td className="px-3 py-2">
              {s.value && (
                <span className="mr-2 inline-flex items-center gap-1">
                  <span className="text-gray-400">value:</span>
                  <code className="font-mono text-indigo-700 bg-indigo-50 px-1 rounded">
                    {String(s.value).slice(0, 60)}
                  </code>
                </span>
              )}
              {s.selector && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-gray-400">sel:</span>
                  <code className="font-mono text-gray-500 bg-gray-100 px-1 rounded">{s.selector}</code>
                </span>
              )}
              {!s.value && !s.selector && <span className="text-gray-300">—</span>}
            </td>
            <td className="px-3 py-2 text-right">
              {s.status === STEP_STATUSES.PASS ? (
                <span className="font-semibold text-green-600">✓</span>
              ) : (
                <span className="font-semibold text-red-600" title={s.error}>
                  ✗
                </span>
              )}
              {s.status === STEP_STATUSES.FAIL && s.error && (
                <p className="text-red-600 mt-0.5 text-right max-w-xs ml-auto">{s.error.slice(0, 120)}</p>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TestingReport = ({ report }) => {
  const [expandedFailure, setExpandedFailure] = useState(null);
  const [expandedResult, setExpandedResult] = useState(null);
  const { summary, byArea, failures, results, persona, completedAt, durationMs } = report;

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `test-report-${report.runId?.slice(0, 8) || "run"}.json`;
    a.click();
  };

  const durationSec = durationMs ? (durationMs / 1000).toFixed(1) : null;

  return (
    <div className="space-y-5" data-testid="test-report">
      {/* Summary */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Test Run Report</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {completedAt ? new Date(completedAt).toLocaleString() : ""}
              {persona ? ` · Persona: ${persona}` : ""}
              {durationSec ? ` · ${durationSec}s` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <FiDownload size={12} />
            Export JSON
          </button>
        </header>

        <div className="mt-4 grid grid-cols-4 gap-3">
          <Stat label="Total" value={summary.total} color="text-gray-900" />
          <Stat label="Passed" value={summary.passed} color="text-green-600" />
          <Stat label="Failed" value={summary.failed} color={summary.failed ? "text-red-600" : "text-gray-400"} />
          <Stat
            label="Pass rate"
            value={`${summary.passRate}%`}
            color={getPassRateColor(summary.passRate, {
              full: "text-green-600",
              warning: "text-yellow-600",
              low: "text-red-600",
            })}
          />
        </div>

        <div className="mt-4 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${getPassRateColor(summary.passRate, {
              full: "bg-green-400",
              warning: "bg-yellow-400",
              low: "bg-red-400",
            })}`}
            style={{ width: `${summary.passRate}%` }}
          />
        </div>
      </section>

      {/* Area breakdown */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">By Feature Area</h3>
        <div className="space-y-2">
          {Object.entries(byArea).map(([area, data]) => (
            <div key={area} className="flex items-center gap-3">
              <PassIcon passed={!data.failed} />
              <span className="text-sm text-gray-700 flex-1">{area}</span>
              <span className="text-xs text-gray-500">
                {data.passed}/{data.tests.length}
              </span>
              <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${data.failed ? "bg-red-400" : "bg-green-400"}`}
                  style={{
                    width: `${Math.round((data.passed / data.tests.length) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Failures */}
      {failures.length > 0 && (
        <section className="rounded-xl border border-red-100 bg-red-50/50 p-5">
          <h3 className="text-sm font-semibold text-red-800 mb-3">
            {failures.length} Failure{failures.length !== 1 ? "s" : ""}
          </h3>
          <div className="space-y-2">
            {failures.map((f) => (
              <div key={f.testId} className="rounded-lg border border-red-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedFailure(expandedFailure === f.testId ? null : f.testId)}
                  aria-expanded={expandedFailure === f.testId}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-red-50/50"
                >
                  <FiXCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-900 flex-1">{f.testName}</span>
                  <span className="text-xs text-gray-400">{f.area}</span>
                  {expandedFailure === f.testId ? (
                    <FiChevronDown size={14} className="text-gray-400 shrink-0" />
                  ) : (
                    <FiChevronRight size={14} className="text-gray-400 shrink-0" />
                  )}
                </button>
                {expandedFailure === f.testId && (
                  <div className="border-t border-red-100 px-4 py-3 space-y-2">
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-500">Failed at:</span>
                      <code className="font-mono text-red-700">{f.failedAt}</code>
                    </div>
                    {f.error && (
                      <div className="rounded bg-red-50 border border-red-100 p-2">
                        <p className="text-xs font-mono text-red-800 break-all">{f.error}</p>
                      </div>
                    )}
                    {f.screenshot && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Screenshot at failure:</p>
                        <img
                          src={`data:image/png;base64,${f.screenshot}`}
                          alt="Failure screenshot"
                          className="rounded border border-red-100 w-full max-w-xl"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All results */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">All Results</h3>
        <div className="divide-y divide-gray-100">
          {results.map((r) => (
            <div key={r.testId}>
              <button
                type="button"
                onClick={() => setExpandedResult(expandedResult === r.testId ? null : r.testId)}
                aria-expanded={expandedResult === r.testId}
                className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-gray-50 transition-colors bg-transparent border-0 cursor-pointer rounded"
              >
                <PassIcon passed={r.passed} />
                <span className="text-sm text-gray-700 flex-1">{r.testName}</span>
                <span className="text-xs text-gray-400 mr-2">{r.area}</span>
                <span className={`text-xs font-semibold mr-2 ${r.passed ? "text-green-600" : "text-red-600"}`}>
                  {r.passed ? "PASS" : "FAIL"}
                </span>
                <span className="text-xs text-gray-400">{r.steps?.length || 0} steps</span>
                {expandedResult === r.testId ? (
                  <FiChevronDown size={13} className="text-gray-400 shrink-0 ml-1" />
                ) : (
                  <FiChevronRight size={13} className="text-gray-400 shrink-0 ml-1" />
                )}
              </button>
              {expandedResult === r.testId && r.steps?.length > 0 && <ResultSteps steps={r.steps} />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TestingReport;
