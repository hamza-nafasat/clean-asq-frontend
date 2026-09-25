import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useSendOtpMutation, useVerifyEmailMutation } from "@/redux/apis/applicant.apis";
import { userExist, userNotExist } from "@/redux/slices/auth.slice";
import { updateEmailVerified } from "@/redux/slices/form.slice";
import { HTTP_STATUSES } from "@/constants";
import { AI_FIELD_IDS } from "@/modules/applicant/utils/applicant.constants";
import { getOtpBlockedUntil } from "@/modules/applicant/utils/applicant.otp.utils";
import { buildVerificationPath } from "@/modules/applicant/utils/applicant.utils6";

// email + one-time code verification for the applicant
const useApplicantEmailOtp = ({ formId, draftId, brandingName, navigatingAwayRef }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [blockedUntil, setBlockedUntil] = useState(0);
  const [loadingForValidatingOtp, setLoadingForValidatingOtp] = useState(false);
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [sendOtp, { isLoading: otpLoading }] = useSendOtpMutation();
  const [verifyEmail, { isLoading: emailLoading }] = useVerifyEmailMutation();

  const refreshUserProfile = useCallback(
    () =>
      getUserProfile()
        .then((res) => {
          if (res?.data?.success) dispatch(userExist(res.data.data));
          else dispatch(userNotExist());
        })
        .catch(() => dispatch(userNotExist())),
    [dispatch, getUserProfile],
  );

  const showOtpError = useCallback((error, fallbackMessage) => {
    const message = error?.data?.message || fallbackMessage;
    setOtpError(message);
    if (error?.status === HTTP_STATUSES.TOO_MANY_REQUESTS) setBlockedUntil(getOtpBlockedUntil(message));
  }, []);

  const handleSendOtp = useCallback(async () => {
    try {
      if (!email) return toast.error("Please enter your email");
      const res = await sendOtp({ email, formId }).unwrap();
      if (res.success) {
        setOtpError("");
        setOtpSent(true);
        toast.success(res.message);
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      showOtpError(error, "Failed to send code");
    }
  }, [email, formId, sendOtp, showOtpError]);

  const handleVerifyOtp = useCallback(async () => {
    try {
      if (!email || !otp) return toast.error("Please enter your email and otp");
      setLoadingForValidatingOtp(true);
      const res = await verifyEmail({ email, otp, formId }).unwrap();
      if (res.success) {
        setOtpError("");
        await dispatch(updateEmailVerified(true));
        await refreshUserProfile();
        // company verification comes next, it returns here for the QR code
        navigatingAwayRef.current = true;
        navigate(buildVerificationPath(formId, brandingName, draftId));
      }
    } catch (error) {
      console.error("Verify email error:", error);
      showOtpError(error, "Failed to verify code");
    } finally {
      setLoadingForValidatingOtp(false);
    }
  }, [
    brandingName,
    dispatch,
    draftId,
    email,
    formId,
    navigate,
    navigatingAwayRef,
    otp,
    refreshUserProfile,
    showOtpError,
    verifyEmail,
  ]);

  // unblock once the wait is over
  useEffect(() => {
    if (!blockedUntil) return;
    const timer = setTimeout(() => {
      setBlockedUntil(0);
      setOtpError("");
    }, blockedUntil - Date.now());
    return () => clearTimeout(timer);
  }, [blockedUntil]);

  // focus the code field once it appears
  useEffect(() => {
    if (otpSent) setTimeout(() => document.getElementById(AI_FIELD_IDS.OTP)?.focus(), 50);
  }, [otpSent]);

  return {
    email,
    setEmail,
    otp,
    setOtp,
    otpSent,
    setOtpSent,
    otpError,
    isOtpBlocked: Boolean(blockedUntil),
    loadingForValidatingOtp,
    setLoadingForValidatingOtp,
    otpLoading,
    emailLoading,
    sendOtp,
    verifyEmail,
    refreshUserProfile,
    handleSendOtp,
    handleVerifyOtp,
  };
};

export default useApplicantEmailOtp;
