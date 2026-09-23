import { Autocomplete } from "@react-google-maps/api";
import { SimpleRadioInputType } from "@/components/global/DynamicField";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { STATE_SUGGESTIONS } from "@/constants";
import {
  OWNER_ADDRESS_AUTOCOMPLETE_OPTIONS,
  OWNER_HAVE_DETAIL_OPTIONS,
  OWNER_ROLE_FIELD,
  OWNER_ROLES,
  YES_NO,
} from "../utils/applicant.constants";

const HAVE_DETAIL_FIELD = {
  label: (
    <span className="inline-flex items-center gap-1">
      Do you have full information for this person?
      <span className="group relative inline-flex items-center">
        <span className="cursor-help text-sm text-gray-400">ⓘ</span>
        <span className="invisible absolute left-5 top-0 z-50 w-72 rounded bg-gray-800 p-2 text-xs font-normal text-white shadow-lg group-hover:visible">
          "Full information" includes: Social Security, Tax, or National ID number · Home address · Date of birth ·
          Ownership percentage · Government-issued ID number and issuer
        </span>
      </span>
    </span>
  ),
  name: "have_detail",
  options: OWNER_HAVE_DETAIL_OPTIONS,
  required: true,
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
  const role = getValue("role");
  const haveDetail = getValue("have_detail");
  const percentage = String(getValue("percentage"));
  const handleChange = (key) => (e) => onChange?.(key, e.target.value, index);

  // keep the percentage between 0 and 100 with a trailing %
  const handlePercentageChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    if (raw === "" || raw === ".") {
      onChange?.("percentage", raw, index);
      return;
    }
    const num = Math.min(100, Math.max(0, parseFloat(raw) || 0));
    onChange?.("percentage", raw.endsWith(".") ? `${num}.` : `${num}%`, index);
  };

  return (
    <div className="mt-3 flex min-w-full flex-col items-center justify-between gap-4 border-2 border-[#066969] p-4 md:flex-row">
      <div className="wrap flex w-full min-w-100 flex-col gap-3">
        <div className="relative flex w-full gap-4">
          <TextField
            label="Owner or primary operator name"
            name="name"
            required
            placeholder="First name, middle name (optional), last name"
            value={getValue("name")}
            onChange={handleChange("name")}
            suggestions={suggestions}
          />
          <TextField
            name="email"
            label="Email Address"
            type="email"
            placeholder="e.g. john.doe@email.com"
            value={getValue("email")}
            required
            onChange={handleChange("email")}
          />
          <TextField
            name="phone"
            label="Phone Number"
            formatting="3,3,4"
            type="text"
            placeholder="e.g. 555-867-5309"
            value={getValue("phone")}
            onChange={handleChange("phone")}
            className="max-w-[30%] min-w-100"
          />
        </div>

        <div className="flex w-full gap-4">
          <SimpleRadioInputType
            field={OWNER_ROLE_FIELD}
            groupName={`role_${rowKey}`}
            form={{ role }}
            onChange={handleChange("role")}
          />
          <SimpleRadioInputType
            field={HAVE_DETAIL_FIELD}
            groupName={`have_detail_${rowKey}`}
            form={{ have_detail: haveDetail }}
            onChange={handleChange("have_detail")}
          />
        </div>

        {(role === OWNER_ROLES.PRIMARY_OPERATOR || role === OWNER_ROLES.BOTH) && (
          <div className="flex w-full gap-4">
            <TextField
              name="job_title"
              label="Job Title"
              value={getValue("job_title")}
              onChange={handleChange("job_title")}
            />
          </div>
        )}

        {haveDetail === YES_NO.YES && (
          <div className="flex w-full flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <TextField
                name="ssn"
                label="Social Security, Tax, or National ID Number"
                placeholder="e.g. 123-45-6789"
                value={getValue("ssn")}
                formatting="3,2,4"
                isMasked={true}
                onChange={handleChange("ssn")}
                className="w-full"
              />
              <Autocomplete
                onLoad={onPlaceLoad}
                onPlaceChanged={onPlaceChanged}
                options={OWNER_ADDRESS_AUTOCOMPLETE_OPTIONS}
                className="w-full"
              >
                <TextField
                  name="address"
                  label="Address"
                  value={getValue("address")}
                  onChange={handleChange("address")}
                  className="w-full!"
                />
              </Autocomplete>
              <TextField
                name="percentage"
                label="Ownership Percentage"
                placeholder="e.g. 25"
                value={percentage.replace(/%$/, "")}
                rightIcon={<span className="select-none font-medium text-gray-600">%</span>}
                onChange={handlePercentageChange}
                className="w-full"
              />
              <TextField
                name="date_of_birth"
                type="date"
                label="Date of Birth"
                value={getValue("date_of_birth")}
                onChange={handleChange("date_of_birth")}
                className="w-full"
              />
              <TextField
                name="id_issuer"
                label="ID Issuer"
                placeholder="State/Province or Country"
                value={getValue("id_issuer")}
                onChange={handleChange("id_issuer")}
                suggestions={STATE_SUGGESTIONS}
                className="w-full"
              />
              <TextField
                name="id_number"
                label="ID Number"
                placeholder="As it appears on your ID"
                value={getValue("id_number")}
                onChange={handleChange("id_number")}
                className="w-full"
              />
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
