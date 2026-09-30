import { LIST_FILTER_TYPES } from "@/constants";
import { PERMISSION_GROUPS } from "@/utils/permissions";

export const ROLE_FORM_FIELDS = {
  ROLE_NAME: "roleName",
};

export const INITIAL_ROLE_FORM = {
  [ROLE_FORM_FIELDS.ROLE_NAME]: "",
  permissions: [],
};

// permissions outside every module group
export const OTHER_PERMISSION_GROUP = "Other";

export const ROLE_MODAL_MODES = {
  ADD: "add",
  EDIT: "edit",
};

export const ROLE_ACTION_NAMES = {
  VIEW: "view",
  EDIT: "edit",
  DELETE: "delete",
};

export const ROLE_AI_CHAT_PATH = "/api/ai/role-chat";

export const CREATED_DATE_OPTIONS = { month: "short", day: "numeric", year: "numeric" };

export const ROLE_SCREEN_CONTEXT = {
  screenId: "role-management",
  screenName: "Role Management",
  assistantName: "Role Management Assistant",
  description:
    "The Role Management screen lets admins create and manage roles, each with a custom set of permissions. Roles are assigned to users to control what they can access and do in the platform.",
  greeting: `Hi! I'm your **Role Management Assistant**.\n\nI can help you:\n- **Explain any permission** — what it does and which roles typically need it\n- **Suggest permissions** for a role based on its purpose (e.g. manager, staff, guest)\n- **Create, edit, or delete roles** based on your instructions\n- **Review existing roles** and flag gaps or over-permissions\n\nWhat would you like to do?`,
};

export const ROLE_TYPES = {
  SYSTEM: "system",
  CUSTOM: "custom",
};

export const ROLE_FILTER_KEYS = {
  SEARCH: "search",
  TYPE: "type",
  PERMISSION_GROUP: "permissionGroup",
};

export const INITIAL_ROLE_FILTERS = {
  [ROLE_FILTER_KEYS.SEARCH]: "",
  [ROLE_FILTER_KEYS.TYPE]: "",
  [ROLE_FILTER_KEYS.PERMISSION_GROUP]: "",
};

export const ROLE_FILTER_FIELDS = [
  {
    type: LIST_FILTER_TYPES.SEARCH,
    name: ROLE_FILTER_KEYS.SEARCH,
    label: "Role",
    placeholder: "Search by role name",
    className: "sm:col-span-2 lg:col-span-6",
  },
  {
    type: LIST_FILTER_TYPES.SELECT,
    name: ROLE_FILTER_KEYS.TYPE,
    label: "Type",
    allLabel: "System and custom",
    options: [
      { value: ROLE_TYPES.SYSTEM, label: "System" },
      { value: ROLE_TYPES.CUSTOM, label: "Custom" },
    ],
    className: "lg:col-span-3",
  },
  {
    type: LIST_FILTER_TYPES.SELECT,
    name: ROLE_FILTER_KEYS.PERMISSION_GROUP,
    label: "Has access to",
    allLabel: "Access to any module",
    options: PERMISSION_GROUPS.map((group) => ({ value: group.name, label: group.name })),
    className: "lg:col-span-3",
  },
];
