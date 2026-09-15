import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  useCompanyLookupMutation,
  useCompanyVerificationMutation,
  useGetSingleFormQueryQuery,
  useSaveFormInDraftMutation,
} from "@/redux/apis/form.apis";
import { addLookupData } from "@/redux/slices/company.slice";
import { setCurrentDraftId, updateFormHeaderAndFooter, updateFormState } from "@/redux/slices/form.slice";
import { toast } from "react-toastify";
import { GoCheckCircle } from "react-icons/go";
import { useApplicantScreenContext } from "../hooks/useApplicantScreenContext";
import useApplicantFocusFirstInput from "../hooks/useApplicantFocusFirstInput";
import { useEnterToNextField } from "../hooks/useEnterToNextField";
import LocationStatusModal from "@/components/modals/LocationStatusModal";
import Button from "@/components/shared/Button";
import Checkbox from "@/components/shared/Checkbox";
import CustomLoading from "@/components/shared/CustomLoading";
import Modal from "@/components/shared/Modal";
import TextField from "@/components/shared/TextField";
import ApplicantFormDisplayTextModal from "./ApplicantFormDisplayTextModal";
import { formKeys } from "@/constants";
import {
  COMPANY_VERIFICATION_STATUSES,
  DEFAULT_HEADER_FOOTER,
  DISPLAY_TEXT_FIELDS,
  SECTION_KEYS,
} from "../utils/applicant.constants";
import { buildApplicationFormPath } from "../utils/applicant.utils6";
import { buildLookupData } from "../utils/applicant.utils7";
import getEnv from "@/utils/env";
import { isNotGuestRoleValue } from "@/utils/permissions";
import HtmlContent from "@/components/shared/HtmlContent";

// inputs stay read-only while a company request runs
const ignoreChange = () => {};

const CompanyVerification = ({ formId, brandingName, draftId }) => {
  const companyFormRef = useRef(null);
  const submitFromEnterRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state?.auth);
  const { formData, currentDraftId } = useSelector((state) => state?.form);
  const activeDraftId = draftId || currentDraftId;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", noWebsite: false });
  const [apisRes, setApisRes] = useState({ companyLookup: {}, companyVerify: {} });
  const [locationStatusModal, setLocationStatusModal] = useState(false);
  const [locationData, setLocationData] = useState({});
  const [isDisplayTextModalOpen, setIsDisplayTextModalOpen] = useState(false);
  const [verifyCompany, { isLoading: verifyCompanyLoading }] = useCompanyVerificationMutation();
  const [lookupCompany, { isLoading: lookupCompanyLoading }] = useCompanyLookupMutation();
  const { data: formBackendData, isLoading, refetch } = useGetSingleFormQueryQuery({ _id: formId });
  const [saveFormInDraft, { isLoading: isSavingFormInDraft }] = useSaveFormInDraftMutation();

  const formDocument = formBackendData?.data;
  const isCreator = Boolean(
    user && formBackendData && user?._id && user?._id === formDocument?.owner && isNotGuestRoleValue(user),
  );
  const isRequestBusy = verifyCompanyLoading || lookupCompanyLoading;
  const isContinueDisabled = loading || isSavingFormInDraft || isRequestBusy;

  const goToApplicationWithDraft = useCallback(
    async ({ createIfMissing = false } = {}) => {
      let id = activeDraftId;
      try {
        // the first visit creates the draft that later steps reuse
        if (!id && createIfMissing) {
          const res = await saveFormInDraft({ formId, formData: formData || {} }).unwrap();
          id = res?.data?.draftId;
        }
        if (id) dispatch(setCurrentDraftId(id));
        return navigate(buildApplicationFormPath(brandingName, formId, id));
      } catch (error) {
        console.error("Create draft error:", error);
        toast.error(error?.data?.message || "Failed to save draft");
        return navigate(buildApplicationFormPath(brandingName, formId, id));
      }
    },
    [activeDraftId, brandingName, dispatch, formData, formId, navigate, saveFormInDraft],
  );

  const saveInProgress = useCallback(
    async ({ data, name, draftId: overrideDraftId }) => {
      try {
        const res = await saveFormInDraft({
          formId,
          draftId: overrideDraftId || activeDraftId,
          formData: { ...formData, [name]: data },
        }).unwrap();
        if (res.success && res?.data?.draftId) dispatch(setCurrentDraftId(res.data.draftId));
        return res;
      } catch (error) {
        console.error("Save draft error:", error);
        toast.error(error?.data?.message || "Error while saving form in draft");
      }
    },
    [formData, formId, activeDraftId, saveFormInDraft, dispatch],
  );

  const companyLookup = useCallback(
    async (draftIdForSave) => {
      if (!form?.name || !form?.url) return toast.error("Please fill all fields");
      try {
        const lookupCompanyRes = await lookupCompany({ name: form?.name, url: form?.url, formId }).unwrap();
        if (lookupCompanyRes?.success) {
          setApisRes((prev) => ({ ...prev, companyLookup: lookupCompanyRes?.data }));
          const totalLookupData = buildLookupData(lookupCompanyRes?.data?.lookupData || {});
          dispatch(addLookupData(totalLookupData));
          dispatch(updateFormState({ data: totalLookupData, name: formKeys.company_lookup_data }));
          const saveRes = await saveInProgress({
            data: totalLookupData,
            name: formKeys.company_lookup_data,
            draftId: draftIdForSave,
          });
          toast.success("Company lookup successfully completed");
          return saveRes?.data?.draftId;
        }
      } catch (error) {
        console.error("Lookup company error:", error);
        toast.error(error?.data?.message || "Failed to lookup company");
      }
    },
    [dispatch, form?.name, form?.url, formId, lookupCompany, saveInProgress],
  );

  const handleSubmit = async () => {
    try {
      if (form?.noWebsite) return goToApplicationWithDraft({ createIfMissing: true });
      if (!form?.name || !form?.url) return toast.error("Please fill all fields");
      setLoading(true);
      const companyVerifyRes = await verifyCompany({ name: form?.name, url: form?.url, formId }).unwrap();
      if (
        companyVerifyRes?.success &&
        companyVerifyRes?.data?.verificationStatus !== COMPANY_VERIFICATION_STATUSES.UNVERIFIED
      ) {
        setApisRes((prev) => ({ ...prev, companyVerify: companyVerifyRes?.data }));
        toast.success("Company verified successfully");
        let id = activeDraftId;
        if (!id) {
          const res = await saveFormInDraft({ formId, formData: formData || {} }).unwrap();
          id = res?.data?.draftId;
        }
        if (id) dispatch(setCurrentDraftId(id));
        // lookup keeps running after the redirect
        companyLookup(id);
        return navigate(buildApplicationFormPath(brandingName, formId, id));
      }
      toast.error("Company verification failed, please try again");
    } catch (error) {
      console.error("Verify company error:", error);
      toast.error(error?.data?.message || "Failed to verify company");
    } finally {
      setLoading(false);
    }
  };

  submitFromEnterRef.current = () => {
    if (isContinueDisabled) return;
    handleSubmit();
  };
  useEnterToNextField(companyFormRef, { onLastFieldRef: submitFromEnterRef, includeCheckboxes: true });

  useApplicantScreenContext({
    screenId: "company-verification",
    screenName: "Company Information",
    description:
      "The applicant enters their company's full legal name and website URL. " +
      "After all required fields are filled, call goToNextStep to submit and proceed automatically. " +
      'If the applicant says their company has no website, fill field "noWebsite" with value "true" to check the checkbox — this removes the URL requirement.',
    aiEndpoint: `${getEnv("SERVER_URL")}/api/ai/applicant-chat`,
    formRef: companyFormRef,
    currentState: {},
    actions: {
      goToNextStep: () => handleSubmit(),
      scrollToField: ({ fieldId }) => {
        const el = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      },
    },
    deps: [form],
  });

  // header and footer text for the layout
  useEffect(() => {
    if (formDocument?.footerText || formDocument?.headerText || formDocument?.name) {
      dispatch(
        updateFormHeaderAndFooter({
          headerText: formDocument?.headerText || formDocument?.name || "",
          footerText: formDocument?.footerText || DEFAULT_HEADER_FOOTER.footerText,
          headerTextSize: formDocument?.headerTextSize || 24,
        }),
      );
    }
    return () => {
      dispatch(updateFormHeaderAndFooter({ ...DEFAULT_HEADER_FOOTER }));
    };
  }, [dispatch, formDocument, user]);

  useEffect(() => {
    if (!formDocument) return;
    setLocationStatusModal(formDocument?.locationStatus);
    setLocationData({
      logo: formDocument?.branding?.selectedLogo || "",
      title: formDocument?.locationTitle,
      subtitle: formDocument?.locationSubtitle,
      message: formDocument?.formatedLocationMessage,
    });
  }, [formDocument]);

  useApplicantFocusFirstInput(companyFormRef, !isLoading);

  return (
    <>
      {isDisplayTextModalOpen && formDocument && (
        <Modal onClose={() => setIsDisplayTextModalOpen(false)}>
          <ApplicantFormDisplayTextModal
            form={formDocument}
            fieldKeys={DISPLAY_TEXT_FIELDS.COMPANY_VERIFICATION}
            previewClassName="h-full p-4"
            formRefetch={refetch}
            onClose={() => setIsDisplayTextModalOpen(false)}
          />
        </Modal>
      )}
      <div ref={companyFormRef} data-testid="company-verification-page" className="flex flex-col space-y-8">
        {isLoading ? (
          <CustomLoading />
        ) : (
          <>
            {locationStatusModal && (
              <LocationStatusModal
                locationStatusModal={locationStatusModal}
                setLocationStatusModal={setLocationStatusModal}
                locationData={locationData}
                formId={formId}
                navigate={navigate}
                brandingName={formBackendData?.branding?.name}
                draftId={activeDraftId}
              />
            )}
            <div className="border-frameColor w-full rounded-md border p-4">
              <div className="flex items-center justify-center gap-3">
                {formDocument?.companyVerificationDisplayFormatedText && (
                  <div className="mb-4 flex w-full items-center justify-between">
                    <HtmlContent html={formDocument?.companyVerificationDisplayFormatedText} />
                  </div>
                )}
                {isCreator && (
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
                  id="company-name"
                  name="company-name"
                  data-testid="company-name-input"
                  label="Legal company name *"
                  className="w-full rounded px-2 text-sm"
                  value={form.name}
                  onChange={isRequestBusy ? ignoreChange : (e) => setForm({ ...form, name: e.target.value })}
                />
                {!form.noWebsite && (
                  <TextField
                    id="company-url"
                    name="company-url"
                    data-testid="company-url-input"
                    label="Website URL *"
                    className="w-full rounded px-2 text-sm"
                    value={form.url}
                    onChange={isRequestBusy ? ignoreChange : (e) => setForm({ ...form, url: e.target.value })}
                  />
                )}
                <Checkbox
                  id="noWebsite"
                  label="This company has no website"
                  name="noWebsite"
                  data-testid="company-no-website-checkbox"
                  checked={form.noWebsite}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm({ ...form, noWebsite: checked, ...(checked ? { url: "" } : {}) });
                    dispatch(updateFormState({ data: checked, name: SECTION_KEYS.COMPANY_HAS_NO_WEBSITE }));
                  }}
                />
                {apisRes?.companyVerify?.confidenceScore && apisRes?.companyVerify?.verificationStatus && (
                  <div className="flex w-44 items-center gap-2 rounded-2xl border p-2 py-1">
                    <div>
                      <GoCheckCircle className="font-medium text-blue-400" />
                    </div>
                    <div className="text-textPrimary text-xs">
                      {apisRes?.companyVerify?.originalCompanyName || form?.name}{" "}
                      {apisRes?.companyVerify?.verificationStatus} ({apisRes?.companyVerify?.confidenceScore}%)
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    label="Continue"
                    onClick={handleSubmit}
                    data-testid="company-verification-continue-btn"
                    disabled={isContinueDisabled}
                    className={` ${isContinueDisabled && "pointer-events-auto cursor-not-allowed opacity-20"}`}
                  />
                </div>
              </div>
            </div>

            {isCreator && (
              <Button
                disabled={isContinueDisabled}
                onClick={() => goToApplicationWithDraft({ createIfMissing: true })}
                label="Skip"
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CompanyVerification;
