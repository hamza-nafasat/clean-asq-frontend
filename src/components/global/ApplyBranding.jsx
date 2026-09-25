import { useEffect } from "react";
import { useGetMyAllFormsQuery } from "@/redux/apis/form.apis";
import { FiFileText, FiGlobe, FiLayers } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { FIELD_INPUT_CLASSES } from "@/utils/fieldStyles";

const MAX_BRANDING_NAME_LENGTH = 35;
const TARGET_SELECT_ID = "apply-branding-target";
const WEBSITE_CHECKBOX_ID = "apply-branding-website";

const OptionIcon = ({ children }) => (
  <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
    {children}
  </span>
);

const truncateName = (name = "") =>
  name.length > MAX_BRANDING_NAME_LENGTH ? `${name.slice(0, MAX_BRANDING_NAME_LENGTH)}...` : name;

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
  const options = isBrandingPicker ? brandings : (data?.data ?? []);

  useEffect(() => {
    if (initialBrandingId && setSelectedId && isBrandingPicker) setSelectedId(initialBrandingId);
    if (initialFormId && setSelectedId && !isBrandingPicker) setSelectedId(initialFormId);
    if (initialOnHome !== undefined && setOnHome) setOnHome(!!initialOnHome);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFormId, initialBrandingId, initialOnHome]);

  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        Choose where this branding should appear. You can pick one or both options.
      </p>

      <div className="border-cardBorder rounded-xl border p-4">
        <label htmlFor={TARGET_SELECT_ID} className="flex items-center gap-3">
          <OptionIcon>{isBrandingPicker ? <FiLayers size={18} /> : <FiFileText size={18} />}</OptionIcon>
          <span className="min-w-0">
            <span className="text-textPrimary block text-sm font-semibold">
              {isBrandingPicker ? "Branding" : "Application form"}
            </span>
            <span className="block text-xs text-gray-500">
              {isBrandingPicker
                ? "Pick the branding applicants of this form will see."
                : "Applicants filling this form will see this branding."}
            </span>
          </span>
        </label>
        <select
          id={TARGET_SELECT_ID}
          value={selectedId || ""}
          className={cn("border-frameColor mt-3", FIELD_INPUT_CLASSES)}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">{isBrandingPicker ? "Select a branding" : "Select a form"}</option>
          {options.map((option) => (
            <option key={option?._id} value={option?._id}>
              {isBrandingPicker ? truncateName(option?.name) : option?.name}
            </option>
          ))}
        </select>
      </div>

      {setOnHome && (
        <label
          htmlFor={WEBSITE_CHECKBOX_ID}
          className={cn(
            "border-cardBorder flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors hover:border-gray-300",
            onHome && "border-primary bg-primary/5 hover:border-primary",
          )}
        >
          <OptionIcon>
            <FiGlobe size={18} />
          </OptionIcon>
          <span className="min-w-0 flex-1">
            <span className="text-textPrimary block text-sm font-semibold">Website</span>
            <span className="block text-xs text-gray-500">
              Make this the default branding for your website and dashboard.
            </span>
          </span>
          <input
            id={WEBSITE_CHECKBOX_ID}
            type="checkbox"
            checked={!!onHome}
            onChange={(e) => setOnHome(e.target.checked)}
            className="accent-primary size-5 shrink-0 cursor-pointer"
          />
        </label>
      )}
    </section>
  );
};

export default ApplyBranding;
