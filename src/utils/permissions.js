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
  SUBMIT_FORM: "submit_form",
  UPDATE_SUBMISSION: "update_submission",
  ID_MISSION: "id_mission",
  LOOKUP_COMPANY: "lookup_company",
  CREATE_STRATEGY: "create_strategy",
  UPDATE_STRATEGY: "update_strategy",
  DELETE_STRATEGY: "delete_strategy",
  READ_STRATEGY: "read_strategy",
  CREATE_PROMPT: "create_prompt",
  UPDATE_PROMPT: "update_prompt",
  DELETE_PROMPT: "delete_prompt",
  READ_PROMPT: "read_prompt",
  CREATE_BRANDING: "create_branding",
  UPDATE_BRANDING: "update_branding",
  DELETE_BRANDING: "delete_branding",
  READ_BRANDING: "read_branding",
  FETCH_BRANDING: "fetch_branding",
  UNDERWRITING: "underwriting",
  CREATE_EMAIL: "create_email",
  READ_EMAIL: "read_email",
  UPDATE_EMAIL: "update_email",
  DELETE_EMAIL: "delete_email",
  CREATE_DEMO: "create_demo",
  READ_DEMO: "read_demo",
  UPDATE_DEMO: "update_demo",
  DELETE_DEMO: "delete_demo",
  PRESENT_DEMO: "present_demo",
  CREATE_TESTING: "create_testing",
  READ_TESTING: "read_testing",
  UPDATE_TESTING: "update_testing",
  DELETE_TESTING: "delete_testing",
  RUN_TESTING: "run_testing",
  ACCESS_SIDEBAR: "access_sidebar",
});

export const SYSTEM_ROLES = Object.freeze({ ADMIN: "admin", GUEST: "guest", USER: "user" });

export const hasPermission = (user, permission) =>
  user?.role?.name === SYSTEM_ROLES.ADMIN ||
  Boolean(user?.role?.permissions?.some((item) => item?.name === permission));

// TODO: replace with a permission check — kept on the role name so routing stays unchanged
export const isGuestRole = (user) => user?.role?.name === SYSTEM_ROLES.GUEST;

// TODO: replace with a permission check — a signed-out visitor counts as a guest here
export const isGuestOrSignedOut = (user) => !user?._id || isGuestRole(user);

// TODO: user.role is an object, so this is always true — kept as-is so behaviour stays unchanged
export const isNotGuestRoleValue = (user) => user?.role !== SYSTEM_ROLES.GUEST;

// sidebar pages with read permission
export const SIDEBAR_ITEMS = [
  { title: "Application forms", path: "/application-forms", permission: PERMISSIONS.READ_FORM },
  { title: "Role Management", path: "/all-roles", permission: PERMISSIONS.READ_ROLE },
  { title: "User Management", path: "/all-users", permission: PERMISSIONS.READ_USER },
  { title: "Applications", path: "/applications", permission: PERMISSIONS.UNDERWRITING },
  { title: "Branding Management", path: "/branding", permission: PERMISSIONS.READ_BRANDING },
  { title: "Lookup management", path: "/strategies-key", permission: PERMISSIONS.READ_STRATEGY },
  { title: "Strategies", path: "/strategies", permission: PERMISSIONS.READ_STRATEGY },
  { title: "Email", path: "/email", permission: PERMISSIONS.READ_EMAIL },
];

const MY_APPLICATIONS_PATH = "/submission";

// first readable sidebar page, else my-applications
export const getHomePath = (user) => {
  if (!hasPermission(user, PERMISSIONS.ACCESS_SIDEBAR)) return MY_APPLICATIONS_PATH;
  const firstAllowed = SIDEBAR_ITEMS.find((item) => hasPermission(user, item.permission));
  return firstAllowed?.path ?? MY_APPLICATIONS_PATH;
};
