import Button from "@/components/shared/small/Button";
import CustomizableSelect from "@/components/shared/small/CustomizeableSelect";
import { useEffect, useRef, useState } from "react";
import FontPicker from "./FontPicker";
import { LoaderIcon } from "lucide-react";
import TextField from "@/components/shared/small/TextField";
import EffectPicker from "./EffectPicker";
import { handleChange } from "@/utils/brandingUtils";

export const ColorInput = ({ label, color, setColor, setImage, image, hideLabel = false, className = "" }) => {
  const colorPickerDiv = useRef(null);
  const [ssLoading, setSSLoading] = useState(false);
  const [showSSButton, setShowSSButton] = useState(false);
  const [colorPicker, setColorPicker] = useState("");

  const openHandleChange = async () => {
    if (image) return;
    await handleChange({
      e: { target: { value: colorPicker } },
      setSSLoading,
      setColorPicker,
      setImage,
      setShowSSButton,
      setColor,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerDiv.current && !colorPickerDiv.current.contains(event.target)) {
        setShowSSButton(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex flex-col">
      {!hideLabel && (
        <label
          htmlFor={label.toLowerCase().replace(/\s/g, "-") + "-color"}
          className="mb-1 text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div ref={colorPickerDiv} className={`flex items-stretch space-x-2 ${className ? className : ""}`}>
        <input
          type="color"
          className="size-14 cursor-pointer appearance-none rounded-lg border-none outline-none focus:ring-0"
          value={color}
          onFocus={() => setShowSSButton(true)}
          onChange={(e) => {
            const newColor = e.target.value;
            setColorPicker(newColor);
            setColor(newColor);
          }}
        />
        {showSSButton && (
          <div className="flex">
            <Button
              variant="primary"
              onClick={openHandleChange}
              label={"Show Colors"}
              disabled={ssLoading}
              cnRight={"animate-spin"}
              rightIcon={ssLoading ? LoaderIcon : null}
            />
          </div>
        )}
        <div className="flex h-14 w-28 items-center justify-center rounded-md border px-4 py-2 text-center text-sm shadow-sm">
          {color}
        </div>
      </div>
    </div>
  );
};

const BrandElementAssignment = ({
  highlightingColor,
  setHighlightingColor,
  headerText,
  setHeaderText,
  footerText,
  setFooterText,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  accentColor,
  setAccentColor,
  textColor,
  setTextColor,
  linkColor,
  setLinkColor,
  backgroundColor,
  setBackgroundColor,
  frameColor,
  setFrameColor,
  fontFamily,
  setFontFamily,
  image,
  setImage,

  buttonTextPrimary,
  setButtonTextPrimary,
  buttonTextSecondary,
  setButtonTextSecondary,
  buttonBorderPrimary,
  setButtonBorderPrimary,
  buttonBorderSecondary,
  setButtonBorderSecondary,

  headerBackground,
  setHeaderBackground,
  footerBackground,
  setFooterBackground,
  headerAlignment,
  setHeaderAlignment,
  applicationFooterText,
  setApplicationFooterText,
  applicationFooterTextSize,
  setApplicationFooterTextSize,
  appHeaderPadding,
  setAppHeaderPadding,
  appFooterPadding,
  setAppFooterPadding,
  appLogoMaxWidth,
  setAppLogoMaxWidth,
  appLogoMaxHeight,
  setAppLogoMaxHeight,
  privacyPolicyUrl,
  setPrivacyPolicyUrl,
  termsOfServiceUrl,
  setTermsOfServiceUrl,
  headerEffect,
  setHeaderEffect,
  footerEffect,
  setFooterEffect,
  buttonEffect,
  setButtonEffect,
  headerMaterial,
  setHeaderMaterial,
  footerMaterial,
  setFooterMaterial,
  buttonMaterial,
  setButtonMaterial,
}) => {
  const footerTextRef = useRef(null);

  const insertYear = () => {
    const input = footerTextRef.current;
    if (!input) return;
    const start = input.selectionStart ?? applicationFooterText.length;
    const end = input.selectionEnd ?? applicationFooterText.length;
    const next = applicationFooterText.slice(0, start) + "{year}" + applicationFooterText.slice(end);
    setApplicationFooterText(next);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + 6, start + 6);
    });
  };

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Assign Brand Element</h2>

      <section className="my-6 flex w-full flex-col gap-2">
        <h3 className="border-b-2 text-lg font-semibold text-gray-800">Application Header</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-4 items-end">
          <div className="flex flex-col gap-1">
            {/* <label className="text-sm font-medium text-gray-700">Background</label> */}
            <GradientOrSolidInput
              setImage={setImage}
              image={image}
              setColor={setHeaderBackground}
              label="Background"
              value={headerBackground}
              onChange={setHeaderBackground}
            />
          </div>
          <div className="flex flex-col gap-1">
            <ColorInput setImage={setImage} image={image} label="Text" color={headerText} setColor={setHeaderText} />
          </div>
          <div className="flex flex-col gap-1">
            <TextField
              label={"Padding (px)"}
              labelCs="text-sm!"
              type="number"
              min={0}
              max={100}
              value={appHeaderPadding}
              onChange={(e) => setAppHeaderPadding(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="w-48">
              <CustomizableSelect
                label={"Logo Alignment"}
                labelCs="text-sm! text-black"
                initialValue={headerAlignment}
                options={[
                  { option: "Left", value: "left" },
                  { option: "Center", value: "center" },
                  { option: "Right", value: "right" },
                ]}
                onSelect={(value) => setHeaderAlignment(value)}
                defaultText="Choose Alignment"
                buttonClassName="h-14"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <TextField
              label={"Logo Max Width (px)"}
              labelCs="text-sm!"
              type="number"
              min={20}
              max={600}
              value={appLogoMaxWidth}
              onChange={(e) => setAppLogoMaxWidth(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <TextField
              label={"Logo Max Height (px)"}
              labelCs="text-sm!"
              type="number"
              min={20}
              max={300}
              value={appLogoMaxHeight}
              onChange={(e) => setAppLogoMaxHeight(Number(e.target.value))}
            />
          </div>
        </div>
        {setHeaderEffect && (
          <div className="mt-2">
            <EffectPicker
              label="Header Visual Effect"
              value={headerEffect}
              onChange={setHeaderEffect}
              material={headerMaterial}
              onMaterialChange={setHeaderMaterial}
            />
          </div>
        )}
      </section>

      <section className="my-6 flex w-[70%] flex-col gap-4">
        <h3 className="border-b-2 text-lg font-semibold text-gray-800">Application Form</h3>

        {/* Primary Button group */}
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Primary Button</h4>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <ColorInput
              setImage={setImage}
              image={image}
              label="Button Color"
              color={primaryColor}
              setColor={setPrimaryColor}
            />
            <ColorInput
              setImage={setImage}
              image={image}
              label="Border Color"
              color={buttonBorderPrimary}
              setColor={setButtonBorderPrimary}
            />
            <ColorInput
              setImage={setImage}
              image={image}
              label="Text Color"
              color={buttonTextPrimary}
              setColor={setButtonTextPrimary}
            />
          </div>
        </div>

        {/* Secondary Button group */}
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Secondary Button</h4>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <ColorInput
              setImage={setImage}
              image={image}
              label="Button Color"
              color={secondaryColor}
              setColor={setSecondaryColor}
            />
            <ColorInput
              setImage={setImage}
              image={image}
              label="Border Color"
              color={buttonBorderSecondary}
              setColor={setButtonBorderSecondary}
            />
            <ColorInput
              setImage={setImage}
              image={image}
              label="Text Color"
              color={buttonTextSecondary}
              setColor={setButtonTextSecondary}
            />
          </div>
        </div>

        {/* Button Effect */}
        {setButtonEffect && (
          <EffectPicker
            label="Button Visual Effect"
            value={buttonEffect}
            onChange={setButtonEffect}
            material={buttonMaterial}
            onMaterialChange={setButtonMaterial}
          />
        )}

        {/* Form Colors group */}
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Form Colors</h4>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ColorInput
              setImage={setImage}
              image={image}
              label="Accent Color"
              color={accentColor}
              setColor={setAccentColor}
            />
            <GradientOrSolidInput
              setImage={setImage}
              image={image}
              setColor={setBackgroundColor}
              label="Background Color"
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
            <ColorInput
              setImage={setImage}
              image={image}
              label="Text Color"
              color={textColor}
              setColor={setTextColor}
            />
            <ColorInput
              setImage={setImage}
              image={image}
              label="Link Color"
              color={linkColor}
              setColor={setLinkColor}
            />
            <ColorInput
              setImage={setImage}
              image={image}
              label="Frame Color (Input Fields, Borders)"
              color={frameColor}
              setColor={setFrameColor}
            />
            <ColorInput
              setImage={setImage}
              image={image}
              label="Highlighting Color"
              color={highlightingColor}
              setColor={setHighlightingColor}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="primary-font" className="text-sm font-medium text-gray-700">
            Font
          </label>

          <div className="mt-3 flex items-center space-x-2">
            <span className="rounded bg-gray-100 px-4 py-3 text-lg font-semibold">Aa</span>
            <FontPicker value={fontFamily.toLowerCase()} onChange={(value) => setFontFamily(value)} />

            <Button
              type="button"
              label={"Reset"}
              className="rounded-sm border px-4 py-3.25 text-s shadow-sm"
              onClick={() => setFontFamily("Inter")}
            />
          </div>
        </div>
      </section>

      <section className="my-6 flex w-full flex-col gap-2">
        <h3 className="border-b-2 text-lg font-semibold text-gray-800">Application Footer</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-4 items-end">
          <div className="flex flex-col gap-1">
            <GradientOrSolidInput
              setImage={setImage}
              image={image}
              setColor={setFooterBackground}
              label="Background"
              value={footerBackground}
              onChange={setFooterBackground}
            />
          </div>
          <div className="flex flex-col gap-1">
            <ColorInput setImage={setImage} image={image} label="Text" color={footerText} setColor={setFooterText} />
          </div>
          <div className="flex flex-col gap-1">
            <TextField
              label={"Padding (px)"}
              labelCs="text-sm!"
              type="number"
              min={0}
              max={100}
              value={appFooterPadding}
              onChange={(e) => setAppFooterPadding(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="mt-2 grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content" }}>
          <TextField
            label={"Application Footer Text"}
            labelCs="text-sm!"
            ref={footerTextRef}
            type="text"
            value={applicationFooterText}
            onChange={(e) => setApplicationFooterText(e.target.value)}
          />
          <TextField
            label={"Size (px)"}
            labelCs="text-sm!"
            type="number"
            min={8}
            max={72}
            value={applicationFooterTextSize}
            onChange={(e) => setApplicationFooterTextSize(Number(e.target.value))}
          />
        </div>
        <Button
          type="button"
          onClick={insertYear}
          className="mt-1 self-start rounded-md border  px-2.5 py-1"
          title="Insert current-year wildcard at cursor"
          label={"+ &#123;year&#125;"}
        />
        <div className="mt-3 grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <TextField
            label={"Privacy Policy URL"}
            labelCs="text-sm!"
            type="url"
            placeholder="https://example.com/privacy"
            value={privacyPolicyUrl}
            onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
          />
          <TextField
            label={"Terms of Service URL"}
            labelCs="text-sm!"
            type="url"
            placeholder="https://example.com/terms"
            value={termsOfServiceUrl}
            onChange={(e) => setTermsOfServiceUrl(e.target.value)}
          />
        </div>
        {setFooterEffect && (
          <div className="mt-2">
            <EffectPicker
              label="Footer Visual Effect"
              value={footerEffect}
              onChange={setFooterEffect}
              material={footerMaterial}
              onMaterialChange={setFooterMaterial}
            />
          </div>
        )}
      </section>

      {image && (
        <div className="fixed top-4 right-0 z-50 max-h-[95vh] bg-white p-4 shadow-2xl">
          {/* ❌ Close Button */}
          <Button
            label={"  ×"}
            onClick={() => {
              setImage(null);
              localStorage.removeItem("lastScreenshot");
              console.log("🗑️ Image removed and localStorage cleared");
            }}
            className="absolute top-2 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
          />
          {/* 🖼️ Image Preview */}
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            style={{
              width: "30vw",
              height: "auto",
              borderRadius: 8,
              objectFit: "contain",
              marginRight: 16,
            }}
          />
        </div>
      )}
    </div>
  );
};

const parseGradient = (value) => {
  if (!value || !value.startsWith("linear-gradient")) return null;
  const match = value.match(/linear-gradient\((\d+)deg,\s*(#[0-9a-fA-F]{3,8}),\s*(#[0-9a-fA-F]{3,8})\)/);
  if (!match) return null;
  return { angle: parseInt(match[1]), color1: match[2], color2: match[3] };
};

export const GradientOrSolidInput = ({ label, value, onChange, hideLabel = false, image, setImage, setColor }) => {
  const colorPickerDiv = useRef(null);
  const parsed = parseGradient(value);
  const [mode, setMode] = useState(parsed ? "gradient" : "solid");
  const [solidColor, setSolidColor] = useState(parsed ? "#000000" : value || "#000000");
  const [color1, setColor1] = useState(parsed?.color1 || "#3b82f6");
  const [color2, setColor2] = useState(parsed?.color2 || "#8b5cf6");
  const [angle, setAngle] = useState(parsed?.angle ?? 135);

  const [ssLoading, setSSLoading] = useState(false);
  const [showSSButton, setShowSSButton] = useState(false);
  const [colorPicker, setColorPicker] = useState("");

  const openHandleChange = async () => {
    if (image) return;
    await handleChange({
      e: { target: { value: colorPicker } },
      setSSLoading,
      setColorPicker,
      setImage,
      setShowSSButton,
      setColor,
    });
  };

  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      const p = parseGradient(value);
      if (p) {
        setMode("gradient");
        setColor1(p.color1);
        setColor2(p.color2);
        setAngle(p.angle);
      } else if (value) {
        setMode("solid");
        setSolidColor(value);
      }
    }
  }, [value]);

  const switchToSolid = () => {
    setMode("solid");
    onChange(solidColor);
  };

  const switchToGradient = () => {
    setMode("gradient");
    onChange(`linear-gradient(${angle}deg, ${color1}, ${color2})`);
  };

  const handleSolid = (c) => {
    setSolidColor(c);
    onChange(c);
  };
  const handleC1 = (c) => {
    setColor1(c);
    onChange(`linear-gradient(${angle}deg, ${c}, ${color2})`);
  };
  const handleC2 = (c) => {
    setColor2(c);
    onChange(`linear-gradient(${angle}deg, ${color1}, ${c})`);
  };
  const handleAngle = (a) => {
    setAngle(a);
    onChange(`linear-gradient(${a}deg, ${color1}, ${color2})`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerDiv.current && !colorPickerDiv.current.contains(event.target)) {
        setShowSSButton(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col">
      {!hideLabel && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
      <div className="mb-2 flex gap-1">
        <button
          type="button"
          onClick={switchToSolid}
          className={`rounded px-2 py-1 text-xs font-medium ${mode === "solid" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Solid
        </button>
        <button
          type="button"
          onClick={switchToGradient}
          className={`rounded px-2 py-1 text-xs font-medium ${mode === "gradient" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Gradient
        </button>
      </div>
      {mode === "solid" ? (
        <div ref={colorPickerDiv} className="flex items-stretch space-x-2">
          <input
            type="color"
            value={solidColor}
            onFocus={() => setShowSSButton(true)}
            onChange={(e) => handleSolid(e.target.value)}
            className="size-14 cursor-pointer rounded-lg border-none outline-none focus:ring-0"
          />
          {showSSButton ? (
            <div className="flex">
              <Button
                variant="primary"
                onClick={openHandleChange}
                label={"Show Colors"}
                disabled={ssLoading}
                cnRight={"animate-spin"}
                rightIcon={ssLoading ? LoaderIcon : null}
              />
            </div>
          ) : (
            <div className="flex h-14 w-28 items-center justify-center rounded-md border px-4 py-2 text-center text-sm shadow-sm">
              {solidColor}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">Start</span>
              <input
                type="color"
                value={color1}
                onChange={(e) => handleC1(e.target.value)}
                className="size-10 cursor-pointer rounded border-none outline-none"
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">End</span>
              <input
                type="color"
                value={color2}
                onChange={(e) => handleC2(e.target.value)}
                className="size-10 cursor-pointer rounded border-none outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">Angle °</span>
              <input
                type="number"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => handleAngle(Number(e.target.value))}
                className="h-10 w-16 rounded-lg border border-gray-300 bg-[#FAFBFF] px-2 text-sm outline-none"
              />
            </div>
          </div>

          <div
            className="h-6 w-full rounded-md border"
            style={{ background: `linear-gradient(${angle}deg, ${color1}, ${color2})` }}
          />
        </div>
      )}
    </div>
  );
};

export default BrandElementAssignment;
