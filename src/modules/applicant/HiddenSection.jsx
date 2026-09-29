import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiLock } from "react-icons/fi";
import { useGetSpecialAccessOfSectionQuery, useSubmitSpecialAccessFormMutation } from "@/redux/apis/form.apis";
import { uploadFilesAndReplace } from "@/lib/utils";
import useApplyBranding from "@/hooks/useApplyBranding";
import usePermission from "@/hooks/usePermission";
import SignatureBox from "@/components/global/SignatureBox";
import Button from "@/components/shared/Button";
import CustomLoading from "@/components/shared/CustomLoading";
import EmptyState from "@/components/shared/EmptyState";
import HtmlContent from "@/components/shared/HtmlContent";
import Modal from "@/components/shared/Modal";
import useApplicantSectionIdMission from "./hooks/useApplicantSectionIdMission";
import ApplicantCustomizeFieldsModal from "./components/ApplicantCustomizeFieldsModal";
import ApplicantIdMissionQrPanel from "./components/ApplicantIdMissionQrPanel";
import ApplicantSectionField from "./components/ApplicantSectionField";
import ApplicantSectionTextModal from "./components/ApplicantSectionTextModal";
import { AUTH_ROUTES, HIDDEN_SECTION_PARAMS, LAYOUT_ROUTES } from "@/constants";
import { buildSignatureUploadHandler } from "./utils/applicant.signature.utils";
import { PERMISSIONS } from "@/utils/permissions";
import { isSignatureComplete } from "@/utils/signatureShape";

// scanned ID values fill fields, typed answers stay
const mergeIdMissionValues = (prev, fields, idMissionData) => {
  const next = { ...prev };
  fields.forEach((field) => {
    const idMissionValue = idMissionData?.[field.name]?.value;
    if (idMissionValue) next[field.uniqueId] = { name: field.name, value: idMissionValue };
    else next[field.uniqueId] = prev[field.uniqueId] ?? "";
  });
  return next;
};

const HiddenSection = () => {
  const navigate = useNavigate();
  const { formId, sectionKey: rawSectionKey } = useParams();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get(HIDDEN_SECTION_PARAMS.TOKEN);
  const sectionKey = rawSectionKey?.toLowerCase();
  const { user } = useSelector((state) => state.auth);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isSectionTextModalOpen, setIsSectionTextModalOpen] = useState(false);
  const [form, setForm] = useState({});
  useApplyBranding({ formId });
  const {
    data: formData,
    refetch: formRefetch,
    isLoading: isLoadingFormData,
    error: formError,
  } = useGetSpecialAccessOfSectionQuery(
    { formId, token: accessToken, sectionKey },
    { skip: !formId || !sectionKey || !user },
  );
  const [submitSpecialAccessForm, { isLoading: isSubmitting }] = useSubmitSpecialAccessFormMutation();
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

  const section = useMemo(
    () => formData?.data?.sections?.find((item) => item?.key?.toLowerCase() === sectionKey && item?.isHidden) ?? {},
    [formData?.data?.sections, sectionKey],
  );
  const sectionFields = useMemo(() => section.fields ?? [], [section.fields]);
  const isSignature = Boolean(section.isSignature);
  const requiredFieldIds = sectionFields.filter((field) => field?.required).map((field) => field?.uniqueId);
  // a signature-only section can be submitted once signed
  const isAllRequiredFieldsFilled =
    (requiredFieldIds.length > 0 || isSignature) &&
    requiredFieldIds.every((fieldId) => form?.[fieldId]?.value) &&
    (!isSignature || isSignatureComplete(form?.signature));
  const canCustomizeForm = usePermission(PERMISSIONS.CUSTOMIZE_FORM);
  const isOwner = Boolean(user?._id) && user?._id === formData?.data?.owner;
  const canCustomize = isOwner && canCustomizeForm;

  const handleSubmit = async () => {
    try {
      if (!accessToken || !sectionKey || !formId) return toast.error("Please provide all the required fields");
      const updatedFormData = await uploadFilesAndReplace(form);
      const res = await submitSpecialAccessForm({
        formId,
        token: accessToken,
        sectionKey,
        formData: updatedFormData,
      }).unwrap();
      toast.success(res.message);
      navigate(LAYOUT_ROUTES.HOME);
    } catch (error) {
      console.error("Submit special access form error:", error);
      toast.error(error?.data?.message || "Error while submitting special access form");
    }
  };

  const handleSignatureUpload = buildSignatureUploadHandler({ form, setForm });

  useEffect(() => {
    if (section.isIdMissionQr && !qrCode) loadQrCode();
  }, [loadQrCode, qrCode, section.isIdMissionQr]);

  useEffect(() => {
    if (sectionFields.length) setForm((prev) => mergeIdMissionValues(prev, sectionFields, idMissionVerifiedData));
  }, [idMissionVerifiedData, sectionFields]);

  if (!user)
    return (
      <EmptyState
        variant="panel"
        className="mt-14"
        icon={<FiLock size={28} />}
        title="Please log in to open this section"
      >
        <Button label="Log in" onClick={() => navigate(AUTH_ROUTES.LOGIN)} />
      </EmptyState>
    );
  if (isLoadingFormData) return <CustomLoading />;
  if (formError)
    return (
      <EmptyState
        variant="panel"
        className="mt-14"
        icon={<FiLock size={28} />}
        title="This link can't be opened"
        description={formError?.data?.message || "Error while fetching form data"}
      >
        <Button label="Try again" onClick={formRefetch} />
      </EmptyState>
    );

  return (
    <section className="mt-14">
      {isSectionTextModalOpen && (
        <Modal onClose={() => setIsSectionTextModalOpen(false)}>
          <ApplicantSectionTextModal section={section} onClose={() => setIsSectionTextModalOpen(false)} />
        </Modal>
      )}

      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-textPrimary text-2xl font-semibold">{section.name}</h1>
        {canCustomize && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsCustomizeModalOpen(true)} label="Customize" />
            <Button onClick={() => setIsSectionTextModalOpen(true)} label="Update Display Text" />
          </div>
        )}
      </header>

      {section.ai_formatting && <HtmlContent className="mb-4 w-full" html={section.ai_formatting} />}

      {section.isIdMissionQr && (
        <ApplicantIdMissionQrPanel
          qrCode={qrCode}
          isProcessing={isIdMissionProcessing}
          setIsProcessing={setIsIdMissionProcessing}
          isRefreshDisabled={isQrLoading || isSessionLoading}
          onRefresh={getQrAndWebLink}
        />
      )}
      {sectionFields.map((field) => (
        <ApplicantSectionField
          key={field.uniqueId}
          field={field}
          form={form}
          setForm={setForm}
          radioClassName="mt-4 flex flex-col gap-2"
        />
      ))}

      {isSignature && (
        <div className="mt-4">
          <SignatureBox step={section} onSave={handleSignatureUpload} signature={form?.signature} />
        </div>
      )}

      <footer className="flex justify-end gap-4 p-4">
        <Button
          disabled={isSubmitting || !isAllRequiredFieldsFilled}
          onClick={handleSubmit}
          label={isAllRequiredFieldsFilled ? "Submit" : "Fill All Required Fields"}
        />
      </footer>
      {isCustomizeModalOpen && (
        <Modal onClose={() => setIsCustomizeModalOpen(false)}>
          <ApplicantCustomizeFieldsModal
            sectionId={section._id}
            fields={sectionFields}
            formRefetch={formRefetch}
            isSignature={section.isSignature}
            section={section}
            onClose={() => setIsCustomizeModalOpen(false)}
          />
        </Modal>
      )}
    </section>
  );
};

export default HiddenSection;
