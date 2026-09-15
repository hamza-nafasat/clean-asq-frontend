import FieldFileUpload from "@/components/global/FieldFileUpload";

const FileInputType = ({ field = {}, className = "", form = {}, setForm }) => {
  const { name, uniqueId, aiPrompt } = field;

  return (
    <FieldFileUpload
      field={field}
      value={form?.[uniqueId]?.value}
      className={className}
      data-ai-help-context={aiPrompt || undefined}
      onFileSelect={(file) => setForm((prev) => ({ ...prev, [uniqueId]: { name, value: { file } } }))}
    />
  );
};

export default FileInputType;
