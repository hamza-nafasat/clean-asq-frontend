import Button from "@/components/shared/Button";

const MyProfileActions = ({ className = "", formId, isUpdating = false, onCancel }) => (
  <div className={className}>
    <Button
      type="button"
      variant="secondary"
      label="Cancel"
      onClick={() => onCancel?.()}
      disabled={isUpdating}
      size="lg"
    />
    <Button
      type="submit"
      form={formId}
      label="Update"
      loading={isUpdating}
      disabled={isUpdating}
      size="lg"
    />
  </div>
);

export default MyProfileActions;
