import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { useCheckFormRuleFromAiMutation } from "@/redux/apis/form.apis";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";

const ApplicationFormsRulePromptCheck = ({ formId = "" }) => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [checkRule, { isLoading: isChecking }] = useCheckFormRuleFromAiMutation();

  const handleCheck = async () => {
    try {
      const res = await checkRule({ formId, prompt }).unwrap();
      if (res?.success) setResult(res.data);
    } catch (error) {
      console.error("Check form rule from ai error:", error);
    }
  };

  return (
    <section className="flex w-full flex-col gap-2">
      <div className="flex justify-center gap-2">
        <TextField
          label="Prompt for Check:"
          id="prompt-for-check"
          placeholder="Enter prompt for check"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button
          label="Check"
          variant="primary"
          size="field"
          className="self-end"
          onClick={handleCheck}
          disabled={!prompt || isChecking}
          icon={isChecking && FaSpinner}
          cnLeft="mr-2 h-4 w-4 animate-spin"
        />
      </div>
      {result && (
        <p className={`text-sm ${result.canCreate ? "text-green-700" : "text-red-500"}`}>{result.message}</p>
      )}
    </section>
  );
};

export default ApplicationFormsRulePromptCheck;
