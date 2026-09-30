import { useEffect, useRef } from "react";
import { STORAGE_KEYS } from "@/constants";

const MODE_EXIT_DELAY_MS = 150;

// close the widget when leaving the applicant flow
const useApplicantModeExit = ({ isApplicant, assistantMode, setIsOpen, preFillShownRef }) => {
  const openedByApplicantRef = useRef(false);
  const modeExitTimerRef = useRef(null);

  useEffect(() => {
    if (isApplicant) {
      clearTimeout(modeExitTimerRef.current);
      modeExitTimerRef.current = null;
      openedByApplicantRef.current = true;
    } else if (openedByApplicantRef.current) {
      modeExitTimerRef.current = setTimeout(() => {
        openedByApplicantRef.current = false;
        setIsOpen(false);
        preFillShownRef.current.clear();
        sessionStorage.removeItem(STORAGE_KEYS.AI_WIDGET_USER_CLOSED);
      }, MODE_EXIT_DELAY_MS);
    }
  }, [assistantMode]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useApplicantModeExit;
