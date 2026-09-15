import { useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";

import { updateFormState } from "@/redux/slices/form.slice";
import SignatureBox from "@/components/global/SignatureBox";
import { SIGNATURE_KEY } from "@/constants";
import { openLinksInNewTab } from "@/utils/linkTargets";
import { uploadSectionSignature } from "@/utils/sectionSignature";

const AggrementBlockPdf = ({ name, step, isSignature, formInnerData, setFormInnerData, sectionKey }) => {
  const dispatch = useDispatch();

  // store the signature in redux before updating the section
  const handleSignatureUploaded = async (res) => {
    const action = await dispatch(
      updateFormState({ data: { [SIGNATURE_KEY]: { name: SIGNATURE_KEY, value: res } }, name: sectionKey }),
    );
    unwrapResult(action);
  };

  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
        <div className="flex gap-2"></div>
      </div>

      {(step?.ai_formatting || step?.displayText) && (
        <div className="mb-4 flex w-full items-end justify-between gap-3">
          <div
            className="mt-2 w-full"
            dangerouslySetInnerHTML={{ __html: openLinksInNewTab(step?.ai_formatting || step?.displayText) }}
          />
        </div>
      )}

      <div className="mt-4">
        {isSignature && (
          <>
            {step?.signDisplayFormattedText && (
              <div className="mb-4" dangerouslySetInnerHTML={{ __html: String(step.signDisplayFormattedText) }} />
            )}
            <SignatureBox
              step={step}
              onSave={(file, setIsSaving) =>
                uploadSectionSignature({
                  file,
                  setIsSaving,
                  sectionKey,
                  formInnerData,
                  setFormInnerData,
                  onUploaded: handleSignatureUploaded,
                })
              }
              oldSignatureUrl={formInnerData?.[sectionKey]?.[SIGNATURE_KEY]?.value?.secureUrl || ""}
              isPdf={true}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AggrementBlockPdf;
