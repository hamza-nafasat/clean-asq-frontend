import { CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useUpdateFormMutation } from "@/redux/apis/form.apis";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { LAYOUT_ROUTES } from "@/constants";
import { DEFAULT_HEADER_TEXT_SIZE } from "../utils/application-forms.constants";

const ApplicationFormsConfigurationModal = ({ form = null, refetch, setModal }) => {
  const [redirectUrl, setRedirectUrl] = useState(form?.redirectUrl || "");
  const [headerText, setHeaderText] = useState(form?.headerText || "");
  const [headerTextSize, setHeaderTextSize] = useState(form?.headerTextSize || DEFAULT_HEADER_TEXT_SIZE);
  const [updateForm, { isLoading: isUpdatingForm }] = useUpdateFormMutation();

  const formUrl = `${window.location.origin}${LAYOUT_ROUTES.APPLICATION_FORM}/${form?.branding?.name}/${form?._id}`;

  const handleFormUpdate = async () => {
    try {
      const res = await updateForm({
        _id: form?._id,
        data: { redirectUrl, headerText, headerTextSize },
      }).unwrap();
      if (res?.success) {
        await refetch?.();
        toast?.success(res?.message || "Form updated successfully");
        setModal?.(false);
      }
    } catch (error) {
      console.error("Update form error:", error);
      toast.error(error?.data?.message || "Failed to update form");
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(formUrl);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <h3 className="text-center text-lg font-semibold text-gray-800">Form Configuration</h3>

        {/* Form url */}
        <div className="flex items-center gap-2">
          <TextField
            label="Form URL"
            id="redirect-url"
            value={formUrl}
            readOnly
            onChange={() => {}}
            name="redirect-url"
          />
          <Button
            label={"Copy"}
            variant="secondary"
            onClick={handleCopyUrl}
            className=" self-end! h-12!"
            rightIcon={CopyIcon}
            cnRight={"h-5! w-5!"}
          />
        </div>

        {/* Redirect url */}
        <div className="flex flex-col gap-2">
          <TextField
            label="Redirect URL"
            id="redirect-url"
            placeholder="Enter redirect URL"
            value={redirectUrl}
            onChange={(e) => setRedirectUrl(e.target.value)}
            name="redirect-url"
          />
        </div>

        {/* Header text */}
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <TextField
                label="Header Text"
                id="header-text"
                placeholder="Enter header text"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                name="header-text"
                style={{ fontSize: `${headerTextSize}px` }}
              />
            </div>
            <div className="flex flex-col gap-1 pb-1">
              <TextField
                type="number"
                min={8}
                label={"Size (px)"}
                max={72}
                value={headerTextSize}
                onChange={(e) => setHeaderTextSize(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={() => setModal?.(false)} />
          <Button disabled={isUpdatingForm} label="Save" variant="primary" onClick={handleFormUpdate} />
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormsConfigurationModal;
