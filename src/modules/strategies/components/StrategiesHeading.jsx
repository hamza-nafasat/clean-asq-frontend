import { useState } from "react";
import { useCreateFormStrategyMutation } from "@/redux/apis/form.apis";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import StrategiesFormModal from "./StrategiesFormModal";
import { MODAL_MODES } from "@/constants";

const StrategiesHeading = ({ canCreateStrategy = false, formOptions = [], lookupOptions = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createFormStrategy, { isLoading: isCreating }] = useCreateFormStrategyMutation();

  const handleAddStrategy = async (form) => {
    try {
      const res = await createFormStrategy(form).unwrap();
      if (!res?.success) return;
      toast.success(res.message);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Create strategy error:", error);
      toast.error(error?.data?.message || "Failed to create strategy");
    }
  };

  return (
    <>
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-textPrimary text-xl font-semibold">Strategies</h1>
        {canCreateStrategy && (
          <Button icon={FiPlus} label="Add Strategy" onClick={() => setIsModalOpen(true)} disabled={isCreating} />
        )}
      </header>

      <StrategiesFormModal
        isOpen={isModalOpen}
        mode={MODAL_MODES.ADD}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStrategy}
        isLoading={isCreating}
        forms={formOptions}
        formKeys={lookupOptions}
      />
    </>
  );
};

export default StrategiesHeading;
