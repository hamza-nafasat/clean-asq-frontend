import { FiCheck, FiX } from "react-icons/fi";
import { DEMO_STEP_RESULTS } from "../utils/demo.constants";
import Spinner from "@/components/shared/Spinner";

const ROW_CLASSES = {
  [DEMO_STEP_RESULTS.RUNNING]: "border-primary/30 bg-primary/5",
  [DEMO_STEP_RESULTS.PASS]: "border-green-200 bg-green-50",
  [DEMO_STEP_RESULTS.FAIL]: "border-red-200 bg-red-50",
};

const ACTION_CLASSES = {
  [DEMO_STEP_RESULTS.RUNNING]: "text-primary",
  [DEMO_STEP_RESULTS.PASS]: "text-green-700",
  [DEMO_STEP_RESULTS.FAIL]: "text-red-600",
};

const DemoBuilderStepRow = ({ step = {}, index = 0, status = null }) => (
  <div
    className={`flex items-start gap-2 px-3 py-2 rounded-md text-xs border ${ROW_CLASSES[status] ?? "border-gray-100 bg-gray-50"}`}
  >
    <span className="font-mono text-gray-400 shrink-0 w-4 text-right">{index + 1}</span>
    <div className="min-w-0 flex-1">
      <span className={`font-semibold ${ACTION_CLASSES[status] ?? "text-gray-600"}`}>{step.action}</span>
      {step.selector && <span className="ml-1.5 text-gray-400 truncate">{step.selector}</span>}
      {step.value && <span className="ml-1.5 text-gray-500">= "{step.value}"</span>}
      {step.message && <p className="text-gray-400 mt-0.5 italic">{step.message}</p>}
    </div>
    {status === DEMO_STEP_RESULTS.RUNNING && (
      <Spinner tone="primarySoft" className="shrink-0 mt-0.5" />
    )}
    {status === DEMO_STEP_RESULTS.PASS && <FiCheck size={12} className="text-green-500 shrink-0 mt-0.5" />}
    {status === DEMO_STEP_RESULTS.FAIL && <FiX size={12} className="text-red-400 shrink-0 mt-0.5" />}
  </div>
);

export default DemoBuilderStepRow;
