import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { AI_FIELD_IDS, KEYBOARD_KEYS } from "../utils/applicant.constants";
import { formatOtpDisplayHtml } from "../utils/applicant.utils6";
import HtmlContent from "@/components/shared/HtmlContent";

const ApplicantEmailVerification = ({
  formDocument = {},
  isCreator = false,
  email = "",
  otp = "",
  otpSent = false,
  otpLoading = false,
  emailLoading = false,
  onEmailChange,
  onOtpChange,
  onSendOtp,
  onVerifyOtp,
  onEditDisplayText,
  onSkip,
}) => (
  <div className="flex flex-col items-center gap-3 w-full">
    {isCreator && (
      <div className="flex w-full items-center justify-end">
        <Button label="Edit OTP Display Text" onClick={onEditDisplayText} />
      </div>
    )}
    {formDocument?.otpDisplayFormatedText && (
      <div className="flex w-full justify-center">
        <HtmlContent
          className="w-full p-4 lg:px-20"
          data-ai-display-text
          html={formatOtpDisplayHtml(formDocument?.otpDisplayFormatedText)}
          linkMode="none"
        />
      </div>
    )}
    <div className="flex w-full items-center justify-center gap-4">
      <TextField
        data-testid="verification-email-input"
        id={AI_FIELD_IDS.EMAIL}
        name={AI_FIELD_IDS.EMAIL}
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => onEmailChange?.(e.target.value)}
        className="max-w-125"
        autoFocus={!otpSent}
        onKeyDown={(e) => {
          if (e.key === KEYBOARD_KEYS.ENTER) onSendOtp?.();
        }}
      />
      <Button
        onClick={onSendOtp}
        disabled={otpLoading}
        className={`min-w-32.5 py-2 ${otpLoading && "cursor-not-allowed opacity-25"}`}
        label="Send Code"
        data-testid="verification-send-otp-btn"
      />
    </div>
    {otpSent && (
      <div className="flex w-full items-center justify-center gap-4">
        <TextField
          data-testid="verification-otp-input"
          id={AI_FIELD_IDS.OTP}
          name={AI_FIELD_IDS.OTP}
          type="text"
          placeholder="Enter your Code"
          value={otp}
          onChange={(e) => onOtpChange?.(e.target.value)}
          className="max-w-125"
          autoFocus={otpSent}
          onKeyDown={(e) => {
            if (e.key === KEYBOARD_KEYS.ENTER) onVerifyOtp?.();
          }}
        />
        <Button
          onClick={onVerifyOtp}
          disabled={emailLoading}
          className={`min-w-32.5 py-2 ${emailLoading && "cursor-not-allowed opacity-25"}`}
          label="Submit Code"
          data-testid="verification-submit-otp-btn"
        />
      </div>
    )}
    {isCreator && <Button onClick={onSkip} className="w-full max-w-162.5" variant="secondary" label="Skip" />}
  </div>
);

export default ApplicantEmailVerification;
