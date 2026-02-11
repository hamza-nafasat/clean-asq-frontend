import Button from "@/components/shared/small/Button";
import { useGetSingleSubmitFormQueryQuery } from "@/redux/apis/formApis";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { History } from "@/components/onBoarding/History";
import { VerificationAndAlerts } from "@/components/onBoarding/VerificationAndAlerts";
import { AppViewer } from "@/components/onBoarding/AppViewer";

function OnBoarding() {
  const { applicantId } = useParams();
  const [activeTab, setActiveTab] = useState('history');
  const { data } = useGetSingleSubmitFormQueryQuery({ _id: applicantId }, { skip: !applicantId });

  return (
    <>
      <div className="bg-backgroundColor rounded-t-md p-4">
        <div className="mb-4">
          {/* create thre tab history , profile, and settings */}
          <div className="flex space-x-4">
            <Button label="History" variant={activeTab === 'history' ? 'primary' : 'secondary'} onClick={() => setActiveTab('history')} />
            <Button label="Verification & Alerts" variant={activeTab === 'verification' ? 'primary' : 'secondary'} onClick={() => setActiveTab('verification')} />
            <Button label="App viewer" variant={activeTab === 'appViewer' ? 'primary' : 'secondary'} onClick={() => setActiveTab('appViewer')} />
          </div>
        </div>
        {activeTab === 'history' && <History submittedFormId={applicantId} />}
        {activeTab === 'verification' && < VerificationAndAlerts data={data?.data} />}
        {activeTab === 'appViewer' && <AppViewer data={data?.data} />}
      </div>
    </>
  );
}

export default OnBoarding;
