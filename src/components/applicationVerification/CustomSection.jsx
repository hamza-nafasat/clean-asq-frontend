import { FIELD_TYPES } from "@/data/constants";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import SignatureBox from "../shared/SignatureBox";
import Button from "../shared/small/Button";
import {
  CheckboxInputType,
  FileInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from "../shared/small/DynamicField";
import { EditSectionDisplayTextFromatingModal } from "../shared/small/EditSectionDisplayTextFromatingModal";
import Modal from "../shared/small/Modal";
import CustomizationFieldsModal from "./companyInfo/CustomizationFieldsModal";
import { useGetIdMissionSessionMutation } from "@/redux/apis/idMissionApis";
import { socket } from "@/main";
import { formatData, makeCompleteName } from "@/utils/idMissionMapingUtils";
import { LoadingWithTimer } from "../shared/small/LoadingWithTimer";
import CustomLoading from "../shared/small/CustomLoading";

function CustomSection({
  sectionKey,
  fields,
  name,
  currentStep,
  totalSteps,
  handleNext,
  handlePrevious,
  handleSubmit,
  formRefetch,
  _id,
  saveInProgress,
  step,
  reduxData,
  isSignature,
}) {
  const { user } = useSelector((state) => state.auth);
  const [updateSectionFromatingModal, setUpdateSectionFromatingModal] = useState(false);
  const [form, setForm] = useState({});
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [customizeModal, setCustomizeModal] = useState(false);
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
  // console.log("idMissionVerifiedData", idMissionVerifiedData);
  const requiredNames = useMemo(
    () => fields.filter((f) => f.required).map((f) => ({ name: f.name, uniqueId: f.uniqueId })),
    [fields],
  );
  const isCreator = user?._id && user?._id === step?.owner && user?.role !== "guest";

  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please select a file");
      if (file) {
        const oldSign = form?.["signature"]?.value;
        if (oldSign?.publicId) {
          const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
          if (!result) return toast.error("File Not Deleted Please Try Again");
        }
        const res = await uploadImageOnCloudinary(file);
        if (!res.publicId || !res.secureUrl || !res.resourceType) {
          return toast.error("File Not Uploaded Please Try Again");
        }
        setForm((prev) => ({ ...prev, signature: { name: "signature", value: res } }));
        toast.success("Signature uploaded successfully");
      }
    } catch (error) {
      console.log("error while uploading signature", error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };
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
  useEffect(() => {
    const formFields = {};
    if (fields?.length) {
      fields?.forEach((field) => {
        const idMissionValue = idMissionVerifiedData?.[field?.name]?.value;
        const finalValue =
          idMissionValue !== undefined
            ? { name: field?.name, value: idMissionValue }
            : (reduxData?.[field?.uniqueId] ?? "");
        formFields[field?.uniqueId] = finalValue;
      });
      setForm(formFields);
    }
    if (isSignature) {
      const isSignatureExistingData = {};
      if (reduxData?.signature?.value?.publicId)
        isSignatureExistingData.publicId = reduxData?.signature?.value?.publicId;
      if (reduxData?.signature?.value?.secureUrl)
        isSignatureExistingData.secureUrl = reduxData?.signature?.value?.secureUrl;
      if (reduxData?.signature?.value?.resourceType)
        isSignatureExistingData.resourceType = reduxData?.signature?.value?.resourceType;
      setForm((prev) => ({
        ...prev,
        ["signature"]: {
          name: "signature",
          value: isSignatureExistingData?.publicId
            ? isSignatureExistingData
            : { publicId: "", secureUrl: "", resourceType: "" },
        },
      }));
    }
  }, [fields, idMissionVerifiedData, isSignature, reduxData]);

  useEffect(() => {
    if (isCreator) {
      setIsAllRequiredFieldsFilled(true);
      return;
    }
    const allFilled = requiredNames.every(({ uniqueId }) => {
      const val = form[uniqueId]?.value;
      if (val == null) return false;
      if (typeof val === "string") return val.trim() !== "";
      if (Array.isArray(val))
        return (
          val.length > 0 &&
          val.every((item) =>
            typeof item === "object"
              ? Object.values(item).every((v) => v?.toString().trim() !== "")
              : item?.toString().trim() !== "",
          )
        );
      if (typeof val === "object") return Object.values(val).every((v) => v?.toString().trim() !== "");
      return true;
    });

    let isSignatureDone = true;
    if (isSignature) {
      let dataOfSign = form?.["signature"]?.value;
      if (!dataOfSign?.publicId || !dataOfSign?.secureUrl || !dataOfSign?.resourceType) {
        isSignatureDone = false;
      }
    }
    setIsAllRequiredFieldsFilled(allFilled && isSignatureDone);
  }, [form, isCreator, isSignature, requiredNames]);
  useEffect(() => {
    if (step?.isIdMissionQr) {
      setGetQrAndWebLinkLoading(true);
      getQrAndWebLink().finally(() => setGetQrAndWebLinkLoading(false));
    }
  }, [getQrAndWebLink, step?.isIdMissionQr, setGetQrAndWebLinkLoading]);

  // check and get socket events
  useEffect(() => {
    socket.on("idMission_processing_started", (data) => {
      console.log("you start id mission verification", data);
      setIsIdMissionProcessing(true);
    });
    // id mission verified success fully
    socket.on("idMission_verified", async (data) => {
      if (data?.sectionKey !== sectionKey) return;
      console.log("verified id mission data is", data);
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
      console.log("failed id mission data is", data);
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
      console.log("other id mission data is", data);

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
  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
        <div className="flex gap-2"></div>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={() => saveInProgress({ data: form, name: sectionKey })} label={"Save my progress"} />
        {isCreator && (
          <>
            <Button variant="secondary" onClick={() => setCustomizeModal(true)} label={"Customize"} />
            <Button onClick={() => setUpdateSectionFromatingModal(true)} label={"Update Display Text"} />
          </>
        )}
      </div>

      {updateSectionFromatingModal && (
        <Modal isOpen={updateSectionFromatingModal} onClose={() => setUpdateSectionFromatingModal(false)}>
          <EditSectionDisplayTextFromatingModal step={step} setModal={setUpdateSectionFromatingModal} />
        </Modal>
      )}
      {step?.ai_formatting && (
        <div className="flex w-full items-end justify-between gap-3">
          <div
            className="mt-2 mb-4 w-full"
            dangerouslySetInnerHTML={{
              __html: String(step?.ai_formatting || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match; // avoid duplicates
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        </div>
      )}
      {step?.isIdMissionQr && (
        <div className="flex items-center justify-center w-full">
          {isIdMissionProcessing ? (
            <LoadingWithTimer setIsProcessing={setIsIdMissionProcessing} />
          ) : (
            <>
              <div className="flex flex-col  gap-4">
                <div className="mt-4 flex w-full flex-col items-center gap-4">
                  {qrCode ? (
                    <img className="h-[230px] w-[230px]" src={`data:image/jpeg;base64,${qrCode}`} alt="qr code " />
                  ) : (
                    <CustomLoading />
                  )}
                </div>
                <div className="mt-4 flex w-full flex-col items-center gap-4">
                  <Button
                    className="w-full max-w-[230px]"
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
      <div className="mt-6 flex flex-col gap-4">
        {fields?.map((field, index) => {
          if (field.name === "main_owner_own_25_percent_or_more" || field.type === "block") return null;
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
              <div key={index} className="mt-4">
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
      </div>
      <div className="mt-4">
        {isSignature && (
          <SignatureBox
            step={step}
            onSave={signatureUploadHandler}
            oldSignatureUrl={form?.signature?.value?.secureUrl || ""}
          />
        )}
      </div>

      {/* next Previous buttons  */}
      <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={"Previous"} onClick={handlePrevious} />}
          {currentStep < totalSteps - 2 ? (
            <Button
              disabled={!isAllRequiredFieldsFilled}
              label={!isAllRequiredFieldsFilled ? "Some required fields are missing" : "Next"}
              onClick={() => handleNext({ data: form, name: sectionKey, setLoadingNext })}
            />
          ) : (
            <Button
              disabled={!isAllRequiredFieldsFilled || loadingNext}
              className={`${!isAllRequiredFieldsFilled || loadingNext ? "pointer-events-none cursor-not-allowed opacity-20" : "opacity-100"}`}
              label={!isAllRequiredFieldsFilled ? "Some required fields are missing" : "Submit"}
              onClick={() => handleSubmit({ data: form, name: sectionKey, setLoadingNext })}
            />
          )}
        </div>
      </div>
      {customizeModal && (
        <Modal onClose={() => setCustomizeModal(false)}>
          <CustomizationFieldsModal
            sectionId={_id}
            suggestions={Object.keys(idMissionVerifiedData)}
            fields={fields}
            formRefetch={formRefetch}
            onClose={() => setCustomizeModal(false)}
            section={step}
          />
        </Modal>
      )}
    </div>
  );
}

export default CustomSection;
