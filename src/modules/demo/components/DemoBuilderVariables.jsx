import { getParamNames } from "../utils/demo.utils3";

const DemoBuilderVariables = ({ steps = [], overrides = {}, onParamChange }) => {
  const paramNames = getParamNames(steps);
  if (!paramNames.length) return null;

  return (
    <div className="rounded-md bg-white border border-blue-200 px-3 py-2 space-y-2">
      <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">Variables</p>
      <p className="text-[10px] text-gray-400">
        These values are used in the steps above. Edit them here — changes are saved with the action.
      </p>
      {paramNames.map((name) => (
        <div key={name} className="flex items-center gap-2">
          <label
            htmlFor={`demo-param-${name}`}
            className="text-xs text-gray-500 font-mono shrink-0 w-32 truncate"
            title={name}
          >{`{{${name}}}`}</label>
          <input
            id={`demo-param-${name}`}
            type="text"
            value={overrides[name] ?? ""}
            onChange={(e) => onParamChange?.(name, e.target.value)}
            placeholder={`Enter ${name}…`}
            className="flex-1 rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
      ))}
    </div>
  );
};

export default DemoBuilderVariables;
