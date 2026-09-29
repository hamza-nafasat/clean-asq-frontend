import Button from "@/components/shared/Button";

// previous, next and submit, one disabled rule for both
const ApplicantStepActions = ({
  currentStep = 0,
  totalSteps = 0,
  isComplete = false,
  isBusy = false,
  incompleteLabel = "Some required fields are missing",
  onPrevious,
  onNext,
  onSubmit,
}) => {
  const isLastStep = currentStep >= totalSteps - 1;
  const isDisabled = !isComplete || isBusy;
  const actionLabel = isLastStep ? "Submit" : "Next";

  return (
    <footer className="mt-8 flex justify-end gap-5 p-4">
      {currentStep > 0 && (
        <Button variant="secondary" label="Previous" onClick={onPrevious} data-testid="form-back-btn" />
      )}
      <Button
        disabled={isDisabled}
        label={isComplete ? actionLabel : incompleteLabel}
        data-testid={isLastStep ? "form-submit-btn" : "form-next-btn"}
        onClick={isLastStep ? onSubmit : onNext}
      />
    </footer>
  );
};

export default ApplicantStepActions;
