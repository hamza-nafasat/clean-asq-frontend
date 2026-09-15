export const PRIMARY_CONTACT_ONLY = "primaryContact";

export const requiresOtherOperators = (idMissionRoleValue) => idMissionRoleValue === PRIMARY_CONTACT_ONLY;

export const resolveOtherOperatorsAnswer = (currentValue, mustHaveOtherOperators) => {
  if (!mustHaveOtherOperators) return currentValue ?? "";
  if (!currentValue || currentValue === "no") return "yes";
  return currentValue;
};
