// ai chat preview of an application form

import {
  COMPANY_LOOKUP_FIELDS,
  FIELD_TYPES,
  FORM_BLOCK_TYPE,
  ID_DETAIL_FIELDS,
  NAICS_FIELD,
  OWNER_CARD_FIELDS,
  ROLE_FILLING_FIELD,
  SECTION_TITLES,
} from "@/constants";

// same lists the pages render
const COMPANY_LOOKUP_PREVIEW_FIELDS = Object.values(COMPANY_LOOKUP_FIELDS);
const ID_DETAILS_PREVIEW_FIELDS = [...ID_DETAIL_FIELDS, ROLE_FILLING_FIELD];
const OWNER_CARD_PREVIEW_FIELDS = Object.values(OWNER_CARD_FIELDS);

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

const WIDE_FIELD_TYPES = [FIELD_TYPES.TEXTAREA, FIELD_TYPES.RADIO, FORM_BLOCK_TYPE];

const BADGES = {
  SYSTEM_STEP: "System Step",
  SIGNATURE: "Signature",
  SECTION: "Section",
  BLOCK: "Block",
  HIDDEN: "Hidden — Underwriting",
};

// ── Field mockup ──────────────────────────────────────────────────────────────

const FieldMockup = ({ field }) => {
  const { label, type, required, placeholder, options, conditional_fields, displayText, isDisplayText } = field;
  // page labels may include *
  const showRequiredMark = required && !String(label).trimEnd().endsWith("*");

  let input;
  switch (type) {
    case FIELD_TYPES.TEXTAREA:
      input = (
        <div className="h-14 w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-[10px] text-gray-400 leading-relaxed">
          {placeholder || "Enter text…"}
        </div>
      );
      break;
    case FIELD_TYPES.SELECT:
      input = (
        <div className="flex h-7 w-full items-center justify-between rounded border border-gray-200 bg-gray-50 px-2 text-[10px] text-gray-400">
          <span>{options?.[0]?.label || "Select an option"}</span>
          <span className="text-gray-300">▾</span>
        </div>
      );
      break;
    case FIELD_TYPES.RADIO:
      input = (
        <div className="flex flex-wrap gap-3 pt-0.5">
          {(options?.length ? options : [{ label: "Yes" }, { label: "No" }]).map((o, i) => (
            <label key={i} className="flex items-center gap-1 text-[10px] text-gray-500 cursor-default">
              <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white" />
              {o.label}
            </label>
          ))}
        </div>
      );
      break;
    case FIELD_TYPES.CHECKBOX:
      return (
        <div className="flex flex-col gap-1">
          {(isDisplayText || displayText) && displayText && (
            <p className="text-[10px] text-blue-600 italic border-l-2 border-blue-200 pl-1.5 mb-0.5">{displayText}</p>
          )}
          <label className="flex items-start gap-1.5 text-[10px] text-gray-600 cursor-default">
            <span className="mt-0.5 inline-flex h-3 w-3 shrink-0 items-center justify-center rounded border border-gray-300 bg-white" />
            <span>
              {label}
              {showRequiredMark && <span className="text-red-400 ml-0.5">*</span>}
            </span>
          </label>
          {conditional_fields?.length > 0 && (
            <div className="ml-4 mt-1 flex gap-2">
              {conditional_fields.map((cf, i) => (
                <div key={i} className="flex flex-col gap-0.5 flex-1">
                  <span className="text-[9px] text-gray-400">{cf.label}</span>
                  <div className="h-6 w-full rounded border border-gray-200 bg-gray-50 px-1.5 text-[10px] text-gray-400 flex items-center">
                    0
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case FIELD_TYPES.DATE:
      input = (
        <div className="flex h-7 w-full items-center rounded border border-gray-200 bg-gray-50 px-2 text-[10px] text-gray-400">
          MM / DD / YYYY
        </div>
      );
      break;
    case FIELD_TYPES.FILE:
      input = (
        <div className="flex h-7 items-center gap-1.5 rounded border border-dashed border-gray-300 bg-gray-50 px-2 text-[10px] text-gray-400">
          <span>📎</span> Choose file…
        </div>
      );
      break;
    case FIELD_TYPES.RANGE:
      input = (
        <div className="flex flex-col gap-0.5">
          <input type="range" className="w-full h-1.5 cursor-default" disabled defaultValue={50} />
          <div className="flex justify-between text-[9px] text-gray-400">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      );
      break;
    case FIELD_TYPES.NUMBER:
      input = (
        <div className="flex h-7 w-full items-center rounded border border-gray-200 bg-gray-50 px-2 text-[10px] text-gray-400">
          {placeholder || "0"}
        </div>
      );
      break;
    case FORM_BLOCK_TYPE:
      return (
        <div className="rounded border border-dashed border-blue-200 bg-blue-50/40 p-2">
          <p className="mb-1.5 text-[10px] font-semibold text-blue-600">{label} — one card per owner</p>
          <FieldGrid fields={OWNER_CARD_PREVIEW_FIELDS} />
        </div>
      );
    default:
      input = (
        <div className="flex h-7 w-full items-center rounded border border-gray-200 bg-gray-50 px-2 text-[10px] text-gray-400">
          {placeholder || "Enter text…"}
        </div>
      );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {(isDisplayText || displayText) && displayText && (
        <p className="text-[10px] text-blue-600 italic border-l-2 border-blue-200 pl-1.5 mb-0.5">{displayText}</p>
      )}
      <label className="text-[10px] font-medium text-gray-600">
        {label}
        {showRequiredMark && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {input}
    </div>
  );
};

// ── Section renderers ─────────────────────────────────────────────────────────

const FieldGrid = ({ fields = [] }) => (
  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
    {fields.map((f, i) => (
      <div key={i} className={WIDE_FIELD_TYPES.includes(f.type) ? "col-span-2" : ""}>
        <FieldMockup field={f} />
      </div>
    ))}
  </div>
);

const SignatureMockup = () => (
  <div className="mt-2 rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-center">
    <p className="text-[10px] text-gray-400 mb-2">Applicant signature</p>
    <div className="h-10 w-full rounded border border-gray-200 bg-white" />
  </div>
);

const AgreementSection = ({ section = {} }) => (
  <SectionCard section={section} badge={BADGES.SIGNATURE}>
    {section.displayText && <p className="mb-2 text-[10px] text-gray-500 italic">{section.displayText}</p>}
    {section.signDisplayText && <p className="mb-2 text-[10px] text-gray-600">{section.signDisplayText}</p>}
    <SignatureMockup />
  </SectionCard>
);

const StandardSection = ({ section = {} }) => {
  const fields = [...(section.fields ?? []), ...(SECTION_EXTRA_FIELDS[section.sectionTitle] ?? [])];
  return (
    <SectionCard
      section={section}
      badge={section.isHidden ? BADGES.HIDDEN : section.isBlock ? BADGES.BLOCK : BADGES.SECTION}
    >
      {section.displayText && <p className="mb-2 text-[10px] text-gray-500 italic">{section.displayText}</p>}
      {fields.length > 0 ? (
        <FieldGrid fields={fields} />
      ) : (
        <p className="text-[10px] text-gray-400 italic">No custom fields</p>
      )}
      {section.isSignature && <SignatureMockup />}
    </SectionCard>
  );
};

// ── Section card wrapper ──────────────────────────────────────────────────────

const SectionCard = ({ section, badge, children }) => (
  <div
    className={`rounded-lg border ${section.isHidden ? "border-gray-200 bg-gray-50 opacity-60" : "border-gray-200 bg-white"} overflow-hidden`}
  >
    <div
      className={`flex items-center justify-between px-3 py-1.5 ${section.isHidden ? "bg-gray-100" : "bg-indigo-50"}`}
    >
      <span className="text-[11px] font-semibold text-gray-700">{section.sectionName}</span>
      <span
        className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${
          section.isHidden
            ? "bg-gray-200 text-gray-500"
            : badge === BADGES.SYSTEM_STEP
              ? "bg-blue-100 text-blue-600"
              : badge === BADGES.SIGNATURE
                ? "bg-purple-100 text-purple-600"
                : "bg-indigo-100 text-indigo-600"
        }`}
      >
        {badge}
      </span>
    </div>
    <div className="px-3 py-2">{children}</div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const FormPreview = ({ formName = "", sections = [] }) => {
  const idSection = sections.find((section) => section.sectionTitle === SECTION_TITLES.ID_VERIFICATION);
  const stepperSections = sections.filter((section) => !SYSTEM_SECTION_TITLES.includes(section.sectionTitle));

  return (
    <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">Form Preview</p>
        <p className="text-[10px] text-gray-500 font-medium">{formName}</p>
      </div>
      <div className="flex flex-col gap-2">
        {/* Company lookup */}
        <SectionCard section={{ sectionName: "Company Lookup" }} badge={BADGES.SYSTEM_STEP}>
          <FieldGrid fields={COMPANY_LOOKUP_PREVIEW_FIELDS} />
        </SectionCard>

        {/* ID verification QR */}
        <SectionCard section={{ sectionName: idSection?.sectionName || "ID Verification" }} badge={BADGES.SYSTEM_STEP}>
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
        </SectionCard>

        {/* ID details */}
        <SectionCard section={{ sectionName: "Primary Applicant Information" }} badge={BADGES.SYSTEM_STEP}>
          <FieldGrid fields={ID_DETAILS_PREVIEW_FIELDS} />
          <SignatureMockup />
        </SectionCard>

        {/* Form sections */}
        {stepperSections.map((section, i) =>
          section.sectionTitle === SECTION_TITLES.AGREEMENT ? (
            <AgreementSection key={i} section={section} />
          ) : (
            <StandardSection key={i} section={section} />
          ),
        )}
      </div>
      <p className="mt-2 text-[9px] text-gray-400 text-center">
        Visual approximation — actual styling reflects the applied branding
      </p>
    </div>
  );
};

export default FormPreview;
