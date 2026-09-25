// canonical English text - translated dynamically at display time, never hardcoded per language
export const WIDGET_STRINGS = {
  error: "Sorry, something went wrong",
  errorCouldnt: "Sorry, I wasn't able to do that",
  tryAgain: "Please try again.",
  noPermission: "You don't have permission to do that.",
  cancelledChange: "Okay, I cancelled that change.",
  tooManyRequests: "You're sending requests too fast. Please wait a moment.",
  cantDoOnPage: "I can't do that on this page.",
  revertFailed: "Sorry, the revert failed",
  formNotLoaded: "Sorry, I couldn't load the form details",
  fetchFailed: "Sorry, I couldn't fetch that page",
  optionsLabel: "Options",
  stillMissing: (list) => `Still missing: ${list}.`,
  fillGuidanceEnter: (label) => `I can't fill this in for you — please enter **${label}** yourself, then say **next** when you're done.`,
  fillGuidanceSelect: (label) => `I can't fill this in for you — please select **${label}** yourself, then say **next** when you're done.`,
  fillGuidanceSign: (label) => `I can't fill this in for you — please sign **${label}** yourself, then say **next** when you're done.`,
  securePanelHint: (label) => `Enter **${label}** below — it's entered securely and never sent to me.`,
};
