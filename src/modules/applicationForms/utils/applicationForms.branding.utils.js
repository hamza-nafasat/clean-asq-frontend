import { userExist, userNotExist } from "@/redux/slices/auth.slice";
import { effectToBoxShadow, materialToGloss, parseEffectState } from "@/utils/effectPresets";
import { DEFAULT_BUTTON_EFFECT, DEFAULT_FORM_BUTTON_COLOR } from "./applicationForms.constants";

export const getFormButtonStyle = (branding) => {
  const colors = branding?.colors;
  const effect = branding?.buttonEffect || DEFAULT_BUTTON_EFFECT;
  const material = branding?.buttonMaterial ?? 0;
  const gloss = materialToGloss(material, parseEffectState(effect).angle);
  return {
    background: gloss ? `${gloss}, ${colors?.primary || DEFAULT_FORM_BUTTON_COLOR}` : colors?.primary || undefined,
    borderColor: colors?.primary,
    color: colors?.buttonTextPrimary,
    boxShadow: effectToBoxShadow(effect) || "none",
    transition: "all 0.3s ease",
  };
};

// refresh user after home branding
export const createUserRefreshDispatcher = (dispatch) => async (profileRes) => {
  if (profileRes?.success) {
    dispatch(userExist(profileRes.data));
  } else {
    dispatch(userNotExist());
  }
};
