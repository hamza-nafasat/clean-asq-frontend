import { updateFormState } from "@/redux/slices/formSlice";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { unwrapResult } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import SignatureBox from "../../shared/SignatureBox";

function AggrementBlockPdf({ name, step, isSignature, formInnerData, setFormInnerData, sectionKey }) {
  const dispatch = useDispatch();

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
        if (!res.publicId || !res.secureUrl || !res.resourceType)
          return toast.error("File Not Uploaded Please Try Again");
        const action = await dispatch(
          updateFormState({ data: { signature: { name: "signature", value: res } }, name: sectionKey }),
        );
        unwrapResult(action);
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
            dangerouslySetInnerHTML={{
              __html: String(step?.ai_formatting || step?.displayText || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match;
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}

      <div className="mt-4">
        {isSignature && (
          <>
            {step?.signDisplayFormattedText && (
              <div
                className="mb-4"
                dangerouslySetInnerHTML={{
                  __html: String(step.signDisplayFormattedText),
                }}
              />
            )}
            <SignatureBox
              step={step}
              onSave={signatureUploadHandler}
              oldSignatureUrl={formInnerData?.[sectionKey]?.signature?.value?.secureUrl || ""}
              isPdf={true}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default AggrementBlockPdf;
