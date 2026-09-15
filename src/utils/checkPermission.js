
export const webPermissions = Object.freeze({
  // user
  create_user: "create_user",
  update_user: "update_user",
  delete_user: "delete_user",
  read_user: "read_user",
  // role
  create_role: "create_role",
  update_role: "update_role",
  delete_role: "delete_role",
  read_role: "read_role",
  // form
  create_form: "create_form",
  delete_form: "delete_form",
  read_form: "read_form",
  update_form: "update_form",
  customize_form: "customize_form",
  submit_form: "submit_form",
  update_submission: "update_submission",
  id_mission: "id_mission",
  // company lookup
  lookup_company: "lookup_company",
  // create strategy
  create_strategy: "create_strategy",
  update_strategy: "update_strategy",
  delete_strategy: "delete_strategy",
  read_strategy: "read_strategy",
  // prompts
  create_prompt: "create_prompt",
  update_prompt: "update_prompt",
  delete_prompt: "delete_prompt",
  read_prompt: "read_prompt",
  // branding
  create_branding: "create_branding",
  update_branding: "update_branding",
  delete_branding: "delete_branding",
  read_branding: "read_branding",
  fetch_branding: "fetch_branding",
  // underwriting
  underwriting: "underwriting",
  // email
  create_email: "create_email",
  read_email: "read_email",
  update_email: "update_email",
  delete_email: "delete_email",
  // demo
  create_demo: "create_demo",
  read_demo: "read_demo",
  update_demo: "update_demo",
  delete_demo: "delete_demo",
  present_demo: "present_demo",
  // testing
  create_testing: "create_testing",
  read_testing: "read_testing",
  update_testing: "update_testing",
  delete_testing: "delete_testing",
  run_testing: "run_testing",
  // dashboard
  access_sidebar: "access_sidebar",
});


const checkPermission = (user, permission) => {
  if (!user || !user?.role || !user?.role?.permissions) return false;
  const hasPermission = user?.role?.permissions?.some((p) => p?.name == permission);
  return hasPermission;
};

export default checkPermission;