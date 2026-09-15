import Button from "@/components/shared/Button";
import { useGetSingleSubmitFormQueryQuery } from "@/redux/apis/form.apis";
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { History } from "../components/UnderwritingHistory";
import { ApplicationAnalysis } from "../components/UnderwritingAnalysis";
import { AppViewer } from "../components/UnderwritingAppViewer";
import usePermission from "@/hooks/usePermission";
import { PERMISSIONS } from "@/utils/permissions";
import { FormVersions } from "../components/UnderwritingFormVersions";

function OnBoarding() {
  const { applicantId } = useParams();
  const [activeTab, setActiveTab] = useState("history");
  const { data: submitFormData } = useGetSingleSubmitFormQueryQuery({ _id: applicantId }, { skip: !applicantId });
  const hasUnderwritingPermission = usePermission(PERMISSIONS.UNDERWRITING);
  if (!hasUnderwritingPermission) return <Navigate to="/application-forms" />;
  return (
    <>
      <div className="bg-backgroundColor rounded-t-md p-4">
        <div className="mb-4">
          {/* create thre tab history , profile, and settings */}
          <div className="flex space-x-4">
            <Button
              label="History"
              variant={activeTab === "history" ? "primary" : "secondary"}
              onClick={() => setActiveTab("history")}
            />
            <Button
              label="Application Analysis"
              variant={activeTab === "applicationAnalysis" ? "primary" : "secondary"}
              onClick={() => setActiveTab("applicationAnalysis")}
            />
            <Button
              label="App viewer"
              variant={activeTab === "appViewer" ? "primary" : "secondary"}
              onClick={() => setActiveTab("appViewer")}
            />
            <Button
              label="Form Versions"
              variant={activeTab === "formVersions" ? "primary" : "secondary"}
              onClick={() => setActiveTab("formVersions")}
            />
          </div>
        </div>
        {activeTab === "history" && <History submittedFormId={applicantId} />}
        {activeTab === "applicationAnalysis" && <ApplicationAnalysis submitFormData={submitFormData?.data} />}
        {activeTab === "appViewer" && <AppViewer data={submitFormData?.data} />}
        {activeTab === "formVersions" && (
          <FormVersions submittedFormId={applicantId} submitForm={submitFormData?.data} />
        )}
      </div>
    </>
  );
}

export default OnBoarding;
