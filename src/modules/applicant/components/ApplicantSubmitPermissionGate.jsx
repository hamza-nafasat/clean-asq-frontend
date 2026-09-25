import { useSelector } from "react-redux";
import usePermission from "@/hooks/usePermission";
import EmptyState from "@/components/shared/EmptyState";
import { PERMISSIONS } from "@/utils/permissions";

// signed-out visitors pass; the code step signs them in
const ApplicantSubmitPermissionGate = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const canSubmitForm = usePermission(PERMISSIONS.SUBMIT_FORM);

  if (user?._id && !canSubmitForm) {
    return <EmptyState className="mt-14" title="You don't have permission to submit applications" />;
  }
  return children;
};

export default ApplicantSubmitPermissionGate;
