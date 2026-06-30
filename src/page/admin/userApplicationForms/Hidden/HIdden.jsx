import CustomizationFieldsModal from "@/components/applicationVerification/companyInfo/CustomizationFieldsModal.jsx";
import Button from "@/components/shared/small/Button.jsx";
import CustomLoading from "@/components/shared/small/CustomLoading";
import {
  CheckboxInputType,
  FileInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from "@/components/shared/small/DynamicField.jsx";
import { EditSectionDisplayTextFromatingModal } from "@/components/shared/small/EditSectionDisplayTextFromatingModal.jsx";
import { LoadingWithTimer } from "@/components/shared/small/LoadingWithTimer";
import Modal from "@/components/shared/small/Modal.jsx";
import { FIELD_TYPES } from "@/data/constants";
import { uploadFilesAndReplace } from "@/lib/utils";
import { socket } from "@/main";
import { useGetSpecialAccessOfSectionQuery, useSubmitSpecialAccessFormMutation } from "@/redux/apis/formApis";
import { useGetIdMissionSessionMutation } from "@/redux/apis/idMissionApis";
import { formatData, makeCompleteName } from "@/utils/idMissionMapingUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

function FormHiddenSection() {
  const navigate = useNavigate();
  const params = useParams();
  const formId = params.formId;
  const accessToken = useSearchParams()?.[0]?.get("token");
  const sectionKey = params.sectionKey?.toLowerCase();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const {
    data: formData,
    refetch: formRefetch,
    isLoading: isLoadingFormData,
    error: formError,
  } = useGetSpecialAccessOfSectionQuery(
    { formId, token: accessToken, sectionKey },
    { skip: !formId || !accessToken || !sectionKey },
  );
  const [customizeModal, setCustomizeModal] = useState(false);
  const [form, setForm] = useState({});
  const [section, setSection] = useState({});
  const containerRef = useRef(null);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [submitSpecialAccessForm, { isLoading: isSubmittingSpecialAccessForm }] = useSubmitSpecialAccessFormMutation();

  const [qrCode, setQrCode] = useState("");
  const [getQrAndWebLinkLoading, setGetQrAndWebLinkLoading] = useState(false);
  const [isIdMissionProcessing, setIsIdMissionProcessing] = useState(false);
  const [getIdMissionSession, { isLoading: isGetIdMissionSessionLoading }] = useGetIdMissionSessionMutation();
  const [idMissionVerifiedData, setIdMissionVerifiedData] = useState({
    idMissionName: { name: "idMissionName", value: "" },
    idMissionEmail: { name: "idMissionEmail", value: user?.email },
    idMissionIdNumber: { name: "idMissionIdNumber", value: "" },
    idMissionStreetAddress: { name: "idMissionStreetAddress", value: "" },
    idMissionPhoneNumber: { name: "idMissionPhoneNumber", value: "" },
    idMissionCompanyTitle: { name: "idMissionCompanyTitle", value: "" },
    idMissionIssueDate: { name: "idMissionIssueDate", value: "" },
    idMissionIdIssuer: { name: "idMissionIdIssuer", value: "" },
    idMissionIdType: { name: "idMissionIdType", value: "" },
    idMissionIdExpiryDate: { name: "idMissionIdExpiryDate", value: "" },
    idMissionCity: { name: "idMissionCity", value: "" },
    idMissionState: { name: "idMissionState", value: "" },
    idMissionDateOfBirth: { name: "idMissionDateOfBirth", value: "" },
    idMissionZipCode: { name: "idMissionZipCode", value: "" },
    idMissionCountry: { name: "idMissionCountry", value: "" },
    idMissionRoleFillingForCompany: { name: "idMissionRoleFillingForCompany", value: "" },
    idMissionData: { name: "idMissionData", value: "null" },
  });

  const isCreator = user?._id && user?._id === formData?.data?.owner && user?.role !== "guest";

  const getQrAndWebLink = useCallback(async () => {
    try {
      const res = await getIdMissionSession({ sectionKey: sectionKey }).unwrap();
      if (res.success) {
        setQrCode(res.data?.customerData?.qrCode);
      }
    } catch (error) {
      console.log("Error fetching session ID:", error);
    }
  }, [getIdMissionSession, sectionKey]);

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
        navigate("/");
      } else {
        toast.error(res.message || "Error while submitting special access form");
      }
    } catch (error) {
      console.log("error submitting special access form", error);
      toast.error(error?.data?.message || "Error while submitting special access form");
    }
  }, [accessToken, sectionKey, formId, submitSpecialAccessForm, form, navigate]);

  useEffect(() => {
    setIsLoading(true);
    if (formData?.data?.sections) {
      const section = formData?.data?.sections?.find(
        (section) => section?.key?.toLowerCase() === sectionKey?.toLowerCase() && section?.isHidden,
      );
      if (section) setSection(section);
    }
    setIsLoading(false);
  }, [formData?.data?.sections, sectionKey]);
  // showing error message if form error is not null
  useEffect(() => {
    if (formError) toast.error(formError?.data?.message || "Error while fetching form data");
  }, [formError]);

  useEffect(() => {
    if (!qrCode && section?.isIdMissionQr) {
      setGetQrAndWebLinkLoading(true);
      getQrAndWebLink().finally(() => setGetQrAndWebLinkLoading(false));
    }
    const formFields = {};
    if (section?.fields?.length) {
      section?.fields?.forEach((field) => {
        const idMissionValue = idMissionVerifiedData?.[field?.name]?.value;
        const finalValue = idMissionValue !== undefined ? { name: field?.name, value: idMissionValue } : "";
        formFields[field?.uniqueId] = finalValue;
      });
      setForm(formFields);
    }
  }, [getQrAndWebLink, idMissionVerifiedData, qrCode, section?.fields, section?.isIdMissionQr]);

  // check and get socket events
  useEffect(() => {
    socket.on("idMission_processing_started", () => {
      // console.log("you start id mission verification", data);
      setIsIdMissionProcessing(true);
    });
    // id mission verified success fully
    socket.on("idMission_verified", async (data) => {
      if (data?.sectionKey !== sectionKey) return;
      // console.log("verified id mission data is", data);
      setIsIdMissionProcessing(false);
      const formDataOfIdMission = data?.Form_Data;

      setIdMissionVerifiedData({
        idMissionName: {
          name: "idMissionName",
          value: makeCompleteName(
            formDataOfIdMission?.First_Name,
            formDataOfIdMission?.Middle_Name,
            formDataOfIdMission?.Last_Name,
            formDataOfIdMission?.FullName,
            formDataOfIdMission?.Name,
          ),
        },

        idMissionEmail: { name: "idMissionEmail", value: formDataOfIdMission?.Email || user?.email || "" },
        idMissionIdNumber: { name: "idMissionIdNumber", value: formDataOfIdMission?.ID_Number || "" },
        idMissionIdIssuer: {
          name: "idMissionIdIssuer",
          value: formDataOfIdMission?.ID_State
            ? formDataOfIdMission?.ID_State + formDataOfIdMission?.Issuing_Country
            : formDataOfIdMission?.Issuing_Country || "",
        },
        idMissionIdType: { name: "idMissionIdType", value: formDataOfIdMission?.DocumentType || "" },
        idMissionIdExpiryDate: {
          name: "idMissionIdExpiryDate",
          value: formDataOfIdMission?.Expiration_Date ? formatData(formDataOfIdMission?.Expiration_Date) : "",
        },
        idMissionStreetAddress: {
          name: "idMissionStreetAddress",
          value:
            (formDataOfIdMission?.ParsedAddressStreetNumber || "") +
            " " +
            (formDataOfIdMission?.ParsedAddressStreetName || ""),
        },
        idMissionPhoneNumber: { name: "idMissionPhoneNumber", value: formDataOfIdMission?.PhoneNumber || "" },
        idMissionZipCode: { name: "idMissionZipCode", value: formDataOfIdMission?.ParsedAddressPostalCode || "" },
        dateOfBirth: {
          name: "idMissionDateOfBirth",
          value: formDataOfIdMission?.Date_of_Birth ? formatData(formDataOfIdMission?.Date_of_Birth) : "",
        },
        idMissionCountry: { name: "idMissionCountry", value: formDataOfIdMission?.Issuing_Country || "" },
        issueDate: {
          name: "idMissionIssueDate",
          value: formDataOfIdMission?.Issue_Date ? formatData(formDataOfIdMission?.Issue_Date) : "",
        },
        idMissionCompanyTitle: { name: "idMissionCompanyTitle", value: "" },
        idMissionState: { name: "idMissionState", value: formDataOfIdMission?.ParsedAddressProvince || "" },
        idMissionCity: { name: "idMissionCity", value: formDataOfIdMission?.ParsedAddressMunicipality || "" },
        idMissionData: { name: "idMissionData", value: formDataOfIdMission || "null" },
        createdAt: idMissionVerifiedData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
    // id mission failed
    socket.on("idMission_failed", async (data) => {
      if (data?.sectionKey !== sectionKey) return;
      // console.log("failed id mission data is", data);
      // console.log('You are verified successfully', data);
      setIsIdMissionProcessing(false);
      const formDataOfIdMission = data?.Form_Data;

      setIdMissionVerifiedData({
        idMissionName: {
          name: "name",
          value: makeCompleteName(
            formDataOfIdMission?.First_Name,
            formDataOfIdMission?.Middle_Name,
            formDataOfIdMission?.Last_Name,
            formDataOfIdMission?.FullName,
            formDataOfIdMission?.Name,
          ),
        },
        idMissionEmail: { name: "idMissionEmail", value: formDataOfIdMission?.Email || user?.email || "" },
        idMissionIdNumber: { name: "idMissionIdNumber", value: formDataOfIdMission?.ID_Number || "" },
        idMissionIdIssuer: {
          name: "idIssuer",
          value: formDataOfIdMission?.ID_State
            ? formDataOfIdMission?.ID_State + formDataOfIdMission?.Issuing_Country
            : formDataOfIdMission?.Issuing_Country || "",
        },
        idMissionIdType: { name: "idMissionIdType", value: formDataOfIdMission?.DocumentType || "" },
        idExpiryDate: {
          name: "idMissionIdExpiryDate",
          value: formDataOfIdMission?.Expiration_Date ? formatData(formDataOfIdMission?.Expiration_Date) : "",
        },
        idMissionStreetAddress: {
          name: "idMissionStreetAddress",
          value: formDataOfIdMission?.ParsedAddressStreetNumber + formDataOfIdMission?.ParsedAddressStreetName || "",
        },
        idMissionPhoneNumber: { name: "idMissionPhoneNumber", value: formDataOfIdMission?.PhoneNumber || "" },
        idMissionZipCode: { name: "idMissionZipCode", value: formDataOfIdMission?.ParsedAddressPostalCode || "" },
        idMissionDateOfBirth: {
          name: "idMissionDateOfBirth",
          value: formDataOfIdMission?.Date_of_Birth ? formatData(formDataOfIdMission?.Date_of_Birth) : "",
        },
        idMissionCountry: { name: "idMissionCountry", value: formDataOfIdMission?.Issuing_Country || "" },
        issueDate: {
          name: "idMissionIssueDate",
          value: formDataOfIdMission?.Issue_Date ? formatData(formDataOfIdMission?.Issue_Date) : "",
        },
        idMissionCompanyTitle: { name: "idMissionCompanyTitle", value: "" },
        idMissionState: { name: "idMissionState", value: formDataOfIdMission?.ParsedAddressProvince || "" },
        idMissionCity: { name: "idMissionCity", value: formDataOfIdMission?.ParsedAddressMunicipality || "" },
        idMissionData: { name: "idMissionData", value: formDataOfIdMission || "null" },
        createdAt: idMissionVerifiedData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
    socket.on("idMission_other", async (data) => {
      if (data?.sectionKey !== sectionKey) return;
      // console.log("other id mission data is", data);

      setIsIdMissionProcessing(false);
      const formDataOfIdMission = data?.Form_Data;
      const metadata = data?.Metadata;
      if (metadata?.sectionKey !== sectionKey) return;
      setIdMissionVerifiedData({
        idMissionName: {
          name: "idMissionName",
          value: makeCompleteName(
            formDataOfIdMission?.First_Name,
            formDataOfIdMission?.Middle_Name,
            formDataOfIdMission?.Last_Name,
            formDataOfIdMission?.FullName,
            formDataOfIdMission?.Name,
          ),
        },
        idMissionEmail: { name: "idMissionEmail", value: formDataOfIdMission?.Email || user?.email || "" },
        idMissionIdNumber: { name: "idMissionIdNumber", value: formDataOfIdMission?.ID_Number || "" },
        idMissionIdIssuer: {
          name: "idMissionIdIssuer",
          value: formDataOfIdMission?.ID_State
            ? formDataOfIdMission?.ID_State + formDataOfIdMission?.Issuing_Country
            : formDataOfIdMission?.Issuing_Country || "",
        },
        idMissionIdType: { name: "idMissionIdType", value: formDataOfIdMission?.DocumentType || "" },
        idMissionIdExpiryDate: {
          name: "idMissionIdExpiryDate",
          value: formDataOfIdMission?.Expiration_Date ? formatData(formDataOfIdMission?.Expiration_Date) : "",
        },
        idMissionStreetAddress: {
          name: "idMissionStreetAddress",
          value: formDataOfIdMission?.ParsedAddressStreetNumber + formDataOfIdMission?.ParsedAddressStreetName || "",
        },
        idMissionPhoneNumber: { name: "idMissionPhoneNumber", value: formDataOfIdMission?.PhoneNumber || "" },
        idMissionZipCode: { name: "idMissionZipCode", value: formDataOfIdMission?.ParsedAddressPostalCode || "" },
        idMissionDateOfBirth: {
          name: "idMissionDateOfBirth",
          value: formDataOfIdMission?.Date_of_Birth ? formatData(formDataOfIdMission?.Date_of_Birth) : "",
        },
        idMissionCountry: { name: "idMissionCountry", value: formDataOfIdMission?.Issuing_Country || "" },
        idMissionIssueDate: {
          name: "idMissionIssueDate",
          value: formDataOfIdMission?.Issue_Date ? formatData(formDataOfIdMission?.Issue_Date) : "",
        },
        idMissionCompanyTitle: { name: "idMissionCompanyTitle", value: "" },
        idMissionState: { name: "idMissionState", value: formDataOfIdMission?.ParsedAddressProvince || "" },
        idMissionCity: { name: "idMissionCity", value: formDataOfIdMission?.ParsedAddressMunicipality || "" },
        idMissionData: { name: "idMissionData", value: formDataOfIdMission || "null" },
        createdAt: idMissionVerifiedData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // Cleanup listener when component unmounts
    return () => {
      socket.off("idMission_processing_started");
      socket.off("idMission_verified");
      socket.off("idMission_failed");
      socket.off("idMission_other");
    };
  }, [idMissionVerifiedData?.createdAt, sectionKey, user?.email]);

  if (isLoading || isLoadingFormData) return <CustomLoading />;
  return (
    <div className="mt-14 h-full overflow-auto">
      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={section} setModal={setUpdateSectionFromatingModal} />
        </Modal>
      )}

      <div className="mb-10 flex items-center justify-between">
        <p className="text-textPrimary text-2xl font-semibold">{section?.name}</p>

        <div className="flex gap-2">
          {isCreator && (
            <>
              <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={"Customize"} />
              <Button onClick={() => setUpdateSectionFromatingModal(true)} label={"Update Display Text"} />
            </>
          )}
        </div>
      </div>

      {section?.ai_formatting && (
        <div className="mb-4 flex w-full items-end gap-3">
          <div
            className="w-full"
            ref={containerRef}
            dangerouslySetIn
            nerHTML={{
              __html: String(section?.ai_formatting).replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match;
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}

      {section?.isIdMissionQr && (
        <div className="flex items-center justify-center w-full">
          {isIdMissionProcessing ? (
            <LoadingWithTimer setIsProcessing={setIsIdMissionProcessing} />
          ) : (
            <>
              <div className="flex flex-col  gap-4">
                <div className="mt-4 flex w-full flex-col items-center gap-4">
                  {qrCode ? (
                    <img className="h-57.5 w-57.5" src={`data:image/jpeg;base64,${qrCode}`} alt="qr code " />
                  ) : (
                    <CustomLoading />
                  )}
                </div>
                <div className="mt-4 flex w-full flex-col items-center gap-4">
                  <Button
                    className="w-full max-w-57.5"
                    disabled={getQrAndWebLinkLoading || isGetIdMissionSessionLoading}
                    label={"Refresh QR Code"}
                    onClick={getQrAndWebLink}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {section?.fields?.length > 0 &&
        section?.fields?.map((field, index) => {
          if (field.type === FIELD_TYPES.SELECT) {
            return (
              <div key={index} className="mt-4">
                <SelectInputType field={field} form={form} setForm={setForm} className={""} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.MULTI_CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <MultiCheckboxInputType field={field} form={form} setForm={setForm} className={""} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.FILE) {
            return (
              <div key={index} className="mt-4">
                <FileInputType field={field} form={form} setForm={setForm} className={""} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RADIO) {
            return (
              <div key={index} className="mt-4 flex flex-col gap-2">
                <RadioInputType field={field} form={form} setForm={setForm} className={""} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RANGE) {
            return (
              <div key={index} className="mt-4">
                <RangeInputType field={field} form={form} setForm={setForm} className={""} />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <CheckboxInputType
                  field={field}
                  placeholder={field.placeholder}
                  form={form}
                  setForm={setForm}
                  className={""}
                />
              </div>
            );
          }
          return (
            <div key={index} className="mt-4">
              <OtherInputType
                field={field}
                placeholder={field.placeholder}
                form={form}
                setForm={setForm}
                className={""}
              />
            </div>
          );
        })}

      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <Button
          className={`${isSubmittingSpecialAccessForm ? "pinter-events-none opacity-50" : ""} cursor-not-allowed`}
          disabled={isSubmittingSpecialAccessForm}
          onClick={handleSubmitSpecialAccessForm}
          label={"Submit"}
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
}

export default FormHiddenSection;
