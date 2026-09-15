import { FiCheck, FiZap } from "react-icons/fi";
import { DEMO_ACTION_STATUSES } from "../utils/demo.constants";

const STATUS_CLASSES = {
  [DEMO_ACTION_STATUSES.RUNNING]: "bg-primary/5 text-primary",
  [DEMO_ACTION_STATUSES.DONE]: "bg-green-50 text-green-600",
  [DEMO_ACTION_STATUSES.ERROR]: "bg-red-50 text-red-500",
};

const DemoPanelActionStatus = ({ actionStatus = null, actionErrors = [] }) => {
  if (!actionStatus) return null;

  return (
    <div
      className={`flex flex-col gap-1 px-4 py-2 text-xs border-b border-gray-100 ${
        STATUS_CLASSES[actionStatus] ?? STATUS_CLASSES[DEMO_ACTION_STATUSES.ERROR]
      }`}
    >
      <div className="flex items-center gap-2">
        {actionStatus === DEMO_ACTION_STATUSES.RUNNING && (
          <>
            <span className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
            Running demo action…
          </>
        )}
        {actionStatus === DEMO_ACTION_STATUSES.DONE && (
          <>
            <FiCheck size={12} />
            Action complete
          </>
        )}
        {actionStatus !== DEMO_ACTION_STATUSES.RUNNING && actionStatus !== DEMO_ACTION_STATUSES.DONE && (
          <>
            <FiZap size={12} />
            Action had an issue — continue narrating
          </>
        )}
      </div>
      {actionErrors.length > 0 && (
        <div className="pl-5 space-y-0.5 text-[10px] opacity-80">
          {actionErrors.map((r) => (
            <div key={r.index} className="truncate">
              Step {r.index + 1} ({r.step.action}
              {r.step.selector ? ` ${r.step.selector.slice(0, 30)}` : ""}): {r.error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DemoPanelActionStatus;
