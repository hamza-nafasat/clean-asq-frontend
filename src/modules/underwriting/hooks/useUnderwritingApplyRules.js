import { useState } from "react";
import { useApplyRulesOnFormMutation, useLazyPreviewRulesOnFormQuery } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";

// preview rule emails, then apply on choice
const useUnderwritingApplyRules = (submissionId) => {
  const [previewRules, { isFetching: isPreviewing }] = useLazyPreviewRulesOnFormQuery();
  const [applyRulesOnForm, { isLoading: isApplying }] = useApplyRulesOnFormMutation();
  const [pendingRun, setPendingRun] = useState(null);

  // resolves true once applied, false when cancelled
  const requestApplyRules = async () => {
    const preview = await previewRules(submissionId).unwrap();
    return new Promise((resolve) => setPendingRun({ emails: preview.data.emails, resolve }));
  };

  const handleApply = async (sendEmails) => {
    try {
      const res = await applyRulesOnForm({ formSubmittedId: submissionId, sendEmails }).unwrap();
      toast.success(res.message);
      pendingRun.resolve(true);
      setPendingRun(null);
    } catch (error) {
      console.error("Apply rules error:", error);
      toast.error(error?.data?.message || "Failed to apply the rules");
    }
  };

  const handleClose = () => {
    pendingRun?.resolve(false);
    setPendingRun(null);
  };

  return {
    requestApplyRules,
    isBusy: isPreviewing || isApplying,
    modalProps: {
      isOpen: Boolean(pendingRun),
      emails: pendingRun?.emails ?? [],
      isLoading: isApplying,
      onApply: handleApply,
      onClose: handleClose,
    },
  };
};

export default useUnderwritingApplyRules;
