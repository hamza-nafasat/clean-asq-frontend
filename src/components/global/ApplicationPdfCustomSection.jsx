import ApplicationPdfField from "@/components/global/ApplicationPdfField";
import SignatureBox from "@/components/global/SignatureBox";
import { FIELD_NAMES, FORM_BLOCK_TYPE, formKeys, SIGNATURE_KEY } from "@/constants";
import { sectionEntries } from "@/utils/sectionCompletion";
import { uploadSectionSignature } from "@/utils/sectionSignature";
import HtmlContent from "@/components/shared/HtmlContent";

const MULTI_ENTRY_SECTION_KEYS = new Set([formKeys.additional_owners_hidden_section_key]);

const CustomSectionPdf = ({ fields, name, step, isSignature, formInnerData, setFormInnerData, sectionKey }) => {
  const sectionData = formInnerData?.[sectionKey];
  const isMultiEntry = MULTI_ENTRY_SECTION_KEYS.has(sectionKey) && Array.isArray(sectionData);
  const entries = isMultiEntry ? sectionEntries(sectionData) : [];

  // setter that writes into one entry of a multi-entry section
  const scopedSetter = (entryIndex) => (updater) =>
    setFormInnerData((prev) => {
      const list = Array.isArray(prev?.[sectionKey]) ? prev[sectionKey] : [];
      const draft = { [sectionKey]: list[entryIndex] ?? {} };
      const next = typeof updater === "function" ? updater(draft) : updater;
      return {
        ...prev,
        [sectionKey]: list.map((entry, i) => (i === entryIndex ? (next?.[sectionKey] ?? {}) : entry)),
      };
    });

  const renderFields = (form, setForm, keyPrefix) => (
    <div className="mt-6 flex flex-col gap-4">
      {fields?.map((field, index) => {
        if (field.name === FIELD_NAMES.MAIN_OWNER_OWN_25_PERCENT || field.type === FORM_BLOCK_TYPE) return null;
        return (
          <ApplicationPdfField
            key={`${keyPrefix}-${index}`}
            field={field}
            form={form}
            setForm={setForm}
            sectionKey={sectionKey}
          />
        );
      })}
    </div>
  );

  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
        <div className="flex gap-2"></div>
      </div>

      {(step?.ai_formatting || step?.displayText) && (
        <div className="flex w-full items-end justify-between gap-3">
          <HtmlContent className="mt-2 mb-4 w-full" html={step?.ai_formatting || step?.displayText} linkMode="none" />
        </div>
      )}

      {isMultiEntry ? (
        <div className="flex flex-col gap-8">
          {entries.map(({ entry, index }, ordinal) => (
            <section key={index} className="rounded-lg border border-gray-200 p-5">
              <h4 className="text-textPrimary border-b pb-2 text-lg font-semibold">Owner {ordinal + 1}</h4>
              {renderFields(entry, scopedSetter(index), `entry-${index}`)}
            </section>
          ))}
        </div>
      ) : (
        <>
          {renderFields(sectionData, setFormInnerData, "single")}
          <div className="mt-4">
            {isSignature && (
              <>
                {step?.signDisplayFormattedText && (
                  <HtmlContent className="mb-4" html={String(step.signDisplayFormattedText)} linkMode="none" />
                )}
                <SignatureBox
                  step={step}
                  isPdf={true}
                  onSave={(file, setIsSaving) =>
                    uploadSectionSignature({ file, setIsSaving, sectionKey, formInnerData, setFormInnerData })
                  }
                  oldSignatureUrl={formInnerData?.[sectionKey]?.[SIGNATURE_KEY]?.value?.secureUrl || ""}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomSectionPdf;
