import { useSelector } from "react-redux";

import FieldFileUpload from "@/components/global/FieldFileUpload";
import Button from "@/components/shared/Button";
import { setSectionFieldValue } from "@/utils/fieldFormatting";

const ApplicationPdfFileInputType = ({ field = {}, className = "", form = {}, setForm, sectionKey }) => {
  const { name, uniqueId } = field;
  const { isDisabledAllFields } = useSelector((state) => state.form);
  const secureUrl = form?.[uniqueId]?.value?.secureUrl;

  return (
    <FieldFileUpload
      field={field}
      value={form?.[uniqueId]?.value}
      className={className}
      isDisabled={isDisabledAllFields}
      onFileSelect={(file) => setSectionFieldValue(setForm, sectionKey, uniqueId, name, { file })}
    >
      {secureUrl && (
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

export default ApplicationPdfFileInputType;
