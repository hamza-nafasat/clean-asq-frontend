import { useEffect, useRef, useState } from "react";
import {
  DEMO_ACTION_SETTLE_MS,
  DEMO_ACTION_STATUS_CLEAR_MS,
  DEMO_ACTION_STATUSES,
  DEMO_STEP_RESULTS,
} from "@/modules/demo/utils/demo.constants";
import { runDemoSteps } from "@/modules/demo/utils/demo.utils";

// runs the current demo action in the live page once navigation settles
const useDemoActionRunner = ({ currentDemoAction, navigate }) => {
  const [actionStatus, setActionStatus] = useState(null);
  const [actionErrors, setActionErrors] = useState([]);
  const executingActionRef = useRef(false);

  useEffect(() => {
    if (!currentDemoAction?.steps?.length) {
      setActionStatus(null);
      setActionErrors([]);
      executingActionRef.current = false;
      return;
    }

    if (executingActionRef.current) return;
    executingActionRef.current = true;
    setActionStatus(DEMO_ACTION_STATUSES.RUNNING);
    setActionErrors([]);

    const timer = setTimeout(() => {
      runDemoSteps(currentDemoAction.steps, {
        navigate,
        paramOverrides: currentDemoAction.paramOverrides || {},
      })
        .then((results) => {
          const fails = results.filter((r) => r.status === DEMO_STEP_RESULTS.FAIL && r.step.critical !== false);
          setActionStatus(fails.length ? DEMO_ACTION_STATUSES.ERROR : DEMO_ACTION_STATUSES.DONE);
          if (fails.length) setActionErrors(fails);
          setTimeout(() => {
            setActionStatus(null);
            setActionErrors([]);
          }, DEMO_ACTION_STATUS_CLEAR_MS);
        })
        .finally(() => {
          executingActionRef.current = false;
        });
    }, DEMO_ACTION_SETTLE_MS);

    // reset so the next action is not blocked
    return () => {
      clearTimeout(timer);
      executingActionRef.current = false;
    };
  }, [currentDemoAction, navigate]);

  return { actionStatus, actionErrors };
};

export default useDemoActionRunner;
