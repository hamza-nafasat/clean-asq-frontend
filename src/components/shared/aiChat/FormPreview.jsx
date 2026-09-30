// ai chat preview of an application form

import FormPreviewFieldGrid from "./components/FormPreviewFieldGrid.jsx";
import FormPreviewSectionCard from "./components/FormPreviewSectionCard.jsx";
import { COMPANY_LOOKUP_FIELDS, ID_DETAIL_FIELDS, NAICS_FIELD, ROLE_FILLING_FIELD, SECTION_TITLES } from "@/constants";
import { FORM_PREVIEW_BADGES } from "./utils/aiChat.constants.js";

// same lists the pages render
const COMPANY_LOOKUP_PREVIEW_FIELDS = Object.values(COMPANY_LOOKUP_FIELDS);
const ID_DETAILS_PREVIEW_FIELDS = [...ID_DETAIL_FIELDS, ROLE_FILLING_FIELD];

// drawn by the fixed pages instead
const SYSTEM_SECTION_TITLES = [
  SECTION_TITLES.OTP,
  SECTION_TITLES.COMPANY_SCRAPING,
  SECTION_TITLES.ID_MISSION,
  SECTION_TITLES.ID_VERIFICATION,
];

// page-only fields after form fields
const SECTION_EXTRA_FIELDS = {
  [SECTION_TITLES.COMPANY_INFORMATION]: [NAICS_FIELD],
};

const SignatureMockup = () => (
  <div className="mt-2 rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-center">
    <p className="mb-2 text-[10px] text-gray-400">Applicant signature</p>
    <div className="h-10 w-full rounded border border-gray-200 bg-white" />
  </div>
);

const AgreementSection = ({ section = {} }) => (
  <FormPreviewSectionCard section={section} badge={FORM_PREVIEW_BADGES.SIGNATURE}>
    {section.displayText && <p className="mb-2 text-[10px] text-gray-500 italic">{section.displayText}</p>}
    {section.signDisplayText && <p className="mb-2 text-[10px] text-gray-600">{section.signDisplayText}</p>}
    <SignatureMockup />
  </FormPreviewSectionCard>
);

const StandardSection = ({ section = {} }) => {
  const fields = [...(section.fields ?? []), ...(SECTION_EXTRA_FIELDS[section.sectionTitle] ?? [])];
  return (
    <FormPreviewSectionCard
      section={section}
      badge={
        section.isHidden
          ? FORM_PREVIEW_BADGES.HIDDEN
          : section.isBlock
            ? FORM_PREVIEW_BADGES.BLOCK
            : FORM_PREVIEW_BADGES.SECTION
      }
    >
      {section.displayText && <p className="mb-2 text-[10px] text-gray-500 italic">{section.displayText}</p>}
      {fields.length > 0 ? (
        <FormPreviewFieldGrid fields={fields} />
      ) : (
        <p className="text-[10px] text-gray-400 italic">No custom fields</p>
      )}
      {section.isSignature && <SignatureMockup />}
    </FormPreviewSectionCard>
  );
};

const FormPreview = ({ formName = "", sections = [] }) => {
  const idSection = sections.find((section) => section.sectionTitle === SECTION_TITLES.ID_VERIFICATION);
  const stepperSections = sections.filter((section) => !SYSTEM_SECTION_TITLES.includes(section.sectionTitle));

  return (
    <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-bold tracking-wide text-indigo-700 uppercase">Form Preview</p>
        <p className="text-[10px] font-medium text-gray-500">{formName}</p>
      </div>
      <div className="flex flex-col gap-2">
        {/* Company lookup */}
        <FormPreviewSectionCard section={{ sectionName: "Company Lookup" }} badge={FORM_PREVIEW_BADGES.SYSTEM_STEP}>
          <FormPreviewFieldGrid fields={COMPANY_LOOKUP_PREVIEW_FIELDS} />
        </FormPreviewSectionCard>

        {/* ID verification QR */}
        <FormPreviewSectionCard
          section={{ sectionName: idSection?.sectionName || "ID Verification" }}
          badge={FORM_PREVIEW_BADGES.SYSTEM_STEP}
        >
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            {idSection?.displayText && <p className="text-[10px] text-gray-500 italic">{idSection.displayText}</p>}
            <p className="flex h-20 w-20 items-center justify-center rounded border border-gray-300 bg-gray-50 text-[10px] text-gray-400">
              QR code
            </p>
            <p className="flex h-7 w-36 items-center justify-center rounded bg-indigo-100 text-[10px] text-indigo-500">
              Refresh QR Code
            </p>
            <p className="flex h-7 w-36 items-center justify-center rounded border border-indigo-200 text-[10px] text-indigo-500">
              Enter ID Details Manually
            </p>
          </div>
        </FormPreviewSectionCard>

        {/* ID details */}
        <FormPreviewSectionCard
          section={{ sectionName: "Primary Applicant Information" }}
          badge={FORM_PREVIEW_BADGES.SYSTEM_STEP}
        >
          <FormPreviewFieldGrid fields={ID_DETAILS_PREVIEW_FIELDS} />
          <SignatureMockup />
        </FormPreviewSectionCard>

        {/* Form sections */}
        {stepperSections.map((section, i) =>
          section.sectionTitle === SECTION_TITLES.AGREEMENT ? (
            <AgreementSection key={i} section={section} />
          ) : (
            <StandardSection key={i} section={section} />
          ),
        )}
      </div>
      <p className="mt-2 text-center text-[9px] text-gray-400">
        Visual approximation — actual styling reflects the applied branding
      </p>
    </div>
  );
};

export default FormPreview;
