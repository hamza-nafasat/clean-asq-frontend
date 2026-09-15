import TextField from "@/components/shared/TextField";
import BrandingEffectPicker from "./BrandingEffectPicker";
import BrandingGradientInput from "./BrandingGradientInput";

const BrandingEmailHeader = ({ values = {}, setters = {}, image = null, setImage }) => (
  <section className="my-6 flex w-full flex-col gap-2">
    <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Header</h3>

    <div className="grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "repeat(3, max-content)" }}>
      <BrandingGradientInput
        image={image}
        setImage={setImage}
        label={"Background Gradient"}
        value={values.emailHeaderColor}
        onChange={setters.emailHeaderColor}
        setColor={setters.emailHeaderColor}
      />

      <TextField
        label={"Height (px)"}
        labelCs="text-sm!"
        type="number"
        min={0}
        max={200}
        value={values.emailHeaderPadding}
        onChange={(e) => setters.emailHeaderPadding(Number(e.target.value))}
      />
    </div>
    <div className="mt-1">
      <BrandingEffectPicker
        label="Header Visual Effect"
        value={values.emailHeaderEffect}
        onChange={setters.emailHeaderEffect}
        material={values.emailHeaderMaterial}
        onMaterialChange={setters.emailHeaderMaterial}
      />
    </div>
    <div className="flex flex-col gap-2">
      <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content max-content" }}>
        <TextField
          label={"Header Headline Text"}
          labelCs="text-sm!"
          type="textarea"
          value={values.headerHeading}
          onChange={(e) => setters.headerHeading(e.target.value)}
        />
        <TextField
          label={"Font Size (px)"}
          labelCs="text-sm!"
          type="number"
          min={8}
          max={72}
          value={values.headerHeadingSize}
          onChange={(e) => setters.headerHeadingSize(Number(e.target.value))}
        />
        <TextField
          label={"Spacing (px)"}
          labelCs="text-sm!"
          type="number"
          min={0}
          max={100}
          value={values.emailHeaderSpacing}
          onChange={(e) => setters.emailHeaderSpacing(Number(e.target.value))}
        />
      </div>
      <div className="grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: "1fr max-content" }}>
        <TextField
          label={"Content"}
          labelCs="text-sm!"
          type="textarea"
          value={values.headerDescription}
          onChange={(e) => setters.headerDescription(e.target.value)}
        />
        <TextField
          label={"Font Size (px)"}
          labelCs="text-sm!"
          type="number"
          min={8}
          max={72}
          value={values.headerDescriptionSize}
          onChange={(e) => setters.headerDescriptionSize(Number(e.target.value))}
        />
      </div>
    </div>
  </section>
);

export default BrandingEmailHeader;
