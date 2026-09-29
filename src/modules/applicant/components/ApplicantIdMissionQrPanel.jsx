import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import ApplicantLoadingWithTimer from "./ApplicantLoadingWithTimer";

const ApplicantIdMissionQrPanel = ({
  qrCode = "",
  isProcessing = false,
  isRefreshDisabled = false,
  setIsProcessing,
  onRefresh,
}) => (
  <div className="flex items-center justify-center w-full">
    {isProcessing ? (
      <ApplicantLoadingWithTimer setIsProcessing={setIsProcessing} />
    ) : (
      <div className="flex flex-col gap-4">
        <div className="mt-4 flex w-full flex-col items-center gap-4">
          {qrCode ? (
            <img className="h-57.5 w-57.5" src={`data:image/jpeg;base64,${qrCode}`} alt="qr code " />
          ) : (
            <CustomLoading />
          )}
        </div>
        <div className="mt-4 flex w-full flex-col items-center gap-4">
          <Button
            className="w-full max-w-57.5"
            disabled={isRefreshDisabled}
            label="Refresh QR Code"
            onClick={onRefresh}
          />
        </div>
      </div>
    )}
  </div>
);

export default ApplicantIdMissionQrPanel;
