import { FiCheck } from "react-icons/fi";

const dotClass = (isActive, isDone) => {
  if (isDone) return "border-green-500 bg-green-500 text-white";
  if (isActive) return "border-primary bg-primary text-white";
  return "border-gray-300 bg-white text-gray-400";
};

const BrandingExtractionStepBar = ({ current = 1, total = 1 }) => (
  <div className="mb-6 flex items-center gap-2">
    {Array.from({ length: total }, (_, i) => {
      const isDone = current > i + 1;
      return (
        <div key={i} className="flex items-center">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${dotClass(current === i + 1, isDone)}`}
          >
            {isDone ? <FiCheck size={14} /> : i + 1}
          </span>
          {i < total - 1 && <div className={`mx-1 h-0.5 w-8 ${isDone ? "bg-green-500" : "bg-gray-200"}`} />}
        </div>
      );
    })}
  </div>
);

export default BrandingExtractionStepBar;
