export const ROLE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export const ROLE_FORM_FIELDS = {
  ROLE_NAME: "roleName",
  STATUS: "status",
};

export const INITIAL_ROLE_FORM = {
  [ROLE_FORM_FIELDS.ROLE_NAME]: "",
  permissions: [],
  [ROLE_FORM_FIELDS.STATUS]: ROLE_STATUS.ACTIVE,
};

export const ROLE_STATUS_OPTIONS = [
  { value: ROLE_STATUS.ACTIVE, label: "Active" },
  { value: ROLE_STATUS.INACTIVE, label: "Inactive" },
];

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

export const ROLE_SCREEN_CONTEXT = {
  screenId: "role-management",
  screenName: "Role Management",
  assistantName: "Role Management Assistant",
  description:
    "The Role Management screen lets admins create and manage roles, each with a custom set of permissions. Roles are assigned to users to control what they can access and do in the platform.",
  greeting: `Hi! I'm your **Role Management Assistant**.\n\nI can help you:\n- **Explain any permission** — what it does and which roles typically need it\n- **Suggest permissions** for a role based on its purpose (e.g. manager, staff, guest)\n- **Create, edit, or delete roles** based on your instructions\n- **Review existing roles** and flag gaps or over-permissions\n\nWhat would you like to do?`,
};

export const SELECT_CLASS_NAME =
  "border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base";

export const VIEW_FIELD_CLASS_NAME =
  "border-frameColor flex h-11.25 w-full items-center rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base";

// props that give the shared FormField this module's look
export const ROLE_FORM_FIELD_PROPS = {
  labelClassName: "text-textPrimary mb-1 block text-sm font-medium",
  selectBaseClassName: SELECT_CLASS_NAME,
  selectClassSeparator: "",
  selectDefaultClassName: "border-frameColor",
  inputPlaceholderSource: "field",
};
