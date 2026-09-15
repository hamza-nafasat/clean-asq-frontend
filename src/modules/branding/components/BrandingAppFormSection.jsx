import Button from "@/components/shared/Button";
import BrandingColorInput from "./BrandingColorInput";
import BrandingEffectPicker from "./BrandingEffectPicker";
import BrandingFontPicker from "./BrandingFontPicker";
import BrandingGradientInput from "./BrandingGradientInput";
import { BRANDING_DEFAULT_FONT } from "../utils/branding.constants";

const BrandingAppFormSection = ({
  image = null,
  setImage,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  buttonBorderPrimary,
  setButtonBorderPrimary,
  buttonBorderSecondary,
  setButtonBorderSecondary,
  buttonTextPrimary,
  setButtonTextPrimary,
  buttonTextSecondary,
  setButtonTextSecondary,
  buttonEffect,
  setButtonEffect,
  buttonMaterial,
  setButtonMaterial,
  accentColor,
  setAccentColor,
  backgroundColor,
  setBackgroundColor,
  textColor,
  setTextColor,
  linkColor,
  setLinkColor,
  frameColor,
  setFrameColor,
  highlightingColor,
  setHighlightingColor,
  fontFamily = "",
  setFontFamily,
}) => {
  const colorInput = (label, color, setColor) => (
    <BrandingColorInput setImage={setImage} image={image} label={label} color={color} setColor={setColor} />
  );

  return (
    <section className="my-6 flex w-[70%] flex-col gap-4">
      <h3 className="border-b-2 text-lg font-semibold text-gray-800">Application Form</h3>

      {/* Primary button */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Primary Button</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {colorInput("Button Color", primaryColor, setPrimaryColor)}
          {colorInput("Border Color", buttonBorderPrimary, setButtonBorderPrimary)}
          {colorInput("Text Color", buttonTextPrimary, setButtonTextPrimary)}
        </div>
      </div>

      {/* Secondary button */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Secondary Button</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {colorInput("Button Color", secondaryColor, setSecondaryColor)}
          {colorInput("Border Color", buttonBorderSecondary, setButtonBorderSecondary)}
          {colorInput("Text Color", buttonTextSecondary, setButtonTextSecondary)}
        </div>
      </div>

      {setButtonEffect && (
        <BrandingEffectPicker
          label="Button Visual Effect"
          value={buttonEffect}
          onChange={setButtonEffect}
          material={buttonMaterial}
          onMaterialChange={setButtonMaterial}
        />
      )}

      {/* Form colours */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Form Colors</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {colorInput("Accent Color", accentColor, setAccentColor)}
          <BrandingGradientInput
            setImage={setImage}
            image={image}
            setColor={setBackgroundColor}
            label="Background Color"
            value={backgroundColor}
            onChange={setBackgroundColor}
          />
          {colorInput("Text Color", textColor, setTextColor)}
          {colorInput("Link Color", linkColor, setLinkColor)}
          {colorInput("Frame Color (Input Fields, Borders)", frameColor, setFrameColor)}
          {colorInput("Highlighting Color", highlightingColor, setHighlightingColor)}
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="primary-font" className="text-sm font-medium text-gray-700">
          Font
        </label>

        <div className="mt-3 flex items-center space-x-2">
          <span className="rounded bg-gray-100 px-4 py-3 text-lg font-semibold">Aa</span>
          <BrandingFontPicker value={fontFamily.toLowerCase()} onChange={(value) => setFontFamily?.(value)} />

          <Button
            type="button"
            label={"Reset"}
            className="rounded-sm border px-4 py-3.25 text-s shadow-sm"
            onClick={() => setFontFamily?.(BRANDING_DEFAULT_FONT)}
          />
        </div>
      </div>
    </section>
  );
};

export default BrandingAppFormSection;
