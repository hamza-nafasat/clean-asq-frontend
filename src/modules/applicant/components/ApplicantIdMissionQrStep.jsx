import Button from "@/components/shared/Button";
import { withLinkTargets } from "../utils/applicant.utils6";

const ApplicantIdMissionQrStep = ({
  section = {},
  isCreator = false,
  qrCode = "",
  qrFetchError = false,
  onCustomizeText,
  onRefresh,
  onManualEntry,
}) => (
  <div className="flex flex-col items-center gap-3">
    {isCreator && (
      <div className="flex w-full items-center justify-end p-4">
        <Button onClick={onCustomizeText} label="Customize Display Text" />
      </div>
    )}
    {(section?.ai_formatting || section?.displayText) && (
      <div className="flex w-full gap-3">
        <div
          className="w-full"
          data-ai-display-text
          dangerouslySetInnerHTML={{ __html: withLinkTargets(section?.ai_formatting || section?.displayText) }}
        />
      </div>
    )}
    <div className="mt-4 flex w-full flex-col items-center gap-4">
      {qrCode ? (
        <img
          data-testid="idmission-qr-code"
          className="h-57.5 w-57.5"
          src={`data:image/jpeg;base64,${qrCode}`}
          alt="qr code "
        />
      ) : qrFetchError ? (
        <p className="max-w-57.5 text-center text-sm text-gray-500">
          QR code could not be loaded. Use the refresh button to try again, or enter your ID details manually below.
        </p>
      ) : null}
    </div>
    <div className="mt-4 flex w-full flex-col items-center gap-4">
      <Button
        data-testid="idmission-refresh-qr-btn"
        className="w-full max-w-57.5"
        label="Refresh QR Code"
        onClick={onRefresh}
      />
    </div>
    <Button
      onClick={onManualEntry}
      className="w-full max-w-57.5"
      variant="secondary"
      data-testid="idmission-manual-entry-btn"
      label="Enter ID Details Manually"
    />
  </div>
);

export default ApplicantIdMissionQrStep;
