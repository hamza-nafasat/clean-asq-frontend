import { useSelector } from "react-redux";
import { hasPermission } from "@/utils/permissions";

const usePermission = (permission) => {
  const user = useSelector((state) => state.auth.user);
  return hasPermission(user, permission);
};

export default usePermission;
