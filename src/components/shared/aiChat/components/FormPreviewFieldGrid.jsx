import { FIELD_TYPES, FORM_BLOCK_TYPE, OWNER_CARD_FIELDS } from "@/constants";

const OWNER_CARD_PREVIEW_FIELDS = Object.values(OWNER_CARD_FIELDS);
const WIDE_FIELD_TYPES = [FIELD_TYPES.TEXTAREA, FIELD_TYPES.RADIO, FORM_BLOCK_TYPE];

const FieldMockup = ({ field }) => {
  const { label, type, required, placeholder, options, conditional_fields, displayText, isDisplayText } = field;
  // page labels may include *
  const showRequiredMark = required && !String(label).trimEnd().endsWith("*");

  let input;
  switch (type) {
    case FIELD_TYPES.TEXTAREA:
      input = (
        <div className="h-14 w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-[10px] leading-relaxed text-gray-400">
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
            <label key={i} className="flex cursor-default items-center gap-1 text-[10px] text-gray-500">
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
            <p className="mb-0.5 border-l-2 border-blue-200 pl-1.5 text-[10px] text-blue-600 italic">{displayText}</p>
          )}
          <label className="flex cursor-default items-start gap-1.5 text-[10px] text-gray-600">
            <span className="mt-0.5 inline-flex h-3 w-3 shrink-0 items-center justify-center rounded border border-gray-300 bg-white" />
            <span>
              {label}
              {showRequiredMark && <span className="ml-0.5 text-red-400">*</span>}
            </span>
          </label>
          {conditional_fields?.length > 0 && (
            <div className="mt-1 ml-4 flex gap-2">
              {conditional_fields.map((cf, i) => (
                <div key={i} className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[9px] text-gray-400">{cf.label}</span>
                  <div className="flex h-6 w-full items-center rounded border border-gray-200 bg-gray-50 px-1.5 text-[10px] text-gray-400">
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
          <input type="range" className="h-1.5 w-full cursor-default" disabled defaultValue={50} />
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
          <FormPreviewFieldGrid fields={OWNER_CARD_PREVIEW_FIELDS} />
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
        <p className="mb-0.5 border-l-2 border-blue-200 pl-1.5 text-[10px] text-blue-600 italic">{displayText}</p>
      )}
      <label className="text-[10px] font-medium text-gray-600">
        {label}
        {showRequiredMark && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {input}
    </div>
  );
};

const FormPreviewFieldGrid = ({ fields = [] }) => (
  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
    {fields.map((f, i) => (
      <div key={i} className={WIDE_FIELD_TYPES.includes(f.type) ? "col-span-2" : ""}>
        <FieldMockup field={f} />
      </div>
    ))}
  </div>
);

export default FormPreviewFieldGrid;
