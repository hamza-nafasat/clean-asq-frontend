import ApplicationPdfCheckboxInputType from "@/components/global/ApplicationPdfCheckboxInputType";
import ApplicationPdfFileInputType from "@/components/global/ApplicationPdfFileInputType";
import ApplicationPdfMultiCheckboxInputType from "@/components/global/ApplicationPdfMultiCheckboxInputType";
import ApplicationPdfOtherInputType from "@/components/global/ApplicationPdfOtherInputType";
import ApplicationPdfRadioInputType from "@/components/global/ApplicationPdfRadioInputType";
import ApplicationPdfRangeInputType from "@/components/global/ApplicationPdfRangeInputType";
import ApplicationPdfSelectInputType from "@/components/global/ApplicationPdfSelectInputType";
import { FIELD_TYPES } from "@/constants";

const FIELD_COMPONENTS = {
  [FIELD_TYPES.SELECT]: ApplicationPdfSelectInputType,
  [FIELD_TYPES.MULTI_CHECKBOX]: ApplicationPdfMultiCheckboxInputType,
  [FIELD_TYPES.RADIO]: ApplicationPdfRadioInputType,
  [FIELD_TYPES.FILE]: ApplicationPdfFileInputType,
  [FIELD_TYPES.RANGE]: ApplicationPdfRangeInputType,
  [FIELD_TYPES.CHECKBOX]: ApplicationPdfCheckboxInputType,
};

const ApplicationPdfField = ({ field = {}, form, setForm, sectionKey, className = "", wrapperClassName = "mt-4" }) => {
  const FieldComponent = FIELD_COMPONENTS[field.type] ?? ApplicationPdfOtherInputType;

  return (
    <div className={wrapperClassName}>
      <FieldComponent field={field} form={form} setForm={setForm} sectionKey={sectionKey} className={className} />
    </div>
  );
};

export default ApplicationPdfField;
