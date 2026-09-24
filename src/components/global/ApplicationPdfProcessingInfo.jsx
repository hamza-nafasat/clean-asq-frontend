import ApplicationPdfField from "@/components/global/ApplicationPdfField";
import SignatureBox from "@/components/global/SignatureBox";
import { FIELD_NAMES, FORM_BLOCK_TYPE, SIGNATURE_KEY } from "@/constants";
import { uploadSectionSignature } from "@/utils/sectionSignature";
import HtmlContent from "@/components/shared/HtmlContent";

const ProcessingInfoPdf = ({ name, fields, step, isSignature, formInnerData, setFormInnerData, sectionKey }) => (
  <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
    <div className="mb-10 flex items-center justify-between">
      <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
    </div>
    {(step?.ai_formatting || step?.displayText) && (
      <div className="mb-4 flex w-full items-end justify-between gap-3">
        <HtmlContent html={step?.ai_formatting || step?.displayText} linkMode="none" />
      </div>
    )}
    {fields?.map((field, index) => {
      if (field.name === FIELD_NAMES.MAIN_OWNER_OWN_25_PERCENT || field.type === FORM_BLOCK_TYPE) return null;
      return (
        <ApplicationPdfField
          key={index}
          field={field}
          form={formInnerData?.[sectionKey]}
          setForm={setFormInnerData}
          sectionKey={sectionKey}
        />
      );
    })}
    <div className="mt-4">
      {isSignature && (
        <SignatureBox
          step={step}
          isPdf={true}
          onSave={(file, setIsSaving, stamp) =>
            uploadSectionSignature({ file, setIsSaving, stamp, sectionKey, formInnerData, setFormInnerData })
          }
          signature={formInnerData?.[sectionKey]?.[SIGNATURE_KEY]}
        />
      )}
    </div>
  </div>
);

export default ProcessingInfoPdf;
