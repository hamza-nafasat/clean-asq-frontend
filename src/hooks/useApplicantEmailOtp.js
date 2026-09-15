import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useSendOtpMutation, useVerifyEmailMutation } from "@/redux/apis/applicant.apis";
import { userExist, userNotExist } from "@/redux/slices/auth.slice";
import { updateEmailVerified } from "@/redux/slices/form.slice";
import { AI_FIELD_IDS } from "@/modules/applicant/utils/applicant.constants";
import { buildVerificationPath } from "@/modules/applicant/utils/applicant.utils6";

// email + one-time code verification for the applicant
const useApplicantEmailOtp = ({ formId, draftId, brandingName, navigatingAwayRef }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  const handleSendOtp = useCallback(async () => {
    try {
      if (!email) return toast.error("Please enter your email");
      const res = await sendOtp({ email, formId }).unwrap();
      if (res.success) {
        setOtpSent(true);
        toast.success(res.message);
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error(error?.data?.message || "Failed to send OTP");
    }
  }, [email, formId, sendOtp]);

  const handleVerifyOtp = useCallback(async () => {
    try {
      if (!email || !otp) return toast.error("Please enter your email and otp");
      setLoadingForValidatingOtp(true);
      const res = await verifyEmail({ email, otp, formId }).unwrap();
      if (res.success) {
        await dispatch(updateEmailVerified(true));
        await refreshUserProfile();
        // company verification comes next, it returns here for the QR code
        navigatingAwayRef.current = true;
        navigate(buildVerificationPath(formId, brandingName, draftId));
      }
    } catch (error) {
      console.error("Verify email error:", error);
      toast.error(error?.data?.message || "Failed to send OTP");
    } finally {
      setLoadingForValidatingOtp(false);
    }
  }, [brandingName, dispatch, draftId, email, formId, navigate, navigatingAwayRef, otp, refreshUserProfile, verifyEmail]);

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
