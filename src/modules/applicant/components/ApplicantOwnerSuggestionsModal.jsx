import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import { useGetAllSearchStrategiesQuery, useUpdateFormSectionMutation } from "@/redux/apis/form.apis";
import usePermission from "@/hooks/usePermission";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import { PERMISSIONS } from "@/utils/permissions";

const ApplicantOwnerSuggestionsModal = ({ selectedSuggestions = [], sectionId, onClose }) => {
  const [selectedOwners, setSelectedOwners] = useState(Array.isArray(selectedSuggestions) ? selectedSuggestions : []);
  const [suggestions, setSuggestions] = useState([]);
  const canReadLookup = usePermission(PERMISSIONS.READ_LOOKUP);
  const { data, isLoading } = useGetAllSearchStrategiesQuery(undefined, { skip: !canReadLookup });
  const [updateFormSection, { isLoading: isUpdating }] = useUpdateFormSectionMutation();

  const handleSave = async () => {
    try {
      const res = await updateFormSection({
        _id: sectionId,
        data: { ownerSuggesstions: selectedOwners },
      }).unwrap();
      if (res.success) {
        toast.success("Section Updated Successfully");
        onClose?.();
      }
    } catch (error) {
      console.error("Update owner suggestions error:", error);
      toast.error(error?.data?.message || "Failed to update section");
    }
  };

  const handleSelect = (e) => {
    const value = e.target.value;
    if (value && !selectedOwners.includes(value)) {
      setSelectedOwners((prev) => [...prev, value]);
      setSuggestions((prev) => prev.filter((o) => o !== value));
    }
  };

  const handleRemoveOwner = (owner) => {
    setSelectedOwners((prev) => prev.filter((o) => o !== owner));
    setSuggestions((prev) => [...prev, owner]);
  };

  useEffect(() => {
    if (data?.data && !suggestions?.length) {
      setSuggestions(data?.data?.map((item) => item?.searchObjectKey) || []);
    }
  }, [data, suggestions?.length]);

  if (isLoading) return <CustomLoading />;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <label htmlFor="owners" className="block text-sm font-medium text-gray-700">
          Select Owners
        </label>
        <select
          id="owners"
          onChange={handleSelect}
          className="mt-2 w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose Owner Keys to Suggest</option>
          {suggestions.map((owner, index) => (
            <option key={`owner-${index}`} value={owner}>
              {owner}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedOwners.map((owner) => (
          <div key={owner} className="flex items-center gap-2 rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700">
            <span>{owner}</span>
            <button
              type="button"
              aria-label={`Remove ${owner}`}
              onClick={() => handleRemoveOwner(owner)}
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              <FiX size={16} className="text-red-500" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onClose} label="Cancel" />
        <Button label={isUpdating ? "Saving..." : "Save"} onClick={handleSave} disabled={selectedOwners.length === 0} />
      </div>
    </div>
  );
};

export default ApplicantOwnerSuggestionsModal;
