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

export const ROLE_SCREEN_CONTEXT = {
  screenId: "role-management",
  screenName: "Role Management",
  assistantName: "Role Management Assistant",
  description:
    "The Role Management screen lets admins create and manage roles, each with a custom set of permissions. Roles are assigned to users to control what they can access and do in the platform.",
  greeting: `Hi! I'm your **Role Management Assistant**.\n\nI can help you:\n- **Explain any permission** — what it does and which roles typically need it\n- **Suggest permissions** for a role based on its purpose (e.g. manager, staff, guest)\n- **Create, edit, or delete roles** based on your instructions\n- **Review existing roles** and flag gaps or over-permissions\n\nWhat would you like to do?`,
};
