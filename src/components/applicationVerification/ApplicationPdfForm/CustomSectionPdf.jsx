import { FIELD_TYPES, formKeys } from "@/data/constants";
import { sectionEntries } from "@/lib/sectionCompletion";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { toast } from "react-toastify";
import SignatureBox from "../../shared/SignatureBox";
import {
  CheckboxInputType,
  FileInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from "./shared/DynamicFieldForPdf";

const MULTI_ENTRY_SECTION_KEYS = new Set([formKeys.additional_owners_hidden_section_key]);
const entryLabel = (entry, ordinal) => {
  return `Owner ${ordinal}`;
};

function CustomSectionPdf({ fields, name, step, isSignature, formInnerData, setFormInnerData, sectionKey }) {
  const sectionData = formInnerData?.[sectionKey];
  const isMultiEntry = MULTI_ENTRY_SECTION_KEYS.has(sectionKey) && Array.isArray(sectionData);

  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please select a file");
      if (file) {
        const oldSign = formInnerData?.[sectionKey]?.["signature"]?.value;
        if (oldSign?.publicId) {
          const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
          if (!result) return toast.error("File Not Deleted Please Try Again");
        }
        const res = await uploadImageOnCloudinary(file);
        if (!res.publicId || !res.secureUrl || !res.resourceType) {
          return toast.error("File Not Uploaded Please Try Again");
        }
        setFormInnerData((prev) => ({
          ...prev,
          [sectionKey]: { ...prev?.[sectionKey], signature: { name: "signature", value: res } },
        }));
        toast.success("Signature uploaded successfully");
      }
    } catch (error) {
      console.log("error while uploading signature", error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

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
        const key = `${keyPrefix}-${index}`;
        if (field.name === "main_owner_own_25_percent_or_more" || field.type === "block") return null;
        const shared = { field, form, setForm, sectionKey, className: "" };

        if (field.type === FIELD_TYPES.SELECT) {
          return (
            <div key={key} className="mt-4">
              <SelectInputType {...shared} />
            </div>
          );
        }
        if (field.type === FIELD_TYPES.MULTI_CHECKBOX) {
          return (
            <div key={key} className="mt-4">
              <MultiCheckboxInputType {...shared} />
            </div>
          );
        }
        if (field.type === FIELD_TYPES.FILE) {
          return (
            <div key={key} className="mt-4">
              <FileInputType {...shared} />
            </div>
          );
        }
        if (field.type === FIELD_TYPES.RADIO) {
          return (
            <div key={key} className="mt-4">
              <RadioInputType {...shared} />
            </div>
          );
        }
        if (field.type === FIELD_TYPES.RANGE) {
          return (
            <div key={key} className="mt-4">
              <RangeInputType {...shared} />
            </div>
          );
        }
        if (field.type === FIELD_TYPES.CHECKBOX) {
          return (
            <div key={key} className="mt-4">
              <CheckboxInputType {...shared} placeholder={field.placeholder} />
            </div>
          );
        }
        return (
          <div key={key} className="mt-4">
            <OtherInputType {...shared} placeholder={field.placeholder} />
          </div>
        );
      })}
    </div>
  );

  const entries = isMultiEntry ? sectionEntries(sectionData) : [];

  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
        <div className="flex gap-2"></div>
      </div>

      {(step?.ai_formatting || step?.displayText) && (
        <div className="flex w-full items-end justify-between gap-3">
          <div
            className="mt-2 mb-4 w-full"
            dangerouslySetInnerHTML={{
              __html: step?.ai_formatting || step?.displayText,
            }}
          />
        </div>
      )}

      {isMultiEntry ? (
        <div className="flex flex-col gap-8">
          {entries.map(({ entry, index }, ordinal) => (
            <section key={index} className="rounded-lg border border-gray-200 p-5">
              <h4 className="text-textPrimary border-b pb-2 text-lg font-semibold">{entryLabel(entry, ordinal + 1)}</h4>
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
                  <div className="mb-4" dangerouslySetInnerHTML={{ __html: String(step.signDisplayFormattedText) }} />
                )}
                <SignatureBox
                  step={step}
                  isPdf={true}
                  onSave={signatureUploadHandler}
                  oldSignatureUrl={formInnerData?.[sectionKey]?.signature?.value?.secureUrl || ""}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CustomSectionPdf;
