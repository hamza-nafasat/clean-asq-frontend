import FileInputType from "@/components/global/FileInputType";
import ApplicationPdfOtherInputType from "@/components/global/ApplicationPdfOtherInputType";
import SignatureBox from "@/components/global/SignatureBox";
import { FIELD_TYPES, SIGNATURE_KEY } from "@/constants";
import { uploadSectionSignature } from "@/utils/sectionSignature";
import HtmlContent from "@/components/shared/HtmlContent";

const DocumentsPdf = ({ name, fields, step, isSignature, formInnerData, setFormInnerData, sectionKey }) => (
  <div className="mt-14 h-full w-full overflow-auto rounded-lg border p-6 shadow-md">
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-textPrimary text-2xl font-semibold">{name}</h1>
      </div>
      {(step?.ai_formatting || step?.displayText) && (
        <div className="mb-4 w-full">
          <HtmlContent html={step?.ai_formatting || step?.displayText} linkMode="none" />
        </div>
      )}
    </div>
    <div className="mt-6 w-full">
      {fields?.map((field, index) => {
        const inputProps = { field, form: formInnerData?.[sectionKey], setForm: setFormInnerData, sectionKey };
        if (field.type === FIELD_TYPES.FILE) {
          return (
            <div className="flex w-full flex-col gap-4 p-6" key={index}>
              <FileInputType {...inputProps} isPdf />
            </div>
          );
        }
        return (
          <div key={index} className="mt-4">
            <ApplicationPdfOtherInputType {...inputProps} />
          </div>
        );
      })}
    </div>
    <div className="mt-4">
      {isSignature && (
        <SignatureBox
          step={step}
          isPdf={true}
          onSave={(file, setIsSaving) =>
            uploadSectionSignature({ file, setIsSaving, sectionKey, formInnerData, setFormInnerData })
          }
          oldSignatureUrl={formInnerData?.[sectionKey]?.[SIGNATURE_KEY]?.value?.secureUrl || ""}
        />
      )}
    </div>
  </div>
);

export default DocumentsPdf;
