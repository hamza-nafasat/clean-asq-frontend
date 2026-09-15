import Button from "@/components/shared/Button";

const MyProfileActions = ({ className = "", formId, isUpdating = false, onCancel }) => (
  <div className={className}>
    <Button
      type="button"
      variant="secondary"
      label="Cancel"
      onClick={() => onCancel?.()}
      disabled={isUpdating}
      className="rounded-[12px]! px-6!"
    />
    <Button
      type="submit"
      form={formId}
      label="Update"
      loading={isUpdating}
      disabled={isUpdating}
      className="rounded-[12px]! px-6!"
    />
  </div>
);

export default MyProfileActions;
