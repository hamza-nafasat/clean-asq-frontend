import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetMyAllFormsQuery } from "@/redux/apis/form.apis";
import { FiFileText, FiGlobe, FiLayers, FiUsers } from "react-icons/fi";
import { cn } from "@/lib/utils";
import usePermission from "@/hooks/usePermission";
import { PERMISSIONS } from "@/utils/permissions";
import MultiSelect from "@/components/shared/MultiSelect";
import { FIELD_INPUT_CLASSES } from "@/utils/fieldStyles";

const MAX_BRANDING_NAME_LENGTH = 35;
const APPLIED_LABEL = "Applied";
const TARGET_SELECT_ID = "apply-branding-target";
const WEBSITE_CHECKBOX_ID = "apply-branding-website";
const DEFAULT_CHECKBOX_ID = "apply-branding-default";

const OptionIcon = ({ children }) => (
  <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
    {children}
  </span>
);

const AppliedTag = () => (
  <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
    {APPLIED_LABEL}
  </span>
);

// branding may arrive populated or as an id
const getBrandingId = (branding) => branding?._id ?? branding;

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
  isDefault,
  setIsDefault,
  brandingId,
  selectedFormIds = [],
  setSelectedFormIds,
}) => {
  const user = useSelector((state) => state.auth.user);
  const canSetDefaultBranding = usePermission(PERMISSIONS.SET_DEFAULT_BRANDING);
  const isBrandingPicker = Array.isArray(brandings);
  const { data } = useGetMyAllFormsQuery(undefined, { skip: isBrandingPicker });
  const options = isBrandingPicker ? brandings : (data?.data ?? []);
  const isFormChecklist = Boolean(setSelectedFormIds);
  const isWebsiteApplied = Boolean(brandingId) && String(getBrandingId(user?.branding)) === String(brandingId);
  const isFormApplied = (form) => Boolean(brandingId) && String(getBrandingId(form?.branding)) === String(brandingId);

  const formOptions = options.map((form) => ({
    value: form?._id,
    label: form?.name ?? "",
    isLocked: isFormApplied(form),
    tag: isFormApplied(form) ? APPLIED_LABEL : null,
  }));

  useEffect(() => {
    if (initialBrandingId && setSelectedId && isBrandingPicker) setSelectedId(initialBrandingId);
    if (initialFormId && setSelectedId && !isBrandingPicker) setSelectedId(initialFormId);
    if (initialOnHome !== undefined && setOnHome) setOnHome(!!initialOnHome);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFormId, initialBrandingId, initialOnHome]);

  return (
    <section className="flex flex-col gap-4">
      {setOnHome && (
        <p className="text-sm text-gray-500">
          Choose where this branding should appear. You can pick one or both options.
        </p>
      )}

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
        {isFormChecklist ? (
          <MultiSelect
            id={TARGET_SELECT_ID}
            className="mt-3"
            options={formOptions}
            selected={selectedFormIds}
            onChange={setSelectedFormIds}
            placeholder="Select forms"
            searchPlaceholder="Search forms"
            emptyText="No forms found"
          />
        ) : (
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
        )}
      </div>

      {setOnHome && (
        <label
          htmlFor={WEBSITE_CHECKBOX_ID}
          className={cn(
            "border-cardBorder flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors hover:border-gray-300",
            (onHome || isWebsiteApplied) && "border-primary bg-primary/5 hover:border-primary",
            isWebsiteApplied && "cursor-default",
          )}
        >
          <OptionIcon>
            <FiGlobe size={18} />
          </OptionIcon>
          <span className="min-w-0 flex-1">
            <span className="text-textPrimary flex items-center gap-2 text-sm font-semibold">
              Website {isWebsiteApplied && <AppliedTag />}
            </span>
            <span className="block text-xs text-gray-500">
              Make this the default branding for your website and dashboard.
            </span>
          </span>
          <input
            id={WEBSITE_CHECKBOX_ID}
            type="checkbox"
            checked={isWebsiteApplied || !!onHome}
            disabled={isWebsiteApplied}
            onChange={(e) => setOnHome(e.target.checked)}
            className="accent-primary size-5 shrink-0 cursor-pointer"
          />
        </label>
      )}

      {setIsDefault && canSetDefaultBranding && (
        <label
          htmlFor={DEFAULT_CHECKBOX_ID}
          className={cn(
            "border-cardBorder flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors hover:border-gray-300",
            isDefault && "border-primary bg-primary/5 hover:border-primary",
          )}
        >
          <OptionIcon>
            <FiUsers size={18} />
          </OptionIcon>
          <span className="min-w-0 flex-1">
            <span className="text-textPrimary block text-sm font-semibold">Default for everyone</span>
            <span className="block text-xs text-gray-500">
              Accounts without their own branding will see this branding.
            </span>
          </span>
          <input
            id={DEFAULT_CHECKBOX_ID}
            type="checkbox"
            checked={!!isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="accent-primary size-5 shrink-0 cursor-pointer"
          />
        </label>
      )}
    </section>
  );
};

export default ApplyBranding;
