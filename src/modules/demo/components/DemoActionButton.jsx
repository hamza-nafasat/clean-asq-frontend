import { FiZap } from "react-icons/fi";

const DemoActionButton = ({ stepCount = 0, onClick }) =>
  stepCount > 0 ? (
    <button
      type="button"
      onClick={() => onClick?.()}
      className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-1.5 hover:bg-green-100 transition-colors"
    >
      <FiZap size={11} />
      {stepCount} step{stepCount !== 1 ? "s" : ""} · Edit Demo →
    </button>
  ) : (
    <button
      type="button"
      onClick={() => onClick?.()}
      className="flex items-center gap-1.5 text-xs text-gray-500 border border-dashed border-gray-300 rounded-md px-3 py-1.5 hover:border-primary/40 hover:text-primary hover:bg-primary/3 transition-colors"
    >
      <FiZap size={11} /> + Build Demo
    </button>
  );

export default DemoActionButton;
