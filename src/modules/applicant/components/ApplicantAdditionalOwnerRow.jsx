import { Autocomplete } from "@react-google-maps/api";
import { SimpleRadioInputType } from "@/components/global/DynamicField";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { OWNER_CARD_FIELDS, STATE_SUGGESTIONS } from "@/constants";
import { OWNER_ADDRESS_AUTOCOMPLETE_OPTIONS, OWNER_ROLES, YES_NO } from "../utils/applicant.constants";

const HAVE_DETAIL_FIELD = {
  ...OWNER_CARD_FIELDS.HAVE_DETAIL,
  label: (
    <span className="inline-flex items-center gap-1">
      {OWNER_CARD_FIELDS.HAVE_DETAIL.label}
      <span className="group relative inline-flex items-center">
        <span className="cursor-help text-sm text-gray-400">ⓘ</span>
        <span className="invisible absolute left-5 top-0 z-50 w-72 rounded bg-gray-800 p-2 text-xs font-normal text-white shadow-lg group-hover:visible">
          "Full information" includes: Social Security, Tax, or National ID number · Home address · Date of birth ·
          Ownership percentage · Government-issued ID number and issuer
        </span>
      </span>
    </span>
  ),
};

const ApplicantAdditionalOwnerRow = ({
  owner = {},
  index = 0,
  rowKey = "",
  suggestions = [],
  onChange,
  onPlaceLoad,
  onPlaceChanged,
  onSave,
  onRemove,
}) => {
  const getValue = (key) => owner?.[key] ?? "";
  const handleChange = (key) => (e) => onChange?.(key, e.target.value, index);
  // shared field with value and handler
  const bindField = (field) => ({ ...field, value: getValue(field.name), onChange: handleChange(field.name) });
  const role = getValue(OWNER_CARD_FIELDS.ROLE.name);
  const haveDetail = getValue(OWNER_CARD_FIELDS.HAVE_DETAIL.name);
  const percentage = String(getValue(OWNER_CARD_FIELDS.PERCENTAGE.name));

  // keep the percentage between 0 and 100 with a trailing %
  const handlePercentageChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    if (raw === "" || raw === ".") {
      onChange?.(OWNER_CARD_FIELDS.PERCENTAGE.name, raw, index);
      return;
    }
    const num = Math.min(100, Math.max(0, parseFloat(raw) || 0));
    onChange?.(OWNER_CARD_FIELDS.PERCENTAGE.name, raw.endsWith(".") ? `${num}.` : `${num}%`, index);
  };

  return (
    <div className="mt-3 flex min-w-full flex-col items-center justify-between gap-4 border-2 border-[#066969] p-4 md:flex-row">
      <div className="wrap flex w-full min-w-100 flex-col gap-3">
        <div className="relative flex w-full gap-4">
          <TextField {...bindField(OWNER_CARD_FIELDS.NAME)} suggestions={suggestions} />
          <TextField {...bindField(OWNER_CARD_FIELDS.EMAIL)} />
          <TextField {...bindField(OWNER_CARD_FIELDS.PHONE)} className="max-w-[30%] min-w-100" />
        </div>

        <div className="flex w-full gap-4">
          <SimpleRadioInputType
            field={OWNER_CARD_FIELDS.ROLE}
            groupName={`role_${rowKey}`}
            form={{ [OWNER_CARD_FIELDS.ROLE.name]: role }}
            onChange={handleChange(OWNER_CARD_FIELDS.ROLE.name)}
          />
          <SimpleRadioInputType
            field={HAVE_DETAIL_FIELD}
            groupName={`have_detail_${rowKey}`}
            form={{ [HAVE_DETAIL_FIELD.name]: haveDetail }}
            onChange={handleChange(HAVE_DETAIL_FIELD.name)}
          />
        </div>

        {(role === OWNER_ROLES.PRIMARY_OPERATOR || role === OWNER_ROLES.BOTH) && (
          <div className="flex w-full gap-4">
            <TextField {...bindField(OWNER_CARD_FIELDS.JOB_TITLE)} />
          </div>
        )}

        {haveDetail === YES_NO.YES && (
          <div className="flex w-full flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <TextField {...bindField(OWNER_CARD_FIELDS.SSN)} isMasked={true} className="w-full" />
              <Autocomplete
                onLoad={onPlaceLoad}
                onPlaceChanged={onPlaceChanged}
                options={OWNER_ADDRESS_AUTOCOMPLETE_OPTIONS}
                className="w-full"
              >
                <TextField {...bindField(OWNER_CARD_FIELDS.ADDRESS)} className="w-full!" />
              </Autocomplete>
              <TextField
                {...OWNER_CARD_FIELDS.PERCENTAGE}
                value={percentage.replace(/%$/, "")}
                rightIcon={<span className="select-none font-medium text-gray-600">%</span>}
                onChange={handlePercentageChange}
                className="w-full"
              />
              <TextField {...bindField(OWNER_CARD_FIELDS.DATE_OF_BIRTH)} className="w-full" />
              <TextField {...bindField(OWNER_CARD_FIELDS.ID_ISSUER)} suggestions={STATE_SUGGESTIONS} className="w-full" />
              <TextField {...bindField(OWNER_CARD_FIELDS.ID_NUMBER)} className="w-full" />
            </div>
          </div>
        )}

        <div className="flex gap-2 self-end">
          <Button onClick={onSave} className="max-w-fit! py-2.5!" label="Save Owner" />
          <Button
            onClick={() => onRemove?.(index)}
            className="max-w-fit! py-2.5!"
            variant="secondary"
            label="Remove"
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicantAdditionalOwnerRow;
