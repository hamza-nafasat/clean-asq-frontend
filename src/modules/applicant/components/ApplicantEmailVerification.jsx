import Button from "@/components/shared/Button";
import HtmlContent from "@/components/shared/HtmlContent";
import TextField from "@/components/shared/TextField";
import { KEYBOARD_KEYS } from "@/constants";
import { AI_FIELD_IDS } from "../utils/applicant.constants";
import { formatOtpDisplayHtml } from "../utils/applicant.page.utils";

const OTP_ERROR_ID = "verification-otp-error";

const ApplicantEmailVerification = ({
  formDocument = {},
  canEditFormText = false,
  canSkip = false,
  emailError = "",
  otpError = "",
  isBlocked = false,
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
    {canEditFormText && (
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
        error={emailError}
        onChange={(e) => onEmailChange?.(e.target.value)}
        className="max-w-125"
        autoFocus={!otpSent}
        onKeyDown={(e) => {
          if (e.key === KEYBOARD_KEYS.ENTER && !isBlocked) onSendOtp?.();
        }}
      />
      <Button
        onClick={onSendOtp}
        disabled={otpLoading || isBlocked}
        className={`min-w-32.5 py-2 ${otpLoading || isBlocked ? "cursor-not-allowed opacity-25" : ""}`}
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
          aria-invalid={Boolean(otpError)}
          aria-describedby={otpError ? OTP_ERROR_ID : undefined}
          onKeyDown={(e) => {
            if (e.key === KEYBOARD_KEYS.ENTER && !isBlocked) onVerifyOtp?.();
          }}
        />
        <Button
          onClick={onVerifyOtp}
          disabled={emailLoading || isBlocked}
          className={`min-w-32.5 py-2 ${emailLoading || isBlocked ? "cursor-not-allowed opacity-25" : ""}`}
          label="Submit Code"
          data-testid="verification-submit-otp-btn"
        />
      </div>
    )}
    {otpError && (
      <p id={OTP_ERROR_ID} role="alert" className="w-full max-w-162.5 text-sm text-red-600">
        {otpError}
      </p>
    )}
    {canSkip && <Button onClick={onSkip} className="w-full max-w-162.5" variant="secondary" label="Skip" />}
  </div>
);

export default ApplicantEmailVerification;
