// Visual preview of an application form derived from a CSV structure.
// Rendered inside the AI chat when the AI calls the previewFormStructure tool.

const SYSTEM_BLOCKS = new Set([
  "otp_blk",
  "company_scraping_blk",
  "id_mission_blk",
]);

// ── Field mockup ──────────────────────────────────────────────────────────────

const FieldMockup = ({ field }) => {
  const { label, type, required, placeholder, options, conditional_fields, displayText, isDisplayText } = field;

  let input;
  switch (type) {
    case "textarea":
      input = (
        <div className="h-14 w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-[10px] text-gray-400 leading-relaxed">
          {placeholder || "Enter text…"}
        </div>
      );
      break;
    case "select":
      input = (
        <div className="flex h-7 w-full items-center justify-between rounded border border-gray-200 bg-gray-50 px-2 text-[10px] text-gray-400">
          <span>{options?.[0]?.label || "Select an option"}</span>
          <span className="text-gray-300">▾</span>
        </div>
      );
      break;
    case "radio":
      input = (
        <div className="flex flex-wrap gap-3 pt-0.5">
          {(options?.length ? options : [{ label: "Yes" }, { label: "No" }]).map((o, i) => (
            <label key={i} className="flex items-center gap-1 text-[10px] text-gray-500 cursor-default">
              <span className="inline-flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white" />
              {o.label}
            </label>
          ))}
        </div>
      );
      break;
    case "checkbox":
      return (
        <div className="flex flex-col gap-1">
          {(isDisplayText || displayText) && displayText && (
            <p className="text-[10px] text-blue-600 italic border-l-2 border-blue-200 pl-1.5 mb-0.5">{displayText}</p>
          )}
          <label className="flex items-start gap-1.5 text-[10px] text-gray-600 cursor-default">
            <span className="mt-0.5 inline-flex h-3 w-3 flex-shrink-0 items-center justify-center rounded border border-gray-300 bg-white" />
            <span>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</span>
          </label>
          {conditional_fields?.length > 0 && (
            <div className="ml-4 mt-1 flex gap-2">
              {conditional_fields.map((cf, i) => (
                <div key={i} className="flex flex-col gap-0.5 flex-1">
                  <span className="text-[9px] text-gray-400">{cf.label}</span>
                  <div className="h-6 w-full rounded border border-gray-200 bg-gray-50 px-1.5 text-[10px] text-gray-400 flex items-center">0</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case "date":
      input = (
        <div className="flex h-7 w-full items-center rounded border border-gray-200 bg-gray-50 px-2 text-[10px] text-gray-400">
          MM / DD / YYYY
        </div>
      );
      break;
    case "file":
      input = (
        <div className="flex h-7 items-center gap-1.5 rounded border border-dashed border-gray-300 bg-gray-50 px-2 text-[10px] text-gray-400">
          <span>📎</span> Choose file…
        </div>
      );
      break;
    case "range":
      input = (
        <div className="flex flex-col gap-0.5">
          <input type="range" className="w-full h-1.5 cursor-default" disabled defaultValue={50} />
          <div className="flex justify-between text-[9px] text-gray-400">
            <span>0</span><span>50</span><span>100</span>
          </div>
        </div>
      );
      break;
    case "number":
      input = (
        <div className="flex h-7 w-full items-center rounded border border-gray-200 bg-gray-50 px-2 text-[10px] text-gray-400">
          {placeholder || "0"}
        </div>
      );
      break;
    case "block":
      return (
        <div className="rounded border border-dashed border-blue-200 bg-blue-50 px-2 py-1.5 text-[10px] text-blue-500">
          + {label} (repeating block)
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
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {input}
    </div>
  );
};

// ── Section renderers ─────────────────────────────────────────────────────────

const OtpSection = ({ section }) => (
  <SectionCard section={section} badge="System Step">
    <div className="flex flex-col items-center gap-2 py-2 text-center">
      <div className="text-2xl">✉️</div>
      <p className="text-[10px] text-gray-500">A verification code will be sent to the applicant's email address.</p>
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-7 w-7 rounded border border-gray-300 bg-gray-50 text-center text-xs leading-7 text-gray-400">—</div>
        ))}
      </div>
      <div className="h-7 w-32 rounded bg-indigo-100 text-[10px] text-indigo-500 flex items-center justify-center">Verify Code</div>
    </div>
  </SectionCard>
);

const CompanyScrapingSection = ({ section }) => (
  <SectionCard section={section} badge="System Step">
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium text-gray-600">Company Name <span className="text-red-400">*</span></label>
        <div className="flex h-7 w-full items-center rounded border border-gray-200 bg-gray-50 px-2 text-[10px] text-gray-400">e.g. Acme Corp</div>
      </div>
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium text-gray-600">Company Website <span className="text-red-400">*</span></label>
        <div className="flex h-7 w-full items-center rounded border border-gray-200 bg-gray-50 px-2 text-[10px] text-gray-400">https://example.com</div>
      </div>
    </div>
  </SectionCard>
);

const IdMissionSection = ({ section }) => (
  <SectionCard section={section} badge="System Step">
    <div className="flex flex-col items-center gap-2 py-2 text-center">
      <div className="text-2xl">🪪</div>
      <p className="text-[10px] text-gray-500">Applicant scans a government-issued ID and completes identity verification via IDMission.</p>
      <div className="h-7 w-36 rounded bg-indigo-100 text-[10px] text-indigo-500 flex items-center justify-center">Start ID Verification</div>
    </div>
  </SectionCard>
);

const AgreementSection = ({ section }) => (
  <SectionCard section={section} badge="Signature">
    {section.displayText && (
      <p className="mb-2 text-[10px] text-gray-500 italic">{section.displayText}</p>
    )}
    {section.signDisplayText && (
      <p className="mb-2 text-[10px] text-gray-600">{section.signDisplayText}</p>
    )}
    <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-center">
      <p className="text-[10px] text-gray-400 mb-2">Applicant signature</p>
      <div className="h-10 w-full rounded border border-gray-200 bg-white" />
    </div>
  </SectionCard>
);

const StandardSection = ({ section }) => (
  <SectionCard section={section} badge={section.isHidden ? "Hidden — Underwriting" : (section.isBlock ? "Block" : "Section")}>
    {section.displayText && (
      <p className="mb-2 text-[10px] text-gray-500 italic">{section.displayText}</p>
    )}
    {section.fields?.length > 0 ? (
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {section.fields.map((f, i) => (
          <div key={i} className={f.type === "textarea" || f.type === "block" ? "col-span-2" : ""}>
            <FieldMockup field={f} />
          </div>
        ))}
      </div>
    ) : (
      <p className="text-[10px] text-gray-400 italic">No custom fields</p>
    )}
  </SectionCard>
);

// ── Section card wrapper ──────────────────────────────────────────────────────

const SectionCard = ({ section, badge, children }) => (
  <div className={`rounded-lg border ${section.isHidden ? "border-gray-200 bg-gray-50 opacity-60" : "border-gray-200 bg-white"} overflow-hidden`}>
    <div className={`flex items-center justify-between px-3 py-1.5 ${section.isHidden ? "bg-gray-100" : "bg-indigo-50"}`}>
      <span className="text-[11px] font-semibold text-gray-700">{section.sectionName}</span>
      <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${
        section.isHidden
          ? "bg-gray-200 text-gray-500"
          : badge === "System Step"
          ? "bg-blue-100 text-blue-600"
          : badge === "Signature"
          ? "bg-purple-100 text-purple-600"
          : "bg-indigo-100 text-indigo-600"
      }`}>
        {badge}
      </span>
    </div>
    <div className="px-3 py-2">{children}</div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export default function FormPreview({ formName, sections }) {
  return (
    <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">Form Preview</p>
        <p className="text-[10px] text-gray-500 font-medium">{formName}</p>
      </div>
      <div className="flex flex-col gap-2">
        {sections.map((section, i) => {
          const t = section.sectionTitle;
          if (t === "otp_blk") return <OtpSection key={i} section={section} />;
          if (t === "company_scraping_blk") return <CompanyScrapingSection key={i} section={section} />;
          if (t === "id_mission_blk") return <IdMissionSection key={i} section={section} />;
          if (t === "agreement_blk") return <AgreementSection key={i} section={section} />;
          return <StandardSection key={i} section={section} />;
        })}
      </div>
      <p className="mt-2 text-[9px] text-gray-400 text-center">Visual approximation — actual styling reflects the applied branding</p>
    </div>
  );
}
