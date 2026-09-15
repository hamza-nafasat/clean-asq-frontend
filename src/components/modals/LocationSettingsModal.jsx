import { useCallback, useState } from "react";
import DOMPurify from "dompurify";
import { CgSpinner } from "react-icons/cg";
import { toast } from "react-toastify";

import { useFormateTextInMarkDownMutation, useUpdateFormLocationMutation } from "@/redux/apis/form.apis";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { LOCATION_STATUSES } from "@/constants";

const LOCATION_OPTIONS = [
  { status: LOCATION_STATUSES.REQUIRED, label: "Location Required" },
  { status: LOCATION_STATUSES.OPTIONAL, label: "Optional Location" },
];

const LocationSettingsModal = ({ locationModal, setLocationModal, formLocationData, refetch }) => {
  const [locationStatus, setLocationStatus] = useState(formLocationData?.status || "");
  const [locationMessage, setLocationMessage] = useState(formLocationData?.message || "");
  const [formatedLocationMessage, setFormatedLocationMessage] = useState(formLocationData?.formatedText || "");
  const [formateTextInstructions, setFormateTextInstructions] = useState(
    formLocationData?.formatingTextInstructions || "",
  );
  const [updateFormLocation] = useUpdateFormLocationMutation();
  const [formateText, { isLoading }] = useFormateTextInMarkDownMutation();

  const handleFormLocationUpdate = async () => {
    if (!locationModal) return toast.error("Please select a form");
    if (!locationStatus) return toast.error("Please select a location status");
    if (!locationMessage) return toast.error("Please enter location message");
    if (!formatedLocationMessage) return toast.error("Please enter formated location message");
    if (!formateTextInstructions) return toast.error("Please enter formating text instructions");
    try {
      const res = await updateFormLocation({
        _id: locationModal,
        data: { locationStatus, locationMessage, formatedLocationMessage, formateTextInstructions },
      }).unwrap();
      if (res?.success) {
        setLocationModal?.(false);
        await refetch?.();
        toast.success(res?.message || "Form location updated successfully");
      }
    } catch (error) {
      console.error("Update form location error:", error);
      toast.error(error?.data?.message || "Failed to update form location");
    }
  };

  const handleFormatText = useCallback(async () => {
    if (!locationMessage || !formateTextInstructions) return toast.error("Please enter text and instructions");
    try {
      const res = await formateText({ text: locationMessage, instructions: formateTextInstructions }).unwrap();
      if (res.success) setFormatedLocationMessage(DOMPurify.sanitize(res.data));
    } catch (error) {
      console.error("Format text error:", error);
      toast.error(error?.data?.message || "Failed to format text");
    }
  }, [locationMessage, formateTextInstructions, formateText]);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <h3 className="text-center text-lg font-semibold text-gray-800">Configure Location Settings</h3>

        <div className="flex flex-col gap-2">
          <TextField
            type="textarea"
            label="Message"
            id="location-message"
            placeholder="Enter message"
            value={locationMessage}
            onChange={(e) => setLocationMessage(e.target.value)}
            name="Message"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <TextField
              type="textarea"
              label="Formating instuctions"
              id="formate-message"
              placeholder="Enter formating instructions"
              value={formateTextInstructions}
              onChange={(e) => setFormateTextInstructions(e.target.value)}
              name="formate-message"
            />
          </div>
          <Button
            onClick={handleFormatText}
            disabled={isLoading}
            icon={isLoading ? CgSpinner : null}
            label="Format"
            variant="primary"
            className="w-fit! self-end"
          />
        </div>

        {formatedLocationMessage && (
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Formated Message</label>
            <div className="broder-gray-200 flex items-center justify-between gap-2 border p-2">
              <div dangerouslySetInnerHTML={{ __html: formatedLocationMessage }} />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Location Requirement</h4>
          {LOCATION_OPTIONS.map(({ status, label }) => (
            <label
              key={status}
              htmlFor={status}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition hover:bg-gray-100"
            >
              <span className="font-medium text-gray-700">{label}</span>
              <input
                name={status}
                id={status}
                type="checkbox"
                className="accent-primary h-5 w-5 cursor-pointer"
                checked={locationStatus === status}
                onChange={() => setLocationStatus((prev) => (prev === status ? LOCATION_STATUSES.DISABLED : status))}
              />
            </label>
          ))}
        </div>

        <div className="flex w-full justify-end gap-2">
          <Button label="Cancel" variant="secondary" onClick={() => setLocationModal?.(false)} />
          <Button label="Save" variant="primary" onClick={handleFormLocationUpdate} />
        </div>
      </div>
    </div>
  );
};

export default LocationSettingsModal;
