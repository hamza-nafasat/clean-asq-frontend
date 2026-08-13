import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { toast } from "react-toastify";
import SignatureBox from "../../shared/SignatureBox";
import { FileInputType, OtherInputType } from "./shared/DynamicFieldForPdf";

function DocumentsPdf({ name, fields, step, isSignature, formInnerData, setFormInnerData, sectionKey }) {
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

  return (
    <div className="mt-14 h-full w-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-textPrimary text-2xl font-semibold">{name}</h1>
        </div>
        {(step?.ai_formatting || step?.displayText) && (
          <div className="mb-4 w-full">
            <div dangerouslySetInnerHTML={{ __html: step?.ai_formatting || step?.displayText }} />
          </div>
        )}
      </div>
      <div className="mt-6 w-full">
        {fields?.map((field, index) => {
          if (field.type === "file") {
            return (
              <div className="flex w-full flex-col gap-4 p-6" key={index}>
                <FileInputType
                  field={field}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
                  className={""}
                />
              </div>
            );
          }
          return (
            <div key={index} className="mt-4">
              <OtherInputType
                field={field}
                placeholder={field.placeholder}
                form={formInnerData?.[sectionKey]}
                setForm={setFormInnerData}
                sectionKey={sectionKey}
                className={""}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        {isSignature && (
          <SignatureBox
            step={step}
            isPdf={true}
            onSave={signatureUploadHandler}
            oldSignatureUrl={formInnerData?.[sectionKey]?.signature?.value?.secureUrl || ""}
          />
        )}
      </div>
    </div>
  );
}

export default DocumentsPdf;
