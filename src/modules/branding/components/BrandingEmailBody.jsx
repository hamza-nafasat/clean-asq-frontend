import BrandingColorInput from "./BrandingColorInput";
import BrandingGradientInput from "./BrandingGradientInput";

const BrandingEmailBody = ({ values = {}, setters = {}, image = null, setImage, errors = {} }) => (
  <section className="my-6 flex w-[70%] flex-col gap-2">
    <h3 className="border-b-2 text-lg font-semibold text-gray-800">Email Body</h3>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <BrandingColorInput
        image={image}
        setImage={setImage}
        label="Text"
        color={values.emailTextColor}
        setColor={setters.emailTextColor}
        error={errors.emailTextColor}
      />
      <BrandingGradientInput
        image={image}
        setImage={setImage}
        label="Body Background"
        value={values.emailBodyColor}
        onChange={setters.emailBodyColor}
        error={errors.emailBodyColor}
      />
    </div>
  </section>
);

export default BrandingEmailBody;
