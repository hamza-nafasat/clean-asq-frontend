import Checkbox from "@/components/shared/small/Checkbox";
import { useGetMyAllFormsQuery } from "@/redux/apis/formApis";
import { useEffect } from "react";

function ApplyBranding({
  selectedId,
  setSelectedId,
  onHome,
  setOnHome,
  brandings,
  initialFormId,
  initialBrandingId,
  initialOnHome,
}) {
  const { data } = useGetMyAllFormsQuery();
  const isBrandingPicker = Array.isArray(brandings);

  useEffect(() => {
    if (initialBrandingId && setSelectedId && isBrandingPicker) {
      setSelectedId(initialBrandingId);
    }
    if (initialFormId && setSelectedId && !isBrandingPicker) {
      setSelectedId(initialFormId);
    }
    if (initialOnHome !== undefined && setOnHome) {
      setOnHome(!!initialOnHome);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFormId, initialBrandingId, initialOnHome]);

  return (
    <div>
      <div className="text-textPrimary text-base">Select where you want to apply this branding:</div>
      <div className="mt-2 flex flex-col gap-4">
        <div className={`flex w-full flex-col items-start`}>
          <h4 className="text-textPrimary text-base font-medium lg:text-lg">
            {isBrandingPicker ? "Select Branding" : "Select Form"}
          </h4>
          <select
            value={selectedId || ""}
            className="border-frameColor h-11.25 w-full rounded-lg border bg-[#FAFBFF] px-4 text-sm text-gray-600 outline-none md:h-12.5  md:text-base"
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Choose an option</option>
            {isBrandingPicker
              ? brandings?.map((option, index) => (
                  <option key={index} value={option?._id}>
                    {option?.name?.length > 35 ? `${option?.name?.slice(0, 35)}...` : option?.name}
                  </option>
                ))
              : Array.isArray(data?.data)
                ? data?.data?.map((option, index) => (
                    <option key={index} value={option?._id}>
                      {option?.name}
                    </option>
                  ))
                : null}
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
}

export default ApplyBranding;
