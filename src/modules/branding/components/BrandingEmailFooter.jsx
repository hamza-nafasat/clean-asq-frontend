import TextField from "@/components/shared/TextField";
import BrandingColorInput from "./BrandingColorInput";
import BrandingEffectPicker from "./BrandingEffectPicker";
import BrandingGradientInput from "./BrandingGradientInput";

const BrandingEmailFooter = ({ values = {}, setters = {}, image = null, setImage }) => (
  <section className="my-6 flex w-full flex-col gap-2">
    <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Footer</h3>
    <div className="grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "repeat(3, max-content)" }}>
      <BrandingGradientInput
        image={image}
        setImage={setImage}
        label={"Background Color"}
        value={values.emailFooterColor}
        onChange={setters.emailFooterColor}
      />
      <BrandingColorInput
        image={image}
        setImage={setImage}
        label={"Text Color"}
        color={values.emailFooterTextColor}
        setColor={setters.emailFooterTextColor}
      />
      <TextField
        label={"Height (px)"}
        labelCs="text-sm!"
        type="number"
        min={0}
        max={200}
        value={values.emailFooterPadding}
        onChange={(e) => setters.emailFooterPadding(Number(e.target.value))}
      />
    </div>
    <div className="mt-1">
      <BrandingEffectPicker
        label="Footer Visual Effect"
        value={values.emailFooterEffect}
        onChange={setters.emailFooterEffect}
        material={values.emailFooterMaterial}
        onMaterialChange={setters.emailFooterMaterial}
      />
    </div>
    <div className="flex flex-col gap-2">
      <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content max-content" }}>
        <TextField
          label={"Footer Headline Text"}
          labelCs="text-sm!"
          type="textarea"
          value={values.footerHeading}
          onChange={(e) => setters.footerHeading(e.target.value)}
        />
        <TextField
          label={"Font Size (px)"}
          labelCs="text-sm!"
          type="number"
          min={8}
          max={72}
          value={values.footerHeadingSize}
          onChange={(e) => setters.footerHeadingSize(Number(e.target.value))}
        />
        <TextField
          label={"Spacing (px)"}
          labelCs="text-sm!"
          type="number"
          min={0}
          max={100}
          value={values.emailFooterSpacing}
          onChange={(e) => setters.emailFooterSpacing(Number(e.target.value))}
        />
      </div>
      <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content" }}>
        <TextField
          label={"Content"}
          labelCs="text-sm!"
          type="textarea"
          value={values.footerDescription}
          onChange={(e) => setters.footerDescription(e.target.value)}
        />
        <TextField
          label={"Font Size (px)"}
          labelCs="text-sm!"
          type="number"
          min={8}
          max={72}
          value={values.footerDescriptionSize}
          onChange={(e) => setters.footerDescriptionSize(Number(e.target.value))}
        />
      </div>
    </div>
  </section>
);

export default BrandingEmailFooter;
