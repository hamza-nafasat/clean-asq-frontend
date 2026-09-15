import { Autocomplete } from "@react-google-maps/api";

import TextField from "@/components/shared/TextField";
import { FIELD_FORMATS, FIELD_TYPES, STATE_SUGGESTIONS } from "@/constants";
import { formatOwnershipPercentage, getOwnerValue } from "@/utils/companyOwners";

const ADDRESS_AUTOCOMPLETE_OPTIONS = { types: ["address"], fields: ["formatted_address"] };

const ApplicationPdfOwnerDetails = ({ owner = {}, index, rowKey, isDisabled = false, onValueChange, onAddressLoad, onAddressPlaceChanged }) => {
  const percentage = String(getOwnerValue(owner, "percentage"));
  const handleChange = (key) => (e) => onValueChange?.(key, e.target.value, index);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <TextField
          name="ssn"
          disabled={isDisabled}
          label="Social Security, Tax, or National ID Number"
          placeholder="e.g. 123-45-6789"
          value={getOwnerValue(owner, "ssn")}
          formatting={FIELD_FORMATS.SSN}
          isMasked={false}
          onChange={handleChange("ssn")}
          className="w-full"
        />

        <Autocomplete
          onLoad={onAddressLoad?.(rowKey)}
          onPlaceChanged={onAddressPlaceChanged?.(rowKey, index)}
          options={ADDRESS_AUTOCOMPLETE_OPTIONS}
          className="w-full"
        >
          <TextField
            name="address"
            disabled={isDisabled}
            label="Address"
            value={getOwnerValue(owner, "address")}
            onChange={handleChange("address")}
            className="w-full!"
          />
        </Autocomplete>

        <TextField
          name="percentage"
          disabled={isDisabled}
          label="Ownership Percentage"
          placeholder="e.g. 25"
          value={percentage.replace(/%$/, "")}
          rightIcon={<span className="select-none font-medium text-gray-600">%</span>}
          onChange={(e) => onValueChange?.("percentage", formatOwnershipPercentage(e.target.value), index)}
          className="w-full"
        />

        <TextField
          name="date_of_birth"
          type={FIELD_TYPES.DATE}
          disabled={isDisabled}
          label="Date of Birth"
          value={getOwnerValue(owner, "date_of_birth")}
          onChange={handleChange("date_of_birth")}
          className="w-full"
        />

        <TextField
          name="id_issuer"
          disabled={isDisabled}
          label="ID Issuer"
          placeholder="State/Province or Country"
          value={getOwnerValue(owner, "id_issuer") || getOwnerValue(owner, "driver_license_issuer_state")}
          onChange={handleChange("id_issuer")}
          suggestions={STATE_SUGGESTIONS}
          className="w-full"
        />

        <TextField
          name="id_number"
          disabled={isDisabled}
          label="ID Number"
          placeholder="As it appears on your ID"
          value={getOwnerValue(owner, "id_number") || getOwnerValue(owner, "driver_license_number")}
          onChange={handleChange("id_number")}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ApplicationPdfOwnerDetails;
