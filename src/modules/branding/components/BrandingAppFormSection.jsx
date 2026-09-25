import Button from "@/components/shared/Button";
import BrandingColorInput from "./BrandingColorInput";
import BrandingEffectPicker from "./BrandingEffectPicker";
import BrandingFieldError from "./BrandingFieldError";
import BrandingFontPicker from "./BrandingFontPicker";
import BrandingGradientInput from "./BrandingGradientInput";
import { BRANDING_DEFAULT_FONT } from "../utils/branding.constants";
import { normalizeFontFamily } from "../utils/branding.utils";

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
  errors = {},
}) => {
  const colorInput = (label, color, setColor, error) => (
    <BrandingColorInput
      setImage={setImage}
      image={image}
      label={label}
      color={color}
      setColor={setColor}
      error={error}
    />
  );

  return (
    <section className="my-6 flex w-[70%] flex-col gap-4">
      <h3 className="border-b-2 text-lg font-semibold text-gray-800">Application Form</h3>

      {/* Primary button */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Primary Button</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {colorInput("Button Color", primaryColor, setPrimaryColor, errors.primaryColor)}
          {colorInput("Border Color", buttonBorderPrimary, setButtonBorderPrimary)}
          {colorInput("Text Color", buttonTextPrimary, setButtonTextPrimary, errors.buttonTextPrimary)}
        </div>
      </div>

      {/* Secondary button */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Secondary Button</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {colorInput("Button Color", secondaryColor, setSecondaryColor, errors.secondaryColor)}
          {colorInput("Border Color", buttonBorderSecondary, setButtonBorderSecondary)}
          {colorInput("Text Color", buttonTextSecondary, setButtonTextSecondary, errors.buttonTextSecondary)}
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
          {colorInput("Accent Color", accentColor, setAccentColor, errors.accentColor)}
          <BrandingGradientInput
            setImage={setImage}
            image={image}
            setColor={setBackgroundColor}
            label="Background Color"
            value={backgroundColor}
            error={errors.backgroundColor}
            onChange={setBackgroundColor}
          />
          {colorInput("Text Color", textColor, setTextColor, errors.textColor)}
          {colorInput("Link Color", linkColor, setLinkColor, errors.linkColor)}
          {colorInput("Frame Color (Input Fields, Borders)", frameColor, setFrameColor, errors.frameColor)}
          {colorInput("Highlighting Color", highlightingColor, setHighlightingColor, errors.highlightingColor)}
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="primary-font" className="text-sm font-medium text-gray-700">
          Font
        </label>

        <div className="mt-3 flex items-center space-x-2">
          <span className="rounded bg-gray-100 px-4 py-3 text-lg font-semibold">Aa</span>
          <BrandingFontPicker
            id="primary-font"
            value={normalizeFontFamily(fontFamily)}
            onChange={(value) => setFontFamily?.(value)}
          />

          <Button
            type="button"
            label="Reset"
            className="rounded-sm border px-4 py-3.25 text-sm shadow-sm"
            onClick={() => setFontFamily?.(BRANDING_DEFAULT_FONT)}
          />
        </div>
        <BrandingFieldError message={errors.fontFamily} />
      </div>
    </section>
  );
};

export default BrandingAppFormSection;
