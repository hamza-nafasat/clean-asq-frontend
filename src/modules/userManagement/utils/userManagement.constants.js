export const USER_FORM_FIELDS = {
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  ROLE: "role",
  EMAIL: "email",
  PASSWORD: "password",
};

export const INITIAL_USER_FORM = {
  firstName: "",
  lastName: "",
  role: "",
  email: "",
  password: "",
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

// props that give the shared FormField this module's look
export const USER_FORM_FIELD_PROPS = {
  labelClassName: "mb-1 block text-sm font-medium text-gray-700",
  selectBaseClassName:
    "border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base",
  selectDefaultClassName: "border-gray-300",
  placeholderOption: "label",
  checkboxVariant: "shared",
};
