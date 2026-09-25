import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetSpecialAccessOfSectionQuery, useSubmitSpecialAccessFormMutation } from "@/redux/apis/form.apis";
import { toast } from "react-toastify";
import { uploadFilesAndReplace } from "@/lib/utils";
import usePermission from "@/hooks/usePermission";
import useApplicantSectionIdMission from "./hooks/useApplicantSectionIdMission";
import useApplyBranding from "@/hooks/useApplyBranding";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import Modal from "@/components/shared/Modal";
import CustomizationFieldsModal from "./components/ApplicantCustomizeFieldsModal";
import ApplicantIdMissionQrPanel from "./components/ApplicantIdMissionQrPanel";
import ApplicantSectionField from "./components/ApplicantSectionField";
import { EditSectionDisplayTextFromatingModal } from "./components/ApplicantSectionTextModal";
import { APPLICANT_HOME_PATH } from "./utils/applicant.constants";
import HtmlContent from "@/components/shared/HtmlContent";
import { PERMISSIONS } from "@/utils/permissions";

const FormHiddenSection = () => {
  const navigate = useNavigate();
  const params = useParams();
  const formId = params.formId;
  const accessToken = useSearchParams()?.[0]?.get("token");
  const sectionKey = params.sectionKey?.toLowerCase();
  const { user } = useSelector((state) => state.auth);
  const [customizeModal, setCustomizeModal] = useState(false);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [form, setForm] = useState({});
  const [section, setSection] = useState({});
  useApplyBranding({ formId });
  const {
    data: formData,
    refetch: formRefetch,
    isLoading: isLoadingFormData,
    error: formError,
  } = useGetSpecialAccessOfSectionQuery({ formId, token: accessToken, sectionKey }, { skip: !formId || !sectionKey });
  const [submitSpecialAccessForm, { isLoading: isSubmittingSpecialAccessForm }] = useSubmitSpecialAccessFormMutation();
  const {
    idMissionVerifiedData,
    qrCode,
    isQrLoading,
    isSessionLoading,
    isIdMissionProcessing,
    setIsIdMissionProcessing,
    getQrAndWebLink,
    loadQrCode,
  } = useApplicantSectionIdMission(sectionKey);

  const requiredFieldsUniqueIds = section?.fields?.filter((field) => field?.required).map((field) => field?.uniqueId);
  const isAllRequiredFieldsFilled = requiredFieldsUniqueIds?.length
    ? requiredFieldsUniqueIds.every((field) => form?.[field]?.value)
    : false;
  const canCustomizeForm = usePermission(PERMISSIONS.CUSTOMIZE_FORM);
  const isOwner = Boolean(user?._id) && user?._id === formData?.data?.owner;
  const canCustomize = isOwner && canCustomizeForm;
  const isSubmitDisabled = isSubmittingSpecialAccessForm || !isAllRequiredFieldsFilled;

  const handleSubmitSpecialAccessForm = useCallback(async () => {
    try {
      if (!accessToken || !sectionKey || !formId) return toast.error("Please provide all the required fields");
      const updatedFormData = await uploadFilesAndReplace(form);
      const res = await submitSpecialAccessForm({
        formId,
        token: accessToken,
        sectionKey,
        formData: updatedFormData,
      }).unwrap();
      if (res.success) {
        toast.success(res.message);
        navigate(APPLICANT_HOME_PATH);
      } else {
        toast.error(res.message || "Error while submitting special access form");
      }
    } catch (error) {
      console.error("Submit special access form error:", error);
      toast.error(error?.data?.message || "Error while submitting special access form");
    }
  }, [accessToken, sectionKey, formId, submitSpecialAccessForm, form, navigate]);

  useEffect(() => {
    const hiddenSection = formData?.data?.sections?.find(
      (item) => item?.key?.toLowerCase() === sectionKey?.toLowerCase() && item?.isHidden,
    );
    if (hiddenSection) setSection(hiddenSection);
  }, [formData?.data?.sections, sectionKey]);

  useEffect(() => {
    if (formError) toast.error(formError?.data?.message || "Error while fetching form data");
  }, [formError]);

  // load the QR code and prefill fields from the IDMission data
  useEffect(() => {
    if (!qrCode && section?.isIdMissionQr) loadQrCode();
    if (!section?.fields?.length) return;
    const formFields = {};
    section.fields.forEach((field) => {
      const idMissionValue = idMissionVerifiedData?.[field?.name]?.value;
      formFields[field?.uniqueId] = idMissionValue !== undefined ? { name: field?.name, value: idMissionValue } : "";
    });
    setForm(formFields);
  }, [idMissionVerifiedData, loadQrCode, qrCode, section?.fields, section?.isIdMissionQr]);

  if (isLoadingFormData) return <CustomLoading />;

  return (
    <div className="mt-14">
      {updateSectionFromatingModal && (
        <Modal onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={section} setModal={setUpdateSectionFromatingModal} />
        </Modal>
      )}

      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold">{section?.name}</p>
        <div className="flex gap-2">
          {canCustomize && (
            <>
              <Button variant="secondary" onClick={() => setCustomizeModal(true)} label="Customize" />
              <Button onClick={() => setUpdateSectionFromatingModal(true)} label="Update Display Text" />
            </>
          )}
        </div>
      </div>

      {section?.ai_formatting && (
        <div className="mb-4 flex w-full items-end gap-3">
          <HtmlContent className="w-full" html={section?.ai_formatting} />
        </div>
      )}

      {section?.isIdMissionQr && (
        <ApplicantIdMissionQrPanel
          qrCode={qrCode}
          isProcessing={isIdMissionProcessing}
          setIsProcessing={setIsIdMissionProcessing}
          isRefreshDisabled={isQrLoading || isSessionLoading}
          onRefresh={getQrAndWebLink}
        />
      )}
      {section?.fields?.length > 0 &&
        section.fields.map((field, index) => (
          <ApplicantSectionField
            key={index}
            field={field}
            form={form}
            setForm={setForm}
            radioClassName="mt-4 flex flex-col gap-2"
          />
        ))}

      <div className="flex justify-end gap-4 p-4">
        <Button
          className={`${isSubmitDisabled ? "pinter-events-none opacity-50" : ""} cursor-not-allowed`}
          disabled={isSubmitDisabled}
          onClick={handleSubmitSpecialAccessForm}
          label={isAllRequiredFieldsFilled ? "Submit" : "Fill All Required Fields"}
        />
      </div>
      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            sectionId={section?._id}
            fields={section?.fields}
            formRefetch={formRefetch}
            isSignature={section?.isSignature}
            section={section}
            onClose={() => setCustomizeModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default FormHiddenSection;
