import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useGetSingleFormQueryQuery } from "@/redux/apis/form.apis";
import { updateEmailVerified, updateFormHeaderAndFooter } from "@/redux/slices/form.slice";
import useApplyBranding from "@/hooks/useApplyBranding";
import usePermission from "@/hooks/usePermission";
import ErrorBoundary from "@/components/global/ErrorBoundary";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import useApplicantAddressAutocomplete from "./hooks/useApplicantAddressAutocomplete";
import useApplicantEmailOtp from "./hooks/useApplicantEmailOtp";
import useApplicantFocusFirstInput from "./hooks/useApplicantFocusFirstInput";
import useApplicantIdMissionDraft from "./hooks/useApplicantIdMissionDraft";
import useApplicantIdMissionQr from "./hooks/useApplicantIdMissionQr";
import useApplicantIdMissionSocket from "./hooks/useApplicantIdMissionSocket";
import useApplicantIdMissionSubmit from "./hooks/useApplicantIdMissionSubmit";
import useApplicantPageDownload from "./hooks/useApplicantPageDownload";
import useApplicantSingleApplicationAi from "./hooks/useApplicantSingleApplicationAi";
import ApplicantEmailVerification from "./components/ApplicantEmailVerification";
import ApplicantIdMissionDetailsForm from "./components/ApplicantIdMissionDetailsForm";
import ApplicantIdMissionQrStep from "./components/ApplicantIdMissionQrStep";
import ApplicantLoadingWithTimer from "./components/ApplicantLoadingWithTimer";
import ApplicantPersonalizingLoader from "./components/ApplicantPersonalizingLoader";
import ApplicantSingleApplicationModals from "./components/ApplicantSingleApplicationModals";
import { SECTION_TITLES, SIGNATURE_KEY, VERIFICATION_PARAMS } from "@/constants";
import {
  AI_FIELD_IDS,
  DEFAULT_HEADER_FOOTER,
  DEFAULT_HEADER_TEXT_SIZE,
  SINGLE_APPLICATION_MODALS,
  SINGLE_APPLICATION_STAGES,
} from "./utils/applicant.constants";
import {
  areIdMissionFieldsFilled,
  buildInitialIdMissionData,
  getIdMissionSignDisplayHtml,
} from "./utils/applicant.idMission.utils";
import { collectIdMissionFieldRows } from "./utils/applicant.page.utils";
import { uploadIdMissionSignature } from "./utils/applicant.signature.utils";
import { buildStepperPath, buildVerificationPath } from "@/utils/applicationPaths";
import { PERMISSIONS } from "@/utils/permissions";

// which screen the AI assistant is helping with
const getAiStage = ({ emailVerified, isLeaving, idMissionVerified, idMissionDetailsVisible }) => {
  if (!emailVerified || isLeaving) return SINGLE_APPLICATION_STAGES.EMAIL;
  if (!idMissionVerified) return SINGLE_APPLICATION_STAGES.IDMISSION_QR;
  return idMissionDetailsVisible
    ? SINGLE_APPLICATION_STAGES.IDMISSION_DETAILS
    : SINGLE_APPLICATION_STAGES.IDMISSION_LOADING;
};

const SingleApplication = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { formId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const { emailVerified, currentDraftId, currentDraftFormId } = useSelector((state) => state.form);
  // each application writes to its own draft
  const draftId =
    searchParams.get(VERIFICATION_PARAMS.DRAFT_ID) || (currentDraftFormId === formId ? currentDraftId : null);
  const [isIdMissionProcessing, setIsIdMissionProcessing] = useState(false);
  const [idMissionVerified, setIdMissionVerified] = useState(false);
  // details show only after their data is committed
  const [idMissionDetailsReady, setIdMissionDetailsReady] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [idMissionVerifiedData, setIdMissionVerifiedData] = useState(() => buildInitialIdMissionData(user?.email));
  const idMissionFormRef = useRef(null);
  const draftLoadRef = useRef(null);
  const idMissionScanAppliedRef = useRef(false);
  const submitFromEnterRef = useRef(null);

  const { data: form, refetch: formRefetch, isLoading: isFormLoading } = useGetSingleFormQueryQuery({ _id: formId });
  const { isApplied, isApplying } = useApplyBranding({ formId });
  const formDocument = form?.data;
  const brandingName = formDocument?.branding?.name;
  const leave = useCallback(() => setIsLeaving(true), []);
  const otpFlow = useApplicantEmailOtp({ formId, draftId, brandingName, onLeave: leave });
  const { email, otp, otpSent, loadingForValidatingOtp, refreshUserProfile } = otpFlow;
  const qrFlow = useApplicantIdMissionQr();
  const { qrCode, webLink, getQrAndWebLink } = qrFlow;
  const { onLoad, onPlaceChanged } = useApplicantAddressAutocomplete(setIdMissionVerifiedData);

  const idMissionSection = formDocument?.sections?.find(
    (section) => section?.title?.toLowerCase() === SECTION_TITLES.ID_VERIFICATION,
  );
  const canCustomizeForm = usePermission(PERMISSIONS.CUSTOMIZE_FORM);
  const canUpdateForm = usePermission(PERMISSIONS.UPDATE_FORM);
  const canUseIdMission = usePermission(PERMISSIONS.ID_MISSION);
  const canEnterIdManually = usePermission(PERMISSIONS.ENTER_ID_MANUALLY);
  const isSignedIn = Boolean(user?._id);
  const isOwner = isSignedIn && user._id === formDocument?.owner;
  const canCustomize = isOwner && canCustomizeForm;
  const canEditFormText = isOwner && canUpdateForm;
  const isIdStepSkipped = !canUseIdMission && !canEnterIdManually;
  const isAllRequiredFieldsFilled = areIdMissionFieldsFilled(idMissionVerifiedData);
  const hasDetailsData =
    isManualEntry || !!idMissionVerifiedData?.name?.value || !!idMissionVerifiedData?.idNumber?.value;
  const idMissionDetailsVisible =
    idMissionVerified && idMissionDetailsReady && !isIdMissionProcessing && hasDetailsData;
  const isDetailsLoading = isIdMissionProcessing || (idMissionVerified && !(idMissionDetailsReady && hasDetailsData));
  const aiStage = getAiStage({ emailVerified, isLeaving, idMissionVerified, idMissionDetailsVisible });

  const {
    buttonLabel: downloadLabel,
    shouldShow: showDownload,
    handleDownload,
    isDownloading,
  } = useApplicantPageDownload({
    pageName: idMissionSection?.name || "Identity Verification",
    displayHtml: formDocument?.idMissionDataDisplayFormatedText || "",
    userName: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null,
    userEmail: user?.email || null,
    signDisplayHtml: getIdMissionSignDisplayHtml(formDocument, idMissionSection) || null,
    getHasFields: () => !!(idMissionVerified && idMissionDetailsReady),
    getFieldRows: () => collectIdMissionFieldRows(idMissionFormRef.current),
    signatureUrl: () => idMissionVerifiedData?.signature?.value?.secureUrl || null,
  });

  const showIdMissionDetails = useCallback(() => {
    setIdMissionVerified(true);
    setIdMissionDetailsReady(true);
  }, []);

  const handleSignature = async (file, setIsSaving, stamp) => {
    try {
      if (!file) return toast.error("Please add signature");
      const value = await uploadIdMissionSignature(file, idMissionVerifiedData?.signature?.value, stamp);
      if (!value) return toast.error("Something went wrong while uploading image");
      setIdMissionVerifiedData((prev) => ({ ...prev, signature: { name: SIGNATURE_KEY, value } }));
      toast.success("Signature uploaded successfully");
    } catch (error) {
      console.error("Upload signature error:", error);
      toast.error("Something went wrong while uploading image");
    } finally {
      setIsSaving?.(false);
    }
  };

  const { loadDraft, restoreDraftIdentity } = useApplicantIdMissionDraft({
    formId,
    draftId,
    email,
    idMissionScanAppliedRef,
    setIdMissionVerifiedData,
    showIdMissionDetails,
  });

  useApplicantSingleApplicationAi({
    ...otpFlow,
    formId,
    aiStage,
    formRef: idMissionFormRef,
    emailVerified,
    webLink,
    idMissionSection,
  });

  const submitIdMissionData = useApplicantIdMissionSubmit({ formId, draftId, idMissionVerifiedData, setIsSubmitting });

  // header and footer text for the layout
  useEffect(() => {
    const { footerText, headerText, name, headerTextSize } = formDocument || {};
    if (footerText || name || headerText || headerTextSize) {
      dispatch(updateFormHeaderAndFooter({ headerText, footerText, headerTextSize }));
    }
    return () => {
      dispatch(updateFormHeaderAndFooter({ ...DEFAULT_HEADER_FOOTER, headerTextSize: DEFAULT_HEADER_TEXT_SIZE }));
    };
  }, [dispatch, formDocument]);

  useEffect(() => {
    if (!idMissionVerified) restoreDraftIdentity();
  }, [idMissionVerified, restoreDraftIdentity]);

  // keep the promise so manual entry waits for the prefill
  useEffect(() => {
    if (emailVerified && !idMissionVerified) draftLoadRef.current = loadDraft();
  }, [emailVerified, idMissionVerified, loadDraft]);

  // the one place the QR code is requested
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

  // no ID permission skips the ID step
  useEffect(() => {
    if (!emailVerified || idMissionVerified || !isIdStepSkipped || isLeaving) return;
    setIsLeaving(true);
    navigate(buildStepperPath({ formId, draftId }));
  }, [draftId, emailVerified, formId, idMissionVerified, isIdStepSkipped, isLeaving, navigate]);

  useApplicantIdMissionSocket({
    idMissionScanAppliedRef,
    setIsManualEntry,
    setIdMissionVerifiedData,
    setIdMissionVerified,
    setIdMissionDetailsReady,
    setIsIdMissionProcessing,
  });
  useApplicantFocusFirstInput(idMissionFormRef, idMissionVerified);

  submitFromEnterRef.current = isAllRequiredFieldsFilled && !isSubmitting ? submitIdMissionData : null;

  const closeModal = () => setActiveModal(null);
  const handleSkipEmail = () => {
    dispatch(updateEmailVerified(true));
    navigate(buildVerificationPath({ formId, brandingName, draftId }));
  };
  const handleManualEntry = async () => {
    if (draftLoadRef.current) await draftLoadRef.current;
    // manual entry shows details even with empty draft fields
    setIsManualEntry(true);
    showIdMissionDetails();
  };

  if (!isApplied || loadingForValidatingOtp || isFormLoading || isApplying) return <CustomLoading />;

  if (isSubmitting) return <ApplicantPersonalizingLoader />;

  return (
    <>
      <ApplicantSingleApplicationModals
        activeModal={activeModal}
        formDocument={formDocument}
        section={idMissionSection}
        formRefetch={formRefetch}
        onClose={closeModal}
      />
      {isDetailsLoading ? (
        <ApplicantLoadingWithTimer setIsProcessing={setIsIdMissionProcessing} />
      ) : (
        <section className="mt-14 text-center" data-testid="single-application">
          {showDownload && (
            <div className="mb-2 flex justify-end px-2">
              <Button variant="secondary" onClick={handleDownload} label={downloadLabel} disabled={isDownloading} />
            </div>
          )}
          {idMissionVerified && (
            <ErrorBoundary name="IdMissionDetails">
              <ApplicantIdMissionDetailsForm
                formDocument={formDocument}
                section={idMissionSection}
                canCustomize={canCustomize}
                canEditFormText={canEditFormText}
                canSkip={isOwner}
                data={idMissionVerifiedData}
                setData={setIdMissionVerifiedData}
                formRef={idMissionFormRef}
                isAllRequiredFieldsFilled={isAllRequiredFieldsFilled}
                isSubmitting={isSubmitting}
                submitFromEnterRef={submitFromEnterRef}
                onPlaceLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
                onCustomizeText={() => setActiveModal(SINGLE_APPLICATION_MODALS.ID_MISSION_DATA_TEXT)}
                onEnableHelp={() => setActiveModal(SINGLE_APPLICATION_MODALS.SIGNATURE_HELP)}
                onCustomizeSignature={() => setActiveModal(SINGLE_APPLICATION_MODALS.SIGNATURE)}
                onSaveSignature={handleSignature}
                onSkip={() => navigate(buildStepperPath({ formId, draftId }))}
                onSubmit={submitIdMissionData}
              />
            </ErrorBoundary>
          )}
          {!idMissionVerified && !emailVerified && (
            <ApplicantEmailVerification
              formDocument={formDocument}
              canEditFormText={canEditFormText}
              canSkip={isSignedIn}
              emailError={otpFlow.emailError}
              otpError={otpFlow.otpError}
              isBlocked={otpFlow.isOtpBlocked}
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
          )}
          {!idMissionVerified && emailVerified && qrFlow.qrLoading && <CustomLoading />}
          {!idMissionVerified && emailVerified && !qrFlow.qrLoading && (
            <ApplicantIdMissionQrStep
              section={idMissionSection}
              canCustomize={canCustomize}
              canUseIdMission={canUseIdMission}
              canEnterIdManually={canEnterIdManually}
              qrCode={qrCode}
              qrFetchError={qrFlow.qrFetchError}
              onCustomizeText={() => setActiveModal(SINGLE_APPLICATION_MODALS.ID_MISSION_SECTION_TEXT)}
              onRefresh={getQrAndWebLink}
              onManualEntry={handleManualEntry}
            />
          )}
        </section>
      )}
    </>
  );
};

export default SingleApplication;
