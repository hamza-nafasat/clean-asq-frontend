export const USER_TYPES = {
  ADMIN: "admin",
  TEAM_MEMBER: "team-mbr",
  CLIENT: "client",
  CLIENT_MEMBER: "client-mbr",
  SUPER_BANK: "super-bank",
};

export const BUSINESS_USER_TYPES = [USER_TYPES.CLIENT, USER_TYPES.CLIENT_MEMBER, USER_TYPES.SUPER_BANK];

export const BUSINESS_ROLE_IDS = ["r2", "r3", "r4", "r5"];

export const USER_FORM_FIELDS = {
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  ROLE: "role",
  TYPE: "type",
  BUSINESS_NAME: "businessName",
  EMAIL: "email",
  PASSWORD: "password",
};

export const INITIAL_USER_FORM = {
  firstName: "",
  lastName: "",
  businessName: "",
  email: "",
  password: "",
};

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

export const USER_MODAL_MODES = {
  ADD: "add",
  EDIT: "edit",
};

export const PROMISE_STATUSES = {
  REJECTED: "rejected",
};

export const USER_AI_CHAT_PATH = "/api/ai/user-chat";

export const USER_SCREEN_CONTEXT = {
  screenId: "user-management",
  screenName: "User Management",
  assistantName: "User Management Assistant",
  description:
    "The User Management screen lets admins create, edit, and delete user accounts, assign roles, and manage passwords. Each user has a first name, last name, email, and an assigned role.",
  greeting: `Hi! I'm your **User Management Assistant**.\n\nI can help you:\n- **List and categorize** users by role\n- **Spot duplicate accounts** based on email\n- **Create new users** and assign them to a role\n- **Edit user information** (name, email, role)\n- **Send password reset links** to users\n- **Delete users** based on your instructions\n\nWhat would you like to do?`,
};

export const SELECT_CLASS_NAME =
  "border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base";
