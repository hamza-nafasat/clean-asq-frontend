import { useRef } from "react";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import BrandingColorInput from "./BrandingColorInput";
import BrandingEffectPicker from "./BrandingEffectPicker";
import BrandingGradientInput from "./BrandingGradientInput";
import { FOOTER_WILDCARDS } from "@/utils/footerWildcards";

const BrandingAppFooterSection = ({
  image = null,
  setImage,
  footerBackground,
  setFooterBackground,
  footerText,
  setFooterText,
  appFooterPadding,
  setAppFooterPadding,
  applicationFooterText = "",
  setApplicationFooterText,
  applicationFooterTextSize,
  setApplicationFooterTextSize,
  privacyPolicyUrl,
  setPrivacyPolicyUrl,
  termsOfServiceUrl,
  setTermsOfServiceUrl,
  footerEffect,
  setFooterEffect,
  footerMaterial,
  setFooterMaterial,
  errors = {},
}) => {
  const footerTextRef = useRef(null);

  // insert wildcard at the caret
  const insertWildcard = (token) => {
    const input = footerTextRef.current;
    if (!input) return;
    const start = input.selectionStart ?? applicationFooterText.length;
    const end = input.selectionEnd ?? applicationFooterText.length;
    setApplicationFooterText?.(applicationFooterText.slice(0, start) + token + applicationFooterText.slice(end));
    const caret = start + token.length;
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(caret, caret);
    });
  };

  return (
    <section className="my-6 flex w-full flex-col gap-2">
      <h3 className="border-b-2 text-lg font-semibold text-gray-800">Application Footer</h3>
      <div className="flex flex-wrap gap-x-6 gap-y-4 items-end">
        <BrandingGradientInput
          setImage={setImage}
          image={image}
          setColor={setFooterBackground}
          label="Background"
          value={footerBackground}
          error={errors.footerBackground}
          onChange={setFooterBackground}
        />
        <BrandingColorInput setImage={setImage} image={image} label="Text" color={footerText}
          setColor={setFooterText}
          error={errors.footerText}
        />
        <div className="flex flex-col gap-1">
          <TextField
            label="Padding (px)"
            labelSize="sm"
            type="number"
            min={0}
            max={100}
            value={appFooterPadding}
            onChange={(e) => setAppFooterPadding?.(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="mt-2 grid grid-cols-[1fr_max-content] gap-x-3 gap-y-1">
        <TextField
          label="Application Footer Text"
          labelSize="sm"
          ref={footerTextRef}
          type="text"
          value={applicationFooterText}
          error={errors.applicationFooterText}
          onChange={(e) => setApplicationFooterText?.(e.target.value)}
        />
        <TextField
          label="Size (px)"
          labelSize="sm"
          type="number"
          min={8}
          max={72}
          value={applicationFooterTextSize}
          onChange={(e) => setApplicationFooterTextSize?.(Number(e.target.value))}
        />
      </div>
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          onClick={() => insertWildcard(FOOTER_WILDCARDS.year)}
          className="mt-1 self-start rounded-md border px-2.5 py-1"
          title="Insert current year wildcard at cursor"
          label={"+ {Year}"}
        />
        <Button
          type="button"
          onClick={() => insertWildcard(FOOTER_WILDCARDS.company)}
          className="mt-1 self-start rounded-md border px-2.5 py-1"
          title="Insert company name wildcard at cursor"
          label={"+ {Company}"}
        />
      </div>
      <div className="mt-3 grid grid-cols-[1fr_1fr] gap-x-6 gap-y-1">
        <TextField
          label="Privacy Policy URL"
          labelSize="sm"
          type="url"
          placeholder="https://example.com/privacy"
          value={privacyPolicyUrl}
          onChange={(e) => setPrivacyPolicyUrl?.(e.target.value)}
        />
        <TextField
          label="Terms of Service URL"
          labelSize="sm"
          type="url"
          placeholder="https://example.com/terms"
          value={termsOfServiceUrl}
          onChange={(e) => setTermsOfServiceUrl?.(e.target.value)}
        />
      </div>
      {setFooterEffect && (
        <div className="mt-2">
          <BrandingEffectPicker
            label="Footer Visual Effect"
            value={footerEffect}
            onChange={setFooterEffect}
            material={footerMaterial}
            onMaterialChange={setFooterMaterial}
          />
        </div>
      )}
    </section>
  );
};

export default BrandingAppFooterSection;
