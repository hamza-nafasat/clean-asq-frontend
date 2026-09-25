import BrandingEmailBody from "./BrandingEmailBody";
import BrandingEmailFooter from "./BrandingEmailFooter";
import BrandingEmailHeader from "./BrandingEmailHeader";
import BrandingEmailPreview from "./BrandingEmailPreview";
import BrandingEmailSettings from "./BrandingEmailSettings";

const BrandingEmailSection = ({ values, setters, errors = {}, image = null, setImage, defaultSelectedLogo = null }) => {
  const sectionProps = { values, setters, errors, image, setImage };

  return (
    <>
      <article className="flex flex-col gap-2">
        <BrandingEmailSettings values={values} setters={setters} defaultSelectedLogo={defaultSelectedLogo} />
        <BrandingEmailHeader {...sectionProps} />
        <BrandingEmailBody {...sectionProps} />
        <BrandingEmailFooter {...sectionProps} />
      </article>

      <div className="mt-6 rounded-xl border border-softBorder p-3 shadow-sm md:p-6">
        <BrandingEmailPreview
          emailHeader={values.emailHeader}
          emailFooter={values.emailFooter}
          emailBodyColor={values.emailBodyColor}
          emailText={values.emailTextColor}
        />
      </div>
    </>
  );
};

export default BrandingEmailSection;
