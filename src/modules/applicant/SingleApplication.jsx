import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetSingleFormQueryQuery } from "@/redux/apis/form.apis";
import { updateEmailVerified, updateFormHeaderAndFooter } from "@/redux/slices/form.slice";
import { toast } from "react-toastify";
import useApplicantAddressAutocomplete from "./hooks/useApplicantAddressAutocomplete";
import useApplicantEmailOtp from "./hooks/useApplicantEmailOtp";
import useApplicantFocusFirstInput from "./hooks/useApplicantFocusFirstInput";
import useApplicantIdMissionDraft from "./hooks/useApplicantIdMissionDraft";
import useApplicantIdMissionQr from "./hooks/useApplicantIdMissionQr";
import useApplicantIdMissionSocket from "./hooks/useApplicantIdMissionSocket";
import useApplicantIdMissionSubmit from "./hooks/useApplicantIdMissionSubmit";
import useApplicantSingleApplicationAi from "./hooks/useApplicantSingleApplicationAi";
import useApplyBranding from "@/hooks/useApplyBranding";
import { usePageDownload } from "./hooks/usePageDownload";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import ApplicantEmailVerification from "./components/ApplicantEmailVerification";
import ApplicantIdMissionDetailsForm from "./components/ApplicantIdMissionDetailsForm";
import ApplicantIdMissionQrStep from "./components/ApplicantIdMissionQrStep";
import { LoadingWithTimer } from "./components/ApplicantLoadingWithTimer";
import ApplicantPersonalizingLoader from "./components/ApplicantPersonalizingLoader";
import ApplicantSingleApplicationModals from "./components/ApplicantSingleApplicationModals";
import {
  AI_FIELD_IDS,
  DEFAULT_HEADER_FOOTER,
  SECTION_TITLES,
  SINGLE_APPLICATION_MODALS,
  SINGLE_APPLICATION_STAGES,
} from "./utils/applicant.constants";
import {
  areIdMissionFieldsFilled,
  buildInitialIdMissionData,
  getIdMissionSignDisplayHtml,
  uploadIdMissionSignature,
} from "./utils/applicant.utils5";
import {
  buildStepperPath,
  buildVerificationPath,
  collectIdMissionFieldRows,
  focusNextInputOnEnter,
} from "./utils/applicant.utils6";
import { isNotGuestRoleValue } from "@/utils/permissions";

const SingleApplication = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { formId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const { emailVerified, currentDraftId } = useSelector((state) => state.form);
  // each application writes to its own draft
  const draftId = searchParams.get("draftId") || currentDraftId;
  const [isIdMissionProcessing, setIsIdMissionProcessing] = useState(false);
  const [idMissionVerified, setIdMissionVerified] = useState(false);
  // details show only after their data is committed
  const [idMissionDetailsReady, setIdMissionDetailsReady] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [idMissionVerifiedData, setIdMissionVerifiedData] = useState(() => buildInitialIdMissionData(user?.email));
  const idMissionFormRef = useRef(null);
  const initialDataLoadRef = useRef(null);
  const navigatingAwayRef = useRef(false);
  const idMissionScanAppliedRef = useRef(false);
  const idMissionManualEntryRef = useRef(false);
  const submitFromEnterRef = useRef(null);

  const { data: form, refetch: formRefetch, isLoading: isFormLoading } = useGetSingleFormQueryQuery({ _id: formId });
  const { isApplied, isApplying } = useApplyBranding({ formId });
  const brandingName = form?.data?.branding?.name;
  const otpFlow = useApplicantEmailOtp({ formId, draftId, brandingName, navigatingAwayRef });
  const { email, otp, otpSent, loadingForValidatingOtp, refreshUserProfile } = otpFlow;
  const qrFlow = useApplicantIdMissionQr();
  const { qrCode, webLink, getQrAndWebLink } = qrFlow;
  const { onLoad, onPlaceChanged } = useApplicantAddressAutocomplete(setIdMissionVerifiedData);

  const idMissionSection = form?.data?.sections?.find(
    (sec) => sec?.title?.toLowerCase() === SECTION_TITLES.ID_VERIFICATION,
  );
  const isCreator = user?._id && user?._id === form?.data?.owner && isNotGuestRoleValue(user);
  const isAllRequiredFieldsFilled = areIdMissionFieldsFilled(idMissionVerifiedData);
  const hasDetailsData =
    idMissionManualEntryRef.current || !!idMissionVerifiedData?.name?.value || !!idMissionVerifiedData?.idNumber?.value;
  const idMissionDetailsVisible = idMissionVerified && idMissionDetailsReady && !isIdMissionProcessing && hasDetailsData;
  const aiStage =
    !emailVerified || navigatingAwayRef.current
      ? SINGLE_APPLICATION_STAGES.EMAIL
      : !idMissionVerified
        ? SINGLE_APPLICATION_STAGES.IDMISSION_QR
        : !idMissionDetailsVisible
          ? SINGLE_APPLICATION_STAGES.IDMISSION_LOADING
          : SINGLE_APPLICATION_STAGES.IDMISSION_DETAILS;

  const {
    buttonLabel: downloadLabel,
    shouldShow: showDownload,
    handleDownload,
    isDownloading,
  } = usePageDownload({
    pageName: idMissionSection?.name || "Identity Verification",
    displayHtml: form?.data?.idMissionDataDisplayFormatedText || "",
    userName: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null,
    userEmail: user?.email || null,
    signDisplayHtml: getIdMissionSignDisplayHtml(form?.data, idMissionSection) || null,
    getHasFields: () => !!(idMissionVerified && idMissionDetailsReady),
    getFieldRows: () => collectIdMissionFieldRows(idMissionFormRef.current),
    signatureUrl: () => idMissionVerifiedData?.signature?.value?.secureUrl || null,
  });

  const handleSignature = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please add signature");
      const value = await uploadIdMissionSignature(file, idMissionVerifiedData?.signature);
      if (!value) return toast.error("Something went wrong while uploading image");
      setIdMissionVerifiedData((prev) => ({ ...prev, signature: { name: "signature", value } }));
      toast.success("Signature uploaded successfully");
    } catch (error) {
      console.error("Upload signature error:", error);
      toast.error("Something went wrong while uploading image");
    } finally {
      setIsSaving?.(false);
    }
  };

  const { getSavedFormDataAndSaveInRedux, getQrLinkOnEmailVerified } = useApplicantIdMissionDraft({
    ...qrFlow,
    formId,
    draftId,
    email,
    brandingName,
    idMissionScanAppliedRef,
    navigatingAwayRef,
    setIdMissionVerifiedData,
    setIdMissionVerified,
    setIdMissionDetailsReady,
  });

  useApplicantSingleApplicationAi({
    ...otpFlow,
    aiStage,
    formRef: idMissionFormRef,
    emailVerified,
    webLink,
    idMissionDetailsReady,
    idMissionDetailsVisible,
    idMissionVerifiedData,
    isIdMissionProcessing,
  });

  const submitIdMissionData = useApplicantIdMissionSubmit({ formId, draftId, idMissionVerifiedData, setSubmiting });

  // header and footer text for the layout
  useEffect(() => {
    const { footerText, headerText, name, headerTextSize } = form?.data || {};
    if (footerText || name || headerText || headerTextSize) {
      dispatch(updateFormHeaderAndFooter({ headerText, footerText, headerTextSize }));
    }
    return () => {
      dispatch(updateFormHeaderAndFooter({ ...DEFAULT_HEADER_FOOTER, headerTextSize: 24 }));
    };
  }, [dispatch, form?.data]);

  useEffect(() => {
    if (!qrCode && !webLink && !idMissionVerified) getQrLinkOnEmailVerified();
  }, [getQrLinkOnEmailVerified, idMissionVerified, qrCode, webLink]);

  // keep the promise so manual entry waits for the prefill
  useEffect(() => {
    if (emailVerified && !idMissionVerified) {
      initialDataLoadRef.current = getSavedFormDataAndSaveInRedux({ skipRedirectOnError: true });
    }
  }, [emailVerified, idMissionVerified, getSavedFormDataAndSaveInRedux]);

  useEffect(() => {
    if (aiStage === SINGLE_APPLICATION_STAGES.IDMISSION_QR && !qrCode) getQrAndWebLink();
  }, [aiStage, qrCode, getQrAndWebLink]);

  // focus the email field once the loading screen is gone
  useEffect(() => {
    if (!isApplied || isFormLoading || isApplying || emailVerified) return;
    setTimeout(() => document.getElementById(AI_FIELD_IDS.EMAIL)?.focus(), 100);
  }, [isApplied, isFormLoading, isApplying, emailVerified]);

  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]);

  useApplicantIdMissionSocket({
    idMissionScanAppliedRef,
    idMissionManualEntryRef,
    setIdMissionVerifiedData,
    setIdMissionVerified,
    setIdMissionDetailsReady,
    setIsIdMissionProcessing,
  });
  useApplicantFocusFirstInput(idMissionFormRef, idMissionVerified);

  const handleIdMissionEnter = useCallback(
    (e) => focusNextInputOnEnter(e, idMissionFormRef.current, (event) => submitFromEnterRef.current?.(event)),
    [],
  );
  submitFromEnterRef.current = isAllRequiredFieldsFilled && !submiting ? submitIdMissionData : null;

  const closeModal = () => setActiveModal(null);
  const handleSkipEmail = () => {
    dispatch(updateEmailVerified(true));
    navigate(buildVerificationPath(formId, brandingName, draftId));
  };
  const handleManualEntry = async () => {
    if (initialDataLoadRef.current) await initialDataLoadRef.current;
    // manual entry shows details even with empty draft fields
    idMissionManualEntryRef.current = true;
    setIdMissionVerified(true);
    setIdMissionDetailsReady(true);
  };

  if (!isApplied || loadingForValidatingOtp || isFormLoading || isApplying) return <CustomLoading />;

  if (submiting) return <ApplicantPersonalizingLoader />;

  return (
    <>
      <ApplicantSingleApplicationModals
        activeModal={activeModal}
        formDocument={form?.data}
        section={idMissionSection}
        formRefetch={formRefetch}
        onClose={closeModal}
      />
      {isIdMissionProcessing || (idMissionVerified && !(idMissionDetailsReady && hasDetailsData)) ? (
        <LoadingWithTimer setIsProcessing={setIsIdMissionProcessing} />
      ) : (
        <div className="mt-14 text-center" data-testid="single-application">
          {showDownload && (
            <div className="flex justify-end mb-2 px-2">
              <Button variant="secondary" onClick={handleDownload} label={downloadLabel} disabled={isDownloading} />
            </div>
          )}
          {idMissionVerified ? (
            <ApplicantIdMissionDetailsForm
              formDocument={form?.data}
              section={idMissionSection}
              isCreator={isCreator}
              data={idMissionVerifiedData}
              setData={setIdMissionVerifiedData}
              formRef={idMissionFormRef}
              isAllRequiredFieldsFilled={isAllRequiredFieldsFilled}
              isSubmitting={submiting}
              onKeyDown={handleIdMissionEnter}
              onPlaceLoad={onLoad}
              onPlaceChanged={onPlaceChanged}
              onCustomizeText={() => setActiveModal(SINGLE_APPLICATION_MODALS.ID_MISSION_DATA_TEXT)}
              onEnableHelp={() => setActiveModal(SINGLE_APPLICATION_MODALS.SIGNATURE_HELP)}
              onCustomizeSignature={() => setActiveModal(SINGLE_APPLICATION_MODALS.SIGNATURE)}
              onOpenSignHelp={() => setActiveModal(SINGLE_APPLICATION_MODALS.SIGN_AI_HELP)}
              onSaveSignature={handleSignature}
              onSkip={() => navigate(buildStepperPath(formId, draftId))}
              onSubmit={submitIdMissionData}
            />
          ) : !emailVerified ? (
            <ApplicantEmailVerification
              formDocument={form?.data}
              isCreator={isCreator}
              email={email}
              otp={otp}
              otpSent={otpSent}
              otpLoading={otpFlow.otpLoading}
              emailLoading={otpFlow.emailLoading}
              onEmailChange={otpFlow.setEmail}
              onOtpChange={otpFlow.setOtp}
              onSendOtp={otpFlow.handleSendOtp}
              onVerifyOtp={otpFlow.handleVerifyOtp}
              onEditDisplayText={() => setActiveModal(SINGLE_APPLICATION_MODALS.OTP_TEXT)}
              onSkip={handleSkipEmail}
            />
          ) : qrFlow.qrLoading ? (
            <CustomLoading />
          ) : (
            <ApplicantIdMissionQrStep
              section={idMissionSection}
              isCreator={isCreator}
              qrCode={qrCode}
              qrFetchError={qrFlow.qrFetchError}
              onCustomizeText={() => setActiveModal(SINGLE_APPLICATION_MODALS.ID_MISSION_SECTION_TEXT)}
              onRefresh={getQrAndWebLink}
              onManualEntry={handleManualEntry}
            />
          )}
        </div>
      )}
    </>
  );
};

export default SingleApplication;
