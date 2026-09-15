import { useEffect } from "react";

import { useGetMyAllFormsQuery } from "@/redux/apis/form.apis";
import Checkbox from "@/components/shared/Checkbox";
import { FIELD_INPUT_CLASSES } from "@/utils/fieldStyles";

const MAX_BRANDING_NAME_LENGTH = 35;

const ApplyBranding = ({
  selectedId,
  setSelectedId,
  onHome,
  setOnHome,
  brandings,
  initialFormId,
  initialBrandingId,
  initialOnHome,
}) => {
  const { data } = useGetMyAllFormsQuery();
  const isBrandingPicker = Array.isArray(brandings);
  const formOptions = Array.isArray(data?.data) ? data?.data : null;

  useEffect(() => {
    if (initialBrandingId && setSelectedId && isBrandingPicker) setSelectedId(initialBrandingId);
    if (initialFormId && setSelectedId && !isBrandingPicker) setSelectedId(initialFormId);
    if (initialOnHome !== undefined && setOnHome) setOnHome(!!initialOnHome);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFormId, initialBrandingId, initialOnHome]);

  return (
    <div>
      <div className="text-textPrimary text-base">Select where you want to apply this branding:</div>
      <div className="mt-2 flex flex-col gap-4">
        <div className="flex w-full flex-col items-start">
          <h4 className="text-textPrimary text-base font-medium lg:text-lg">
            {isBrandingPicker ? "Select Branding" : "Select Form"}
          </h4>
          <select
            value={selectedId || ""}
            className={`border-frameColor ${FIELD_INPUT_CLASSES}`}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Choose an option</option>
            {isBrandingPicker
              ? brandings?.map((option, index) => (
                  <option key={index} value={option?._id}>
                    {option?.name?.length > MAX_BRANDING_NAME_LENGTH
                      ? `${option?.name?.slice(0, MAX_BRANDING_NAME_LENGTH)}...`
                      : option?.name}
                  </option>
                ))
              : formOptions?.map((option, index) => (
                  <option key={index} value={option?._id}>
                    {option?.name}
                  </option>
                ))}
          </select>
        </div>
        {setOnHome && (
          <div>
            <Checkbox
              id="onHome"
              name="onHome"
              label="For Website"
              onChange={(e) => setOnHome(e.target.checked)}
              value={onHome}
              checked={!!onHome}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyBranding;
