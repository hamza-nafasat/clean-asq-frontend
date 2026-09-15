import CustomizableSelect from "@/components/shared/CustomizableSelect";
import TextField from "@/components/shared/TextField";
import BrandingColorInput from "./BrandingColorInput";
import BrandingEffectPicker from "./BrandingEffectPicker";
import BrandingGradientInput from "./BrandingGradientInput";
import { BRANDING_ALIGNMENT_OPTIONS } from "../utils/branding.constants";

const BrandingAppHeaderSection = ({
  image = null,
  setImage,
  headerBackground,
  setHeaderBackground,
  headerText,
  setHeaderText,
  appHeaderPadding,
  setAppHeaderPadding,
  headerAlignment,
  setHeaderAlignment,
  appLogoMaxWidth,
  setAppLogoMaxWidth,
  appLogoMaxHeight,
  setAppLogoMaxHeight,
  headerEffect,
  setHeaderEffect,
  headerMaterial,
  setHeaderMaterial,
}) => (
  <section className="my-6 flex w-full flex-col gap-2">
    <h3 className="border-b-2 text-lg font-semibold text-gray-800">Application Header</h3>
    <div className="flex flex-wrap gap-x-6 gap-y-4 items-end">
      <div className="flex flex-col gap-1">
        <BrandingGradientInput
          setImage={setImage}
          image={image}
          setColor={setHeaderBackground}
          label="Background"
          value={headerBackground}
          onChange={setHeaderBackground}
        />
      </div>
      <div className="flex flex-col gap-1">
        <BrandingColorInput setImage={setImage} image={image} label="Text" color={headerText} setColor={setHeaderText} />
      </div>
      <div className="flex flex-col gap-1">
        <TextField
          label={"Padding (px)"}
          labelCs="text-sm!"
          type="number"
          min={0}
          max={100}
          value={appHeaderPadding}
          onChange={(e) => setAppHeaderPadding?.(Number(e.target.value))}
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="w-48">
          <CustomizableSelect
            label={"Logo Alignment"}
            labelCs="text-sm! text-black"
            initialValue={headerAlignment}
            options={BRANDING_ALIGNMENT_OPTIONS}
            onSelect={(value) => setHeaderAlignment?.(value)}
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
          onChange={(e) => setAppLogoMaxWidth?.(Number(e.target.value))}
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
          onChange={(e) => setAppLogoMaxHeight?.(Number(e.target.value))}
        />
      </div>
    </div>
    {setHeaderEffect && (
      <div className="mt-2">
        <BrandingEffectPicker
          label="Header Visual Effect"
          value={headerEffect}
          onChange={setHeaderEffect}
          material={headerMaterial}
          onMaterialChange={setHeaderMaterial}
        />
      </div>
    )}
  </section>
);

export default BrandingAppHeaderSection;
