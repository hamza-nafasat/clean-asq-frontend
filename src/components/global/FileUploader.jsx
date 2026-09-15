import FieldFileUpload from "@/components/global/FieldFileUpload";

const FileUploader = ({ label = "", accept = ".pdf,image/*,.csv", onFileSelect = () => {}, existingUrl = "" }) => (
  <FieldFileUpload
    variant="uploader"
    field={{ label }}
    accept={accept}
    existingUrl={existingUrl}
    onFileSelect={onFileSelect}
  />
);

export default FileUploader;
