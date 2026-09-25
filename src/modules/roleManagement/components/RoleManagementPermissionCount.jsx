import { getPermissionPercent } from "../utils/roleManagement.utils";

const RoleManagementPermissionCount = ({ count = 0, total = 0 }) => (
  <span className="flex w-full max-w-48 flex-col gap-1.5">
    <span className="text-sm">
      <span className="text-textPrimary font-semibold">{count}</span> of {total}
    </span>
    <span className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <span className="bg-primary block h-full rounded-full" style={{ width: `${getPermissionPercent(count, total)}%` }} />
    </span>
  </span>
);

export default RoleManagementPermissionCount;
