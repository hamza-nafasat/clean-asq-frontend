import ApplicationPdfOwnerDetails from "@/components/global/ApplicationPdfOwnerDetails";
import SimpleRadioInputType from "@/components/global/SimpleRadioInputType";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { FIELD_FORMATS, OWNER_ROLES, YES_NO_VALUES } from "@/constants";
import { getOwnerValue, HAVE_DETAIL_OPTIONS, OWNER_ROLE_OPTIONS } from "@/utils/companyOwners";

const ROLE_FIELD = { label: "Role", name: "role", options: OWNER_ROLE_OPTIONS, required: true };

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
  options: HAVE_DETAIL_OPTIONS,
  required: true,
};

const OPERATOR_ROLES = [OWNER_ROLES.PRIMARY_OPERATOR, OWNER_ROLES.BOTH];

const ApplicationPdfOwnerCard = ({
  owner = {},
  index,
  rowKey,
  isDisabled = false,
  nameSuggestions = [],
  onValueChange,
  onRemove,
  onAddressLoad,
  onAddressPlaceChanged,
}) => {
  const role = getOwnerValue(owner, "role");
  const haveDetail = getOwnerValue(owner, "have_detail");
  const handleChange = (key) => (e) => onValueChange?.(key, e.target.value, index);

  return (
    <div className="mt-3 flex min-w-full flex-col items-center justify-between gap-4 border-2 border-[#066969] p-4 md:flex-row">
      <div className="wrap flex w-full min-w-100 flex-col gap-3">
        <div className="relative flex w-full gap-4">
          <TextField
            disabled={isDisabled}
            label="Owner or primary operator name"
            name="name"
            placeholder="First name, middle name (optional), last name"
            value={getOwnerValue(owner, "name")}
            onChange={handleChange("name")}
          />
          {nameSuggestions.length > 0 && (
            <ul className="absolute top-20 z-40 mt-1 w-full max-w-100 rounded border bg-white shadow">
              {nameSuggestions.map((suggestion, i) => (
                <li
                  key={i}
                  onClick={() => onValueChange?.("name", suggestion, index, true)}
                  className="cursor-pointer px-2 py-1 hover:bg-gray-200"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
          <TextField
            name="email"
            disabled={isDisabled}
            label="Email Address"
            type="email"
            placeholder="e.g. john.doe@email.com"
            value={getOwnerValue(owner, "email")}
            required
            onChange={handleChange("email")}
          />
          <TextField
            name="phone"
            disabled={isDisabled}
            label="Phone Number"
            formatting={FIELD_FORMATS.PHONE}
            type="text"
            placeholder="e.g. 555-867-5309"
            value={getOwnerValue(owner, "phone")}
            onChange={handleChange("phone")}
            className="max-w-[30%] min-w-100"
          />
        </div>

        <div className="flex w-full gap-4">
          <SimpleRadioInputType
            field={ROLE_FIELD}
            groupName={`role_${rowKey}`}
            form={{ role }}
            disabled={isDisabled}
            onChange={handleChange("role")}
          />
          <SimpleRadioInputType
            field={HAVE_DETAIL_FIELD}
            groupName={`have_detail_${rowKey}`}
            form={{ have_detail: haveDetail }}
            disabled={isDisabled}
            onChange={handleChange("have_detail")}
          />
        </div>

        {OPERATOR_ROLES.includes(role) && (
          <div className="flex w-full gap-4">
            <TextField
              name="job_title"
              disabled={isDisabled}
              label="Job Title"
              value={getOwnerValue(owner, "job_title")}
              onChange={handleChange("job_title")}
            />
          </div>
        )}

        {haveDetail === YES_NO_VALUES.YES && (
          <ApplicationPdfOwnerDetails
            owner={owner}
            index={index}
            rowKey={rowKey}
            isDisabled={isDisabled}
            onValueChange={onValueChange}
            onAddressLoad={onAddressLoad}
            onAddressPlaceChanged={onAddressPlaceChanged}
          />
        )}

        {!isDisabled && (
          <Button
            onClick={() => onRemove?.(index)}
            className="max-w-fit! self-end py-2.5!"
            variant="secondary"
            label="Remove"
          />
        )}
      </div>
    </div>
  );
};

export default ApplicationPdfOwnerCard;
