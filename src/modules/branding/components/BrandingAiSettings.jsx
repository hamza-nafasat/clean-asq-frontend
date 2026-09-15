import useBrandingVoiceSample from "../hooks/useBrandingVoiceSample";
import Checkbox from "@/components/shared/Checkbox";
import BrandingAiWidgetPreview from "./BrandingAiWidgetPreview";
import BrandingColorInput from "./BrandingColorInput";
import { BRANDING_AI_VOICE_OPTIONS } from "../utils/branding.constants";

const BrandingAiSettings = ({ values = {}, setters = {}, image = null, setImage }) => {
  const { isSamplePlaying, playSample, stopSample } = useBrandingVoiceSample(values.aiVoice);

  const launchColor = values.aiLaunchButtonColor || values.accentColor;
  const headerColor = values.aiHeaderColor || values.headerBackground;
  const bannerColor = values.aiBannerColor || values.headerBackground;
  const bannerTextColor = values.aiBannerTextColor || values.headerText;

  const resetButtons = [
    ["Launch Button", setters.aiLaunchButtonColor],
    ["Header/Bubble", setters.aiHeaderColor],
    ["Banners", setters.aiBannerColor],
    ["Banner Text", setters.aiBannerTextColor],
  ];

  return (
    <section className="my-6 flex w-full flex-col gap-4">
      <h3 className="border-b-2 text-lg font-semibold text-gray-800">AI Configuration</h3>

      {/* Voice */}
      <div className="flex flex-col gap-1 max-w-sm">
        <label className="text-sm font-medium text-gray-700">AI Assistant Voice</label>
        <p className="text-xs text-gray-400">
          The voice used when the AI assistant speaks to applicants using this branding profile.
        </p>
        <div className="mt-1 flex items-center gap-2">
          <select
            value={values.aiVoice}
            aria-label="AI Assistant Voice"
            onChange={(e) => {
              setters.aiVoice(e.target.value);
              stopSample();
            }}
            className="h-10 flex-1 rounded-lg border border-gray-300 bg-[#FAFBFF] px-3 text-sm text-gray-700 outline-none focus:border-purple-400"
          >
            {BRANDING_AI_VOICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={playSample}
            title={isSamplePlaying ? "Stop sample" : "Play a short voice sample"}
            className={`flex items-center gap-1.5 rounded-lg border px-3 h-10 text-sm font-medium transition-all whitespace-nowrap ${
              isSamplePlaying
                ? "border-purple-400 bg-purple-50 text-purple-700"
                : "border-gray-300 bg-[#FAFBFF] text-gray-600 hover:border-purple-300 hover:text-purple-600"
            }`}
          >
            {isSamplePlaying ? "◼ Stop" : "▶ Play sample"}
          </button>
        </div>
      </div>

      {/* Personality */}
      <div className="flex flex-col gap-1 max-w-2xl">
        <label className="text-sm font-medium text-gray-700">Custom Personality Settings</label>
        <p className="text-xs text-gray-400">
          Customise the assistant&apos;s tone, word choice, and personality for this branding profile. This field can
          only affect <em>how</em> the assistant communicates — not what it does, what tasks it performs, or any other
          behaviour. The branding assistant can suggest and write this for you.
        </p>
        <textarea
          value={values.aiCustomPrompt}
          aria-label="Custom Personality Settings"
          onChange={(e) => setters.aiCustomPrompt(e.target.value)}
          placeholder="e.g. Use a warm, encouraging tone. Be concise — keep responses under three sentences. Occasionally use light humour to keep the experience friendly."
          rows={4}
          className="mt-1 rounded-lg border border-gray-300 bg-[#FAFBFF] px-3 py-2 text-sm text-gray-700 outline-none focus:border-purple-400 resize-y"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          label={"Use custom AI button icon"}
          type="checkbox"
          id="aiUseCustomIcon"
          checked={values.aiUseCustomIcon}
          onChange={(e) => setters.aiUseCustomIcon(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 accent-purple-600 cursor-pointer"
        />
      </div>

      {/* Colours and preview */}
      <div className="flex flex-wrap gap-8">
        <div className="flex flex-col gap-4 min-w-65">
          <p className="text-xs text-gray-400 -mb-2">
            Leave unchanged to use the matching branding color as the default.
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <BrandingColorInput
              image={image}
              setImage={setImage}
              label="Launch Button"
              color={launchColor}
              setColor={setters.aiLaunchButtonColor}
            />
            <BrandingColorInput
              image={image}
              setImage={setImage}
              label="Header / Bubble"
              color={headerColor}
              setColor={setters.aiHeaderColor}
            />
            <BrandingColorInput
              image={image}
              setImage={setImage}
              label="Banner Background"
              color={bannerColor}
              setColor={setters.aiBannerColor}
            />
            <BrandingColorInput
              image={image}
              setImage={setImage}
              label="Banner Text"
              color={bannerTextColor}
              setColor={setters.aiBannerTextColor}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {resetButtons.map(([label, setter]) => (
              <button
                key={label}
                type="button"
                onClick={() => setter("")}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
              >
                Reset {label}
              </button>
            ))}
          </div>
        </div>

        <BrandingAiWidgetPreview
          launchColor={launchColor}
          headerColor={headerColor}
          bannerColor={bannerColor}
          bannerTextColor={bannerTextColor}
          useCustomIcon={values.aiUseCustomIcon}
        />
      </div>
    </section>
  );
};

export default BrandingAiSettings;
