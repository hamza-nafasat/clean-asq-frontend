/**
 * Apply a userBranding profile object to BrandingContext setters.
 * Used after home/website branding is updated.
 */
export function applyUserBrandingToContext(userBranding, setters) {
  if (!userBranding?.colors) return;
  const c = userBranding.colors;
  setters.setPrimaryColor?.(c.primary);
  setters.setSecondaryColor?.(c.secondary);
  setters.setAccentColor?.(c.accent);
  setters.setTextColor?.(c.text);
  setters.setLinkColor?.(c.link);
  setters.setBackgroundColor?.(c.background);
  setters.setFrameColor?.(c.frame);
  setters.setFontFamily?.(userBranding.fontFamily);
  setters.setLogo?.(userBranding?.selectedLogo);
  setters.setButtonTextPrimary?.(c.buttonTextPrimary);
  setters.setButtonTextSecondary?.(c.buttonTextSecondary);
  setters.setHeaderAlignment?.(userBranding.headerAlignment);
  setters.setHeaderBackground?.(c.headerBackground);
  setters.setFooterBackground?.(c.footerBackground);
  setters.setHeaderText?.(c.headerText);
  setters.setFooterText?.(c.footerText);
  setters.setHighlightingColor?.(c.highlighting);
  setters.setApplicationFooterText?.(userBranding.applicationFooterText);
  if (userBranding?.appLogoMaxWidth) setters.setAppLogoMaxWidth?.(userBranding.appLogoMaxWidth);
  if (userBranding?.appLogoMaxHeight) setters.setAppLogoMaxHeight?.(userBranding.appLogoMaxHeight);
  setters.setAiVoice?.(userBranding?.aiVoice || "nova");
  setters.setAiCustomPrompt?.(userBranding?.aiCustomPrompt || "");
  setters.setAiLaunchButtonColor?.(userBranding?.aiLaunchButtonColor || "");
  setters.setAiHeaderColor?.(userBranding?.aiHeaderColor || "");
  setters.setAiBannerColor?.(userBranding?.aiBannerColor || "");
  setters.setAiBannerTextColor?.(userBranding?.aiBannerTextColor || "");
  setters.setAiSliderColor?.(userBranding?.aiSliderColor || "");
  setters.setPrivacyPolicyUrl?.(userBranding?.privacyPolicyUrl || "");
  setters.setTermsOfServiceUrl?.(userBranding?.termsOfServiceUrl || "");
  setters.setFavicon?.(userBranding?.favicon || "");
  setters.setTabTitle?.(userBranding?.tabTitle || "");
  setters.setHeaderEffect?.(userBranding?.headerEffect || "none");
  setters.setFooterEffect?.(userBranding?.footerEffect || "none");
  setters.setEmailHeaderEffect?.(userBranding?.emailHeaderEffect || "none");
  setters.setEmailFooterEffect?.(userBranding?.emailFooterEffect || "none");
  setters.setButtonEffect?.(userBranding?.buttonEffect || "none");
  setters.setHeaderMaterial?.(userBranding?.headerMaterial ?? 0);
  setters.setFooterMaterial?.(userBranding?.footerMaterial ?? 0);
  setters.setButtonMaterial?.(userBranding?.buttonMaterial ?? 0);
  setters.setEmailHeaderMaterial?.(userBranding?.emailHeaderMaterial ?? 0);
  setters.setEmailFooterMaterial?.(userBranding?.emailFooterMaterial ?? 0);
}

/** Map useBranding() return value to setter object for applyUserBrandingToContext. */
export function getBrandingSettersFromHook(b) {
  if (!b) return {};
  return {
    setPrimaryColor: b.setPrimaryColor,
    setSecondaryColor: b.setSecondaryColor,
    setAccentColor: b.setAccentColor,
    setTextColor: b.setTextColor,
    setLinkColor: b.setLinkColor,
    setBackgroundColor: b.setBackgroundColor,
    setFrameColor: b.setFrameColor,
    setFontFamily: b.setFontFamily,
    setLogo: b.setLogo,
    setButtonTextPrimary: b.setButtonTextPrimary,
    setButtonTextSecondary: b.setButtonTextSecondary,
    setHeaderAlignment: b.setHeaderAlignment,
    setHeaderBackground: b.setHeaderBackground,
    setFooterBackground: b.setFooterBackground,
    setHeaderText: b.setHeaderText,
    setFooterText: b.setFooterText,
    setHighlightingColor: b.setHighlightingColor,
    setApplicationFooterText: b.setApplicationFooterText,
    setAppLogoMaxWidth: b.setAppLogoMaxWidth,
    setAppLogoMaxHeight: b.setAppLogoMaxHeight,
    setAiVoice: b.setAiVoice,
    setAiCustomPrompt: b.setAiCustomPrompt,
    setAiLaunchButtonColor: b.setAiLaunchButtonColor,
    setAiHeaderColor: b.setAiHeaderColor,
    setAiBannerColor: b.setAiBannerColor,
    setAiBannerTextColor: b.setAiBannerTextColor,
    setAiSliderColor: b.setAiSliderColor,
    setPrivacyPolicyUrl: b.setPrivacyPolicyUrl,
    setTermsOfServiceUrl: b.setTermsOfServiceUrl,
    setFavicon: b.setFavicon,
    setTabTitle: b.setTabTitle,
    setHeaderEffect: b.setHeaderEffect,
    setFooterEffect: b.setFooterEffect,
    setEmailHeaderEffect: b.setEmailHeaderEffect,
    setEmailFooterEffect: b.setEmailFooterEffect,
    setButtonEffect: b.setButtonEffect,
    setHeaderMaterial: b.setHeaderMaterial,
    setFooterMaterial: b.setFooterMaterial,
    setButtonMaterial: b.setButtonMaterial,
    setEmailHeaderMaterial: b.setEmailHeaderMaterial,
    setEmailFooterMaterial: b.setEmailFooterMaterial,
  };
}

export function mapHomeBranding(user) {
  const b = user?.branding;
  if (!b?._id) return null;
  return { _id: b._id, name: b.name || "Home branding" };
}

/**
 * Execute a single branding assignment (form, home/website, or both).
 */
export async function executeBrandingAssignment({
  addBrandingMutation,
  getUserProfile,
  brandingSetters,
  dispatchUserRefresh,
  assignment: { brandingId, formId, applyToHome },
}) {
  if (!brandingId) throw new Error("Branding ID is required");
  if (!formId && !applyToHome) {
    throw new Error("At least one target is required: formId or applyToHome");
  }

  const res = await addBrandingMutation({
    brandingId,
    formId: formId || undefined,
    onHome: applyToHome ? "yes" : "no",
  }).unwrap();

  if (!res?.success) throw new Error(res?.message || "Failed to apply branding");

  if (applyToHome && getUserProfile) {
    const profileRes = await getUserProfile().unwrap();
    const userBranding = profileRes?.data?.branding;
    if (userBranding && brandingSetters) {
      applyUserBrandingToContext(userBranding, brandingSetters);
    }
    if (dispatchUserRefresh) {
      await dispatchUserRefresh(profileRes);
    }
  }

  return res;
}

/**
 * Run multiple branding assignments (deduped by brandingId+formId+applyToHome).
 */
export async function executeBrandingAssignments({
  updates,
  addBrandingMutation,
  getUserProfile,
  brandingSetters,
  dispatchUserRefresh,
}) {
  const errors = [];
  let lastMessage = "";

  for (const update of updates) {
    const { brandingId, formId, applyToHome } = update;
    try {
      const res = await executeBrandingAssignment({
        addBrandingMutation,
        getUserProfile: applyToHome ? getUserProfile : undefined,
        brandingSetters: applyToHome ? brandingSetters : undefined,
        dispatchUserRefresh: applyToHome ? dispatchUserRefresh : undefined,
        assignment: { brandingId, formId, applyToHome: !!applyToHome },
      });
      lastMessage = res?.message || lastMessage;
    } catch (err) {
      const label = formId || (applyToHome ? "home" : "unknown");
      errors.push(`${label}: ${err?.data?.message || err?.message || "failed"}`);
    }
  }

  if (errors.length) {
    throw new Error(
      errors.length === updates.length
        ? errors.join("; ")
        : `Partial failure (${errors.length}/${updates.length}): ${errors.join("; ")}`,
    );
  }

  return { message: lastMessage };
}
