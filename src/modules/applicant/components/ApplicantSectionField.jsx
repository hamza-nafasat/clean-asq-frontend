import {
  CheckboxInputType,
  FileInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from "@/components/global/DynamicField";
import { FIELD_TYPES } from "@/constants";

const FIELD_INPUTS = {
  [FIELD_TYPES.SELECT]: SelectInputType,
  [FIELD_TYPES.MULTI_CHECKBOX]: MultiCheckboxInputType,
  [FIELD_TYPES.FILE]: FileInputType,
  [FIELD_TYPES.RADIO]: RadioInputType,
  [FIELD_TYPES.RANGE]: RangeInputType,
  [FIELD_TYPES.CHECKBOX]: CheckboxInputType,
};

const ApplicantSectionField = ({ field = {}, form = {}, setForm, className = "mt-4", radioClassName = "" }) => {
  const FieldInput = FIELD_INPUTS[field.type] ?? OtherInputType;
  const wrapperClassName = field.type === FIELD_TYPES.RADIO && radioClassName ? radioClassName : className;

  return (
    <div className={wrapperClassName}>
      <FieldInput field={field} placeholder={field.placeholder} form={form} setForm={setForm} className="" />
    </div>
  );
};

export default ApplicantSectionField;
