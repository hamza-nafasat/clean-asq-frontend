import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector, useStore } from "react-redux";
import {
  useCompanyLookupMutation,
  useCompanyVerificationMutation,
  useGetSingleFormQueryQuery,
  useSaveFormInDraftMutation,
} from "@/redux/apis/form.apis";
import { addLookupData } from "@/redux/slices/company.slice";
import {
  setCurrentDraftId,
  updateEmailVerified,
  updateFormHeaderAndFooter,
  updateFormState,
} from "@/redux/slices/form.slice";
import { toast } from "react-toastify";
import { GoCheckCircle } from "react-icons/go";
import usePermission from "@/hooks/usePermission";
import Button from "@/components/shared/Button";
import Checkbox from "@/components/shared/Checkbox";
import CustomLoading from "@/components/shared/CustomLoading";
import HtmlContent from "@/components/shared/HtmlContent";
import Modal from "@/components/shared/Modal";
import TextField from "@/components/shared/TextField";
import useApplicantEnterToNextField from "../hooks/useApplicantEnterToNextField";
import useApplicantFocusFirstInput from "../hooks/useApplicantFocusFirstInput";
import useApplicantScreenContext from "../hooks/useApplicantScreenContext";
import ApplicantFormDisplayTextModal from "./ApplicantFormDisplayTextModal";
import ApplicantLocationModal from "./ApplicantLocationModal";
import { COMPANY_LOOKUP_FIELDS, FORM_DISPLAY_TEXT_FIELDS, formKeys, LOCATION_STATUSES } from "@/constants";
import {
  COMPANY_VERIFICATION_STATUSES,
  DEFAULT_HEADER_FOOTER,
  DEFAULT_HEADER_TEXT_SIZE,
  SECTION_KEYS,
} from "../utils/applicant.constants";
import { buildLookupData } from "../utils/applicant.companyLookup.utils";
import { validateCompanyLookup } from "../utils/applicant.validation.utils";
import { buildApplicationFormPath } from "@/utils/applicationPaths";
import getEnv from "@/utils/env";
import { PERMISSIONS } from "@/utils/permissions";

// statuses that ask for the captcha
const LOCATION_CHECK_STATUSES = [LOCATION_STATUSES.REQUIRED, LOCATION_STATUSES.OPTIONAL];

// inputs stay read-only while a company request runs
const ignoreChange = () => {};

const ApplicantCompanyLookup = ({ formId, brandingName, draftId }) => {
  const companyFormRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const skipStartedRef = useRef(false);
  const dispatch = useDispatch();
  const store = useStore();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { formData, currentDraftId, currentDraftFormId } = useSelector((state) => state.form);
  const activeDraftId = draftId || (currentDraftFormId === formId ? currentDraftId : null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", noWebsite: false });
  const [errors, setErrors] = useState({});
  const [companyVerify, setCompanyVerify] = useState({});
  const [isLocationModalClosed, setIsLocationModalClosed] = useState(false);
  const [isDisplayTextModalOpen, setIsDisplayTextModalOpen] = useState(false);
  const [verifyCompany, { isLoading: verifyCompanyLoading }] = useCompanyVerificationMutation();
  const [lookupCompany, { isLoading: lookupCompanyLoading }] = useCompanyLookupMutation();
  const { data: formBackendData, isLoading, refetch } = useGetSingleFormQueryQuery({ _id: formId });
  const [saveFormInDraft, { isLoading: isSavingFormInDraft }] = useSaveFormInDraftMutation();

  const formDocument = formBackendData?.data;
  const canUpdateForm = usePermission(PERMISSIONS.UPDATE_FORM);
  const canLookupCompany = usePermission(PERMISSIONS.LOOKUP_COMPANY);
  const isOwner = Boolean(user?._id) && user?._id === formDocument?.owner;
  const canEditFormText = isOwner && canUpdateForm;
  const isRequestBusy = verifyCompanyLoading || lookupCompanyLoading;
  const isContinueDisabled = loading || isSavingFormInDraft || isRequestBusy;
  const isLocationModalOpen = !isLocationModalClosed && LOCATION_CHECK_STATUSES.includes(formDocument?.locationStatus);

  const goToApplicationWithDraft = useCallback(
    async ({ createIfMissing = false } = {}) => {
      let id = activeDraftId;
      try {
        // the first visit creates the draft that later steps reuse
        if (!id && createIfMissing) {
          const res = await saveFormInDraft({ formId, formData: formData || {} }).unwrap();
          id = res?.data?.draftId;
        }
        if (id) dispatch(setCurrentDraftId({ draftId: id, formId }));
        return navigate(buildApplicationFormPath({ formId, brandingName, draftId: id }));
      } catch (error) {
        console.error("Create draft error:", error);
        toast.error(error?.data?.message || "Failed to save draft");
        return navigate(buildApplicationFormPath({ formId, brandingName, draftId: id }));
      }
    },
    [activeDraftId, brandingName, dispatch, formData, formId, navigate, saveFormInDraft],
  );

  // finishes after the redirect, so it saves the latest answers
  const companyLookup = async (lookupDraftId) => {
    try {
      const lookupCompanyRes = await lookupCompany({ name: form.name, url: form.url, formId }).unwrap();
      if (!lookupCompanyRes?.success) return;
      const totalLookupData = buildLookupData(lookupCompanyRes?.data?.lookupData || {});
      dispatch(addLookupData(totalLookupData));
      dispatch(updateFormState({ data: totalLookupData, name: formKeys.company_lookup_data }));
      const res = await saveFormInDraft({
        formId,
        draftId: lookupDraftId,
        formData: store.getState().form.formData,
      }).unwrap();
      if (res.success && res?.data?.draftId) dispatch(setCurrentDraftId({ draftId: res.data.draftId, formId }));
      toast.success("Company lookup successfully completed");
    } catch (error) {
      console.error("Lookup company error:", error);
      toast.error(error?.data?.message || "Failed to lookup company");
    }
  };

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleNoWebsiteChange = (e) => {
    const checked = e.target.checked;
    setForm((prev) => ({ ...prev, noWebsite: checked, ...(checked && { url: "" }) }));
    setErrors({});
    dispatch(updateFormState({ data: checked, name: SECTION_KEYS.COMPANY_HAS_NO_WEBSITE }));
  };

  const handleSubmit = async () => {
    if (form.noWebsite) return goToApplicationWithDraft({ createIfMissing: true });
    const nextErrors = validateCompanyLookup(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    try {
      setLoading(true);
      const companyVerifyRes = await verifyCompany({ name: form.name, url: form.url, formId }).unwrap();
      if (
        !companyVerifyRes?.success ||
        companyVerifyRes?.data?.verificationStatus === COMPANY_VERIFICATION_STATUSES.UNVERIFIED
      )
        return toast.error("Company verification failed, please try again");
      setCompanyVerify(companyVerifyRes.data);
      toast.success("Company verified successfully");
      let id = activeDraftId;
      if (!id) {
        const res = await saveFormInDraft({ formId, formData: formData || {} }).unwrap();
        id = res?.data?.draftId;
      }
      if (id) dispatch(setCurrentDraftId({ draftId: id, formId }));
      // lookup keeps running after the redirect
      companyLookup(id);
      return navigate(buildApplicationFormPath({ formId, brandingName, draftId: id }));
    } catch (error) {
      console.error("Verify company error:", error);
      toast.error(error?.data?.message || "Failed to verify company");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationBack = () => {
    dispatch(updateEmailVerified(false));
    navigate(buildApplicationFormPath({ formId, brandingName, draftId: activeDraftId }));
  };

  submitFromEnterRef.current = () => {
    if (isContinueDisabled) return;
    handleSubmit();
  };
  useApplicantEnterToNextField(companyFormRef, { onLastFieldRef: submitFromEnterRef, includeCheckboxes: true });

  useApplicantScreenContext({
    screenId: "company-verification",
    screenName: "Company Information",
    description:
      "The applicant enters their company's full legal name and website URL themselves, then clicks Continue to submit. " +
      'If their company has no website, tell them to check the "This company has no website" checkbox themselves — this removes the URL requirement.',
    aiEndpoint: `${getEnv("SERVER_URL")}/api/ai/applicant-chat`,
    formId,
    formRef: companyFormRef,
    currentState: {},
    actions: {
      scrollToField: ({ fieldId }) => {
        const el = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      },
    },
  });

  // header and footer text for the layout
  useEffect(() => {
    if (formDocument?.footerText || formDocument?.headerText || formDocument?.name) {
      dispatch(
        updateFormHeaderAndFooter({
          headerText: formDocument?.headerText || formDocument?.name || "",
          footerText: formDocument?.footerText || DEFAULT_HEADER_FOOTER.footerText,
          headerTextSize: formDocument?.headerTextSize || DEFAULT_HEADER_TEXT_SIZE,
        }),
      );
    }
    return () => {
      dispatch(updateFormHeaderAndFooter({ ...DEFAULT_HEADER_FOOTER }));
    };
  }, [dispatch, formDocument, user]);

  useApplicantFocusFirstInput(companyFormRef, !isLoading);

  // no lookup permission skips this step
  useEffect(() => {
    if (canLookupCompany || skipStartedRef.current) return;
    skipStartedRef.current = true;
    goToApplicationWithDraft({ createIfMissing: true });
  }, [canLookupCompany, goToApplicationWithDraft]);

  return (
    <>
      {isDisplayTextModalOpen && formDocument && (
        <Modal onClose={() => setIsDisplayTextModalOpen(false)}>
          <ApplicantFormDisplayTextModal
            form={formDocument}
            fieldKeys={FORM_DISPLAY_TEXT_FIELDS.COMPANY_VERIFICATION}
            previewClassName="h-full p-4"
            formRefetch={refetch}
            onClose={() => setIsDisplayTextModalOpen(false)}
          />
        </Modal>
      )}
      <section ref={companyFormRef} data-testid="company-verification-page" className="flex flex-col space-y-8">
        {isLoading || !canLookupCompany ? (
          <CustomLoading />
        ) : (
          <>
            <ApplicantLocationModal
              isOpen={isLocationModalOpen}
              status={formDocument?.locationStatus}
              locationData={{
                logo: formDocument?.branding?.selectedLogo || "",
                message: formDocument?.formatedLocationMessage,
              }}
              onClose={() => setIsLocationModalClosed(true)}
              onBack={handleLocationBack}
            />
            <div className="border-frameColor w-full rounded-md border p-4">
              <div className="flex items-center justify-center gap-3">
                {formDocument?.companyVerificationDisplayFormatedText && (
                  <div className="mb-4 flex w-full items-center justify-between">
                    <HtmlContent html={formDocument?.companyVerificationDisplayFormatedText} />
                  </div>
                )}
                {canEditFormText && (
                  <div className="flex w-full justify-end">
                    <Button
                      className="h-fit"
                      label="Customize Display Text"
                      onClick={() => setIsDisplayTextModalOpen(true)}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-4">
                <TextField
                  {...COMPANY_LOOKUP_FIELDS.NAME}
                  id={COMPANY_LOOKUP_FIELDS.NAME.name}
                  data-testid="company-name-input"
                  className="w-full rounded px-2 text-sm"
                  value={form.name}
                  error={errors.name}
                  onChange={isRequestBusy ? ignoreChange : handleChange("name")}
                />
                {!form.noWebsite && (
                  <TextField
                    {...COMPANY_LOOKUP_FIELDS.URL}
                    id={COMPANY_LOOKUP_FIELDS.URL.name}
                    data-testid="company-url-input"
                    className="w-full rounded px-2 text-sm"
                    value={form.url}
                    error={errors.url}
                    onChange={isRequestBusy ? ignoreChange : handleChange("url")}
                  />
                )}
                <Checkbox
                  {...COMPANY_LOOKUP_FIELDS.NO_WEBSITE}
                  id={COMPANY_LOOKUP_FIELDS.NO_WEBSITE.name}
                  data-testid="company-no-website-checkbox"
                  checked={form.noWebsite}
                  onChange={handleNoWebsiteChange}
                />
                {companyVerify.confidenceScore && companyVerify.verificationStatus && (
                  <div className="flex w-44 items-center gap-2 rounded-2xl border p-2 py-1">
                    <GoCheckCircle className="shrink-0 font-medium text-blue-400" />
                    <p className="text-textPrimary text-xs">
                      {companyVerify.originalCompanyName || form.name} {companyVerify.verificationStatus} (
                      {companyVerify.confidenceScore}%)
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <Button
                    label="Continue"
                    onClick={handleSubmit}
                    data-testid="company-verification-continue-btn"
                    disabled={isContinueDisabled}
                    className={isContinueDisabled ? "pointer-events-auto cursor-not-allowed opacity-20" : ""}
                  />
                </div>
              </div>
            </div>

            {isOwner && (
              <Button
                disabled={isContinueDisabled}
                onClick={() => goToApplicationWithDraft({ createIfMissing: true })}
                label="Skip"
              />
            )}
          </>
        )}
      </section>
    </>
  );
};

export default ApplicantCompanyLookup;
