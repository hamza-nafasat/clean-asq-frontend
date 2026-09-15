import { useState } from "react";
import { DELETE_CLOSE_MODES } from "@/constants";

// holds the row being deleted and closes the confirmation the way the caller asks
const useDeleteConfirmation = ({ onDelete, closeOn = DELETE_CLOSE_MODES.RESULT }) => {
  const [target, setTarget] = useState(null);

  const closeConfirmation = () => setTarget(null);

  const handleConfirm = async () => {
    try {
      const result = await onDelete?.(target);
      if (closeOn === DELETE_CLOSE_MODES.RESULT && result) setTarget(null);
    } finally {
      if (closeOn === DELETE_CLOSE_MODES.FINALLY) setTarget(null);
    }
  };

  return { target, openConfirmation: setTarget, closeConfirmation, handleConfirm };
};

export default useDeleteConfirmation;
