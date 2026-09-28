import { LAYOUT_ROUTES } from "@/constants";

export const PERMISSIONS = Object.freeze({
  CREATE_USER: "create_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",
  READ_USER: "read_user",
  CREATE_ROLE: "create_role",
  UPDATE_ROLE: "update_role",
  DELETE_ROLE: "delete_role",
  READ_ROLE: "read_role",
  CREATE_FORM: "create_form",
  DELETE_FORM: "delete_form",
  READ_FORM: "read_form",
  UPDATE_FORM: "update_form",
  CUSTOMIZE_FORM: "customize_form",
  CREATE_RULE: "create_rule",
  READ_RULE: "read_rule",
  UPDATE_RULE: "update_rule",
  DELETE_RULE: "delete_rule",
  READ_APPLICATION: "read_application",
  DELETE_APPLICATION: "delete_application",
  SHARE_APPLICATION: "share_application",
  READ_UNDERWRITING: "read_underwriting",
  UPDATE_UNDERWRITING: "update_underwriting",
  APPLY_UNDERWRITING_RULES: "apply_underwriting_rules",
  SUBMIT_FORM: "submit_form",
  UPDATE_SUBMISSION: "update_submission",
  LOOKUP_COMPANY: "lookup_company",
  ID_MISSION: "id_mission",
  ENTER_ID_MANUALLY: "enter_id_manually",
  INVITE_OWNER: "invite_owner",
  CREATE_LOOKUP: "create_lookup",
  READ_LOOKUP: "read_lookup",
  UPDATE_LOOKUP: "update_lookup",
  DELETE_LOOKUP: "delete_lookup",
  CREATE_STRATEGY: "create_strategy",
  UPDATE_STRATEGY: "update_strategy",
  DELETE_STRATEGY: "delete_strategy",
  READ_STRATEGY: "read_strategy",
  CREATE_BRANDING: "create_branding",
  UPDATE_BRANDING: "update_branding",
  DELETE_BRANDING: "delete_branding",
  READ_BRANDING: "read_branding",
  FETCH_BRANDING: "fetch_branding",
  SET_DEFAULT_BRANDING: "set_default_branding",
  CREATE_EMAIL: "create_email",
  READ_EMAIL: "read_email",
  UPDATE_EMAIL: "update_email",
  DELETE_EMAIL: "delete_email",
  CREATE_DEMO: "create_demo",
  READ_DEMO: "read_demo",
  UPDATE_DEMO: "update_demo",
  DELETE_DEMO: "delete_demo",
  PRESENT_DEMO: "present_demo",
  ACCESS_SIDEBAR: "access_sidebar",
});

// modules as shown in role management
export const PERMISSION_GROUPS = Object.freeze([
  { name: "Dashboard", permissions: [PERMISSIONS.ACCESS_SIDEBAR] },
  {
    name: "User Management",
    permissions: [PERMISSIONS.READ_USER, PERMISSIONS.CREATE_USER, PERMISSIONS.UPDATE_USER, PERMISSIONS.DELETE_USER],
  },
  {
    name: "Role Management",
    permissions: [PERMISSIONS.READ_ROLE, PERMISSIONS.CREATE_ROLE, PERMISSIONS.UPDATE_ROLE, PERMISSIONS.DELETE_ROLE],
  },
  {
    name: "Application Forms",
    permissions: [
      PERMISSIONS.READ_FORM,
      PERMISSIONS.CREATE_FORM,
      PERMISSIONS.UPDATE_FORM,
      PERMISSIONS.DELETE_FORM,
      PERMISSIONS.CUSTOMIZE_FORM,
    ],
  },
  {
    name: "Form Rules",
    permissions: [PERMISSIONS.READ_RULE, PERMISSIONS.CREATE_RULE, PERMISSIONS.UPDATE_RULE, PERMISSIONS.DELETE_RULE],
  },
  {
    name: "Applications",
    permissions: [
      PERMISSIONS.READ_APPLICATION,
      PERMISSIONS.DELETE_APPLICATION,
      PERMISSIONS.SHARE_APPLICATION,
    ],
  },
  {
    name: "Underwriting",
    permissions: [
      PERMISSIONS.READ_UNDERWRITING,
      PERMISSIONS.UPDATE_UNDERWRITING,
      PERMISSIONS.APPLY_UNDERWRITING_RULES,
    ],
  },
  {
    name: "Applying",
    permissions: [
      PERMISSIONS.SUBMIT_FORM,
      PERMISSIONS.UPDATE_SUBMISSION,
      PERMISSIONS.LOOKUP_COMPANY,
      PERMISSIONS.ID_MISSION,
      PERMISSIONS.ENTER_ID_MANUALLY,
      PERMISSIONS.INVITE_OWNER,
    ],
  },
  {
    name: "Lookup Management",
    permissions: [PERMISSIONS.READ_LOOKUP, PERMISSIONS.CREATE_LOOKUP, PERMISSIONS.UPDATE_LOOKUP, PERMISSIONS.DELETE_LOOKUP],
  },
  {
    name: "Strategies",
    permissions: [
      PERMISSIONS.READ_STRATEGY,
      PERMISSIONS.CREATE_STRATEGY,
      PERMISSIONS.UPDATE_STRATEGY,
      PERMISSIONS.DELETE_STRATEGY,
    ],
  },
  {
    name: "Branding",
    permissions: [
      PERMISSIONS.READ_BRANDING,
      PERMISSIONS.CREATE_BRANDING,
      PERMISSIONS.UPDATE_BRANDING,
      PERMISSIONS.DELETE_BRANDING,
      PERMISSIONS.FETCH_BRANDING,
      PERMISSIONS.SET_DEFAULT_BRANDING,
    ],
  },
  {
    name: "Email Templates",
    permissions: [PERMISSIONS.READ_EMAIL, PERMISSIONS.CREATE_EMAIL, PERMISSIONS.UPDATE_EMAIL, PERMISSIONS.DELETE_EMAIL],
  },
  {
    name: "Demos",
    permissions: [
      PERMISSIONS.READ_DEMO,
      PERMISSIONS.CREATE_DEMO,
      PERMISSIONS.UPDATE_DEMO,
      PERMISSIONS.DELETE_DEMO,
      PERMISSIONS.PRESENT_DEMO,
    ],
  },
]);

export const SYSTEM_ROLES = Object.freeze({ ADMIN: "admin", GUEST: "guest", USER: "user" });

export const hasPermission = (user, permission) =>
  user?.role?.name === SYSTEM_ROLES.ADMIN ||
  Boolean(user?.role?.permissions?.some((item) => item?.name === permission));

// sidebar pages with read permission
export const SIDEBAR_ITEMS = [
  { title: "Application forms", path: LAYOUT_ROUTES.APPLICATION_FORMS, permission: PERMISSIONS.READ_FORM },
  { title: "Role Management", path: LAYOUT_ROUTES.ROLE_MANAGEMENT, permission: PERMISSIONS.READ_ROLE },
  { title: "User Management", path: LAYOUT_ROUTES.USER_MANAGEMENT, permission: PERMISSIONS.READ_USER },
  { title: "Applications", path: LAYOUT_ROUTES.APPLICATIONS, permission: PERMISSIONS.READ_APPLICATION },
  { title: "Branding Management", path: LAYOUT_ROUTES.BRANDING, permission: PERMISSIONS.READ_BRANDING },
  { title: "Lookup management", path: LAYOUT_ROUTES.LOOKUP_MANAGEMENT, permission: PERMISSIONS.READ_LOOKUP },
  { title: "Strategies", path: LAYOUT_ROUTES.STRATEGIES, permission: PERMISSIONS.READ_STRATEGY },
  { title: "Email", path: LAYOUT_ROUTES.EMAIL, permission: PERMISSIONS.READ_EMAIL },
  { title: "My Applications", path: LAYOUT_ROUTES.MY_APPLICATIONS, permission: PERMISSIONS.SUBMIT_FORM },
];

// first readable sidebar page, else my-applications
export const getHomePath = (user) => {
  if (!hasPermission(user, PERMISSIONS.ACCESS_SIDEBAR)) return LAYOUT_ROUTES.MY_APPLICATIONS;
  const firstAllowed = SIDEBAR_ITEMS.find((item) => hasPermission(user, item.permission));
  return firstAllowed?.path ?? LAYOUT_ROUTES.MY_APPLICATIONS;
};
