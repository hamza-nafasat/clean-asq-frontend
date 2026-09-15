import { useSelector } from "react-redux";

import FieldFileUpload from "@/components/global/FieldFileUpload";
import Button from "@/components/shared/Button";
import { setSectionFieldValue } from "@/utils/fieldFormatting";

const FileInputType = ({ field = {}, className = "", form = {}, setForm, sectionKey, isPdf = false }) => {
  const { name, uniqueId, aiPrompt } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const secureUrl = form?.[uniqueId]?.value?.secureUrl;

  return (
    <FieldFileUpload
      field={field}
      value={form?.[uniqueId]?.value}
      className={className}
      data-ai-help-context={isPdf ? undefined : aiPrompt || undefined}
      isDisabled={isPdf ? isDisabledAllFields : false}
      onFileSelect={(file) =>
        isPdf
          ? setSectionFieldValue(setForm, sectionKey, uniqueId, name, { file })
          : setForm((prev) => ({ ...prev, [uniqueId]: { name, value: { file } } }))
      }
    >
      {isPdf && secureUrl && (
        <Button
          label="Download"
          variant="secondary"
          className="mt-4 w-full"
          onClick={() => window.open(secureUrl, "_blank")}
        />
      )}
    </FieldFileUpload>
  );
};

export default FileInputType;
