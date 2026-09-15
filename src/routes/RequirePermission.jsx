import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import usePermission from "@/hooks/usePermission";
import { getHomePath } from "@/utils/permissions";

// every signed-in dashboard route names the permission that unlocks it
const RequirePermission = ({ permission, children }) => {
  const user = useSelector((state) => state.auth.user);
  const canAccess = usePermission(permission);

  if (!canAccess) return <Navigate to={getHomePath(user)} replace />;
  return children;
};

export default RequirePermission;
