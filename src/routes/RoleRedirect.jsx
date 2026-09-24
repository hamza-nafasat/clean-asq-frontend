import { Navigate } from "react-router-dom";
import { AUTH_ROUTES } from "@/constants";
import { getHomePath } from "@/utils/permissions";

// unmatched paths land on the account's home page, decided by permission
const RoleRedirect = ({ user }) => {
  if (!user) return <Navigate to={AUTH_ROUTES.LOGIN} replace />;
  return <Navigate to={getHomePath(user)} replace />;
};

export default RoleRedirect;
