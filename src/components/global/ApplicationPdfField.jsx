import ApplicationPdfOtherInputType from "@/components/global/ApplicationPdfOtherInputType";
import CheckboxInputType from "@/components/global/CheckboxInputType";
import FileInputType from "@/components/global/FileInputType";
import MultiCheckboxInputType from "@/components/global/MultiCheckboxInputType";
import RadioInputType from "@/components/global/RadioInputType";
import RangeInputType from "@/components/global/RangeInputType";
import SelectInputType from "@/components/global/SelectInputType";
import { FIELD_TYPES } from "@/constants";

const FIELD_COMPONENTS = {
  [FIELD_TYPES.SELECT]: SelectInputType,
  [FIELD_TYPES.MULTI_CHECKBOX]: MultiCheckboxInputType,
  [FIELD_TYPES.RADIO]: RadioInputType,
  [FIELD_TYPES.FILE]: FileInputType,
  [FIELD_TYPES.RANGE]: RangeInputType,
  [FIELD_TYPES.CHECKBOX]: CheckboxInputType,
};

const ApplicationPdfField = ({ field = {}, form, setForm, sectionKey, className = "", wrapperClassName = "mt-4" }) => {
  const FieldComponent = FIELD_COMPONENTS[field.type] ?? ApplicationPdfOtherInputType;

  return (
    <div className={wrapperClassName}>
      <FieldComponent field={field} form={form} setForm={setForm} sectionKey={sectionKey} className={className} isPdf />
    </div>
  );
};

export default ApplicationPdfField;
