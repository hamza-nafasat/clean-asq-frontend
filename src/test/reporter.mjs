/**
 * Test reporter for `npm test` (a node:test custom reporter - not a test file).
 *
 *   - a passing test prints one "passed" line
 *   - a failing test prints its real error and the line that threw it
 *   - console output from the code under test is held back, and shown only for
 *     files that had a failure
 *   - the run ends with a summary: total, passed, failed, open (todo), skipped,
 *     not completed (timed out / cancelled)
 *
 * Wired in package.json:  node --test --test-reporter=./src/test/reporter.mjs ...
 * node:test sets the exit code itself (1 on any failure); this only formats output.
 */
import path from "node:path";
import { inspect } from "node:util";

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : String(text));
const green = paint("32");
const red = paint("31");
const yellow = paint("33");
const cyan = paint("36");
const dim = paint("2");
const bold = paint("1");
const plain = (text) => String(text);

const MAX_ERROR_CHARS = 2000;
/** Path relative to the package, or absolute for files outside it. */
const rel = (file) => {
  if (!file) return "";
  const relative = path.relative(process.cwd(), file);
  return relative.startsWith("..") ? file : relative;
};
const indent = (text, pad) => text.split("\n").map((l) => pad + l).join("\n");
const truncate = (text) =>
  text.length > MAX_ERROR_CHARS
    ? `${text.slice(0, MAX_ERROR_CHARS)}\n… (${text.length - MAX_ERROR_CHARS} more characters)`
    : text;
const isSet = (flag) => flag !== undefined && flag !== false;
const reasonOf = (flag) => (typeof flag === "string" && flag ? flag : "");

/** "path/to/file.test.js:12:5" for the first stack frame inside the test file. */
const thrownAt = (stack, file) => {
  const frames = String(stack ?? "").split("\n").filter((l) => l.trim().startsWith("at "));
  const frame = frames.find((l) => file && l.includes(file)) ?? frames.find((l) => !l.includes("node:"));
  const m = frame?.match(/\(?(?:file:\/\/)?([^()\s]+):(\d+):(\d+)\)?\s*$/);
  return m ? `${rel(m[1])}:${m[2]}:${m[3]}` : "";
};

const show = (value) => inspect(value, { depth: 4, breakLength: 100, maxStringLength: 300, maxArrayLength: 20 });

/** The actual error behind a node:test failure, formatted for the console. */
const describeError = (error, file) => {
  const cause = error?.cause ?? error;
  if (cause === undefined || cause === null) return "Unknown error";
  if (typeof cause !== "object") return String(cause);
  const code = cause.code && cause.code !== "ERR_ASSERTION" ? ` [${cause.code}]` : "";
  const parts = [`${cause.name ?? "Error"}${code}: ${cause.message ?? ""}`.trimEnd()];
  // A custom assertion message can hide the values; show them unless the message
  // already carries a diff or they are just true/false.
  const messageHasValues = /[+-] actual|actual:/.test(cause.message ?? "");
  if (cause.code === "ERR_ASSERTION" && cause.generatedMessage === false && !messageHasValues && !["==", "ok"].includes(cause.operator)) {
    parts.push(`actual:   ${show(cause.actual)}`, `expected: ${show(cause.expected)}`);
  }
  const at = thrownAt(cause.stack, file);
  if (at) parts.push(`at ${at}`);
  return truncate(parts.join("\n"));
};

/** passed | todo-passed | open | skipped | cancelled | timed-out | failed | suite-ok */
const statusOf = (type, data) => {
  const failureType = data.details?.error?.failureType;
  if (isSet(data.skip)) return "skipped";
  if (type === "test:pass") return isSet(data.todo) ? "todo-passed" : "passed";
  if (isSet(data.todo)) return "open";
  if (failureType === "cancelledByParent") return "cancelled";
  if (failureType === "testTimeoutFailure") return "timed-out";
  // A suite whose tests failed: the tests themselves carry and report the failure.
  if (data.details?.type === "suite" && failureType === "subtestsFailed") return "suite-ok";
  return "failed";
};

export default async function* reporter(source) {
  const started = performance.now();
  const counts = { passed: 0, todoPassed: 0, failed: 0, open: 0, skipped: 0, notCompleted: 0, suiteErrors: 0, skippedSuites: 0 };
  const problems = [];
  const files = new Set();
  const filesWithProblems = new Set();
  const consoleByFile = new Map();
  // node:test reports a suite after its children, so each finished node waits
  // at its nesting level until its parent suite arrives and adopts it.
  const waitingByFile = new Map();

  const addProblem = (node, trail) => {
    filesWithProblems.add(node.file);
    problems.push({ label: [...trail, node.name].join(" › "), where: `${rel(node.file)}:${node.line}` });
  };

  const render = (node, depth, trail, lines) => {
    const pad = "  ".repeat(depth);
    const fileNote = depth === 0 && node.file ? dim(`  (${path.basename(node.file)})`) : "";
    const errorBlock = () => indent(describeError(node.error, node.file), `${pad}    `);

    if (node.isSuite) {
      if (node.status === "skipped") {
        counts.skippedSuites++;
        lines.push(`${pad}${yellow("↷ skipped")}  ${node.name}${reasonOf(node.skip) ? dim(` - ${reasonOf(node.skip)}`) : ""}${fileNote}`);
        return;
      }
      if (node.status === "failed") {
        counts.suiteErrors++;
        addProblem(node, trail);
        lines.push(`${pad}${red("✖ FAILED")}  ${bold(node.name)}${fileNote}`, red(errorBlock()));
      } else {
        lines.push(`${pad}${bold(node.name)}${fileNote}`);
      }
      for (const child of node.children) render(child, depth + 1, [...trail, node.name], lines);
      return;
    }

    switch (node.status) {
      case "passed":
        counts.passed++;
        lines.push(`${pad}${green("✔ passed")}  ${node.name}${fileNote}`);
        break;
      case "todo-passed":
        counts.passed++;
        counts.todoPassed++;
        lines.push(`${pad}${green("✔ passed")}  ${node.name}  ${cyan("(fixed - remove its todo flag)")}${fileNote}`);
        break;
      case "open":
        counts.open++;
        lines.push(`${pad}${yellow("○ open")}    ${node.name}${reasonOf(node.todo) ? dim(` - ${reasonOf(node.todo)}`) : ""}${fileNote}`);
        break;
      case "skipped":
        counts.skipped++;
        lines.push(`${pad}${yellow("↷ skipped")} ${node.name}${reasonOf(node.skip) ? dim(` - ${reasonOf(node.skip)}`) : ""}${fileNote}`);
        break;
      case "cancelled":
        counts.notCompleted++;
        addProblem(node, trail);
        lines.push(`${pad}${red("⚠ not completed")}  ${node.name}${fileNote}`, `${pad}    ${dim("cancelled - its suite failed before it could run")}`);
        break;
      case "timed-out":
        counts.notCompleted++;
        addProblem(node, trail);
        lines.push(`${pad}${red("⚠ not completed")}  ${node.name}${fileNote}`, red(errorBlock()));
        break;
      default:
        counts.failed++;
        addProblem(node, trail);
        lines.push(`${pad}${red("✖ FAILED")}  ${bold(node.name)}${fileNote}`, red(errorBlock()));
    }
  };

  for await (const { type, data } of source) {
    if (type === "test:stdout" || type === "test:stderr") {
      const captured = consoleByFile.get(data.file) ?? [];
      captured.push(data.message);
      consoleByFile.set(data.file, captured);
      continue;
    }
    if (type !== "test:pass" && type !== "test:fail") continue;

    if (data.file) files.add(data.file);
    const waiting = waitingByFile.get(data.file) ?? [];
    waitingByFile.set(data.file, waiting);

    const node = {
      name: data.name,
      file: data.file,
      line: data.line,
      isSuite: data.details?.type === "suite",
      status: statusOf(type, data),
      error: data.details?.error,
      skip: data.skip,
      todo: data.todo,
      children: waiting[data.nesting + 1] ?? [],
    };
    waiting[data.nesting + 1] = [];
    (waiting[data.nesting] ??= []).push(node);

    if (data.nesting === 0) {
      const lines = [];
      for (const top of waiting[0].splice(0)) render(top, 0, [], lines);
      yield `${lines.join("\n")}\n`;
    }
  }

  // ── summary ────────────────────────────────────────────────────────────────
  const out = [];
  const withConsole = [...filesWithProblems].filter((f) => consoleByFile.get(f)?.length);
  if (withConsole.length) {
    out.push("", bold("Console output from files with failures"));
    for (const f of withConsole) out.push(cyan(`  ${rel(f)}`), indent(consoleByFile.get(f).join("").trimEnd(), "    "));
  }

  const total = counts.passed + counts.failed + counts.open + counts.skipped + counts.notCompleted;
  const problemCount = counts.failed + counts.notCompleted + counts.suiteErrors;
  const rule = "─".repeat(64);
  const row = (icon, label, n, note = "", color = plain) =>
    ` ${icon} ${label.padEnd(15)}${color(String(n).padStart(5))}${note ? `   ${dim(note)}` : ""}`;

  out.push("", rule, bold(` Test summary · ${path.basename(process.cwd())}`), rule);
  out.push(
    row(" ", "Total tests", total),
    row(green("✔"), "Passed", counts.passed, counts.todoPassed ? `${counts.todoPassed} marked todo now pass - remove the todo flag` : "", green),
    row(red("✖"), "Failed", counts.failed, "", counts.failed ? red : plain),
    row(yellow("○"), "Open (todo)", counts.open, "known open issues - reported, do not fail the run"),
    row(yellow("↷"), "Skipped", counts.skipped),
    row(red("⚠"), "Not completed", counts.notCompleted, "timed out, or cancelled by a failing suite", counts.notCompleted ? red : plain),
  );
  if (counts.suiteErrors) out.push(row(red("✖"), "Suite errors", counts.suiteErrors, "a describe block or hook crashed", red));
  if (counts.skippedSuites) out.push(row(yellow("↷"), "Skipped suites", counts.skippedSuites, "whole describe blocks, e.g. live AI checks without AI_LIVE"));
  out.push(rule, ` ${files.size} file(s) · ${((performance.now() - started) / 1000).toFixed(2)}s`);

  if (problems.length) {
    out.push("", bold(red(" Needs attention:")));
    for (const p of problems) out.push(`  ${red("✖")} ${p.label}`, `     ${dim(p.where)}`);
  }
  out.push("", problemCount ? bold(red(` RESULT: FAILED - ${problemCount} problem(s)`)) : bold(green(" RESULT: PASSED")), "");

  yield `${out.join("\n")}\n`;
}
