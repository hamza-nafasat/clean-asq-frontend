import { Navigate } from "react-router-dom";
import { getHomePath } from "@/utils/permissions";

// unmatched paths land on the account's home page, decided by permission
const RoleRedirect = ({ user }) => {
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getHomePath(user)} replace />;
};

export default RoleRedirect;
