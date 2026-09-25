import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import Button from "@/components/shared/Button";

const ApplicationFormsRuleAiControls = ({ formData = null, isGenerating = false, canGenerate = false, onGenerate }) => {
  const [showAiContext, setShowAiContext] = useState(false);

  return (
    <>
      <div className="flex justify-end  w-full items-end gap-2">
        <Button
          label={showAiContext ? "Hide Ai Context" : "Preview Ai Context"}
          variant="secondary"
          onClick={() => setShowAiContext((prev) => !prev)}
        />
        <Button
          label="Get Rule from AI"
          variant="primary"
          icon={isGenerating && FaSpinner}
          cnLeft="mr-2 w-4 h-4 animate-spin"
          onClick={onGenerate}
          disabled={isGenerating || !canGenerate}
        />
      </div>
      {showAiContext && formData && (
        <section className="flex flex-col gap-3 mt-4 border border-gray-200 rounded-xl p-4 bg-fieldBackground">
          <h3 className="text-lg font-semibold text-gray-800">The data ai use to create the rules</h3>
          <div className="overflow-x-auto overflow-y-auto max-h-75">
            <pre className="text-xs bg-black text-green-400 p-3 rounded-md mt-2 overflow-x-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </section>
      )}
    </>
  );
};

export default ApplicationFormsRuleAiControls;
