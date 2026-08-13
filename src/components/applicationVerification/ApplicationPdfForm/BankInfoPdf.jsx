import { FIELD_TYPES } from "@/data/constants";
import { useGetBankLookupMutation } from "@/redux/apis/formApis";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import SignatureBox from "../../shared/SignatureBox";
import Button from "../../shared/small/Button";
import Modal from "../../shared/small/Modal";
import {
  CheckboxInputType,
  FileInputType,
  MultiCheckboxInputType,
  OtherInputType,
  RadioInputType,
  RangeInputType,
  SelectInputType,
} from "./shared/DynamicFieldForPdf";

function BankInfoPdf({ name, fields, step, isSignature, formInnerData, setFormInnerData, sectionKey }) {
  const { formData, isDisabledAllFields } = useSelector((state) => state?.form);
  const [error] = useState(null);
  const [accMatch, setAccMatch] = useState(false);
  const [ownersFromLookup, setOwnersFromLookup] = useState([]);
  const [bankModal, setBankModal] = useState(null);
  const [getBankLookup, { isLoading }] = useGetBankLookupMutation();

  const signatureUploadHandler = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please select a file");

      if (file) {
        const oldSign = formInnerData?.[sectionKey]?.["signature"]?.value;
        if (oldSign?.publicId) {
          const result = await deleteImageFromCloudinary(oldSign?.publicId, oldSign?.resourceType);
          if (!result) return toast.error("File Not Deleted Please Try Again");
        }
        const res = await uploadImageOnCloudinary(file);
        if (!res.publicId || !res.secureUrl || !res.resourceType) {
          return toast.error("File Not Uploaded Please Try Again");
        }
        setFormInnerData((prev) => ({
          ...prev,
          [sectionKey]: { ...prev?.[sectionKey], signature: { name: "signature", value: res } },
        }));
        toast.success("Signature uploaded successfully");
      }
    } catch (error) {
      console.log("error while uploading signature", error);
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

  const getLookupRoutingHandler = async (routing) => {
    try {
      const res = await getBankLookup(routing).unwrap();
      if (res.success && Array.isArray(res?.data?.bankDetailsList) && res?.data?.bankDetailsList?.length > 0) {
        setBankModal(res?.data?.bankDetailsList?.[0]);
      } else {
        setBankModal(null);
        toast.error(
          "we’re unable to verify this routing number, if you are sure it’s correct please continue. Otherwise correct any errors before moving forward.",
        );
      }
    } catch (error) {
      console.log("error while getting bank lookup", error);
      setBankModal(null);
      toast.error(
        "we’re unable to verify this routing number, if you are sure it’s correct please continue. Otherwise correct any errors before moving forward.",
      );
    }
  };

  // add owners for account holder suggestions
  useEffect(() => {
    if (formData) {
      const lookupData = formData?.company_lookup_data;
      const searchField = step?.ownerSuggesstions || ["founders"];
      const founders = [];
      searchField.forEach((field) => {
        let data = lookupData?.find((item) => item?.name == field)?.result;
        if (Array.isArray(data) && typeof data === "object") {
          founders.push(...data);
        } else if (typeof data === "string") {
          founders.push(data);
        } else if (typeof data === "number") {
          founders.push(data);
        }
      });
      if (founders?.length) {
        const uniqueFounders = founders.filter((item, index) => founders.indexOf(item) === index);
        setOwnersFromLookup(uniqueFounders);
      } else {
        setOwnersFromLookup([]);
      }
    }
  }, [formData, step?.ownerSuggesstions]);

  useEffect(() => {
    const section = formInnerData?.[sectionKey] || {};
    const findBankAccountNumberUniqueId = fields.find((field) => field.name === "bank_account_number")?.uniqueId;
    const findConfirmBankAccountNumberUniqueId = fields.find(
      (field) => field.name === "confirm_bank_account_number",
    )?.uniqueId;
    const isMatch =
      section[findBankAccountNumberUniqueId]?.value &&
      section[findConfirmBankAccountNumberUniqueId]?.value &&
      section[findBankAccountNumberUniqueId]?.value === section[findConfirmBankAccountNumberUniqueId]?.value;
    setAccMatch(isMatch);
  }, [formInnerData, fields, sectionKey]);

  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
      </div>
      {(step?.ai_formatting || step?.displayText) && (
        <div className="mb-4 flex w-full items-end justify-between gap-3">
          <div
            dangerouslySetInnerHTML={{
              __html: step?.ai_formatting || step?.displayText,
            }}
          />
        </div>
      )}

      {fields?.length > 0 &&
        fields.map((field, index) => {
          if (field.name === "bank_routing_number") {
            return (
              <div key={index}>
                <div className="mt-4 flex items-center gap-2">
                  <OtherInputType
                    field={field}
                    placeholder={field.placeholder}
                    form={formInnerData?.[sectionKey]}
                    setForm={setFormInnerData}
                    sectionKey={sectionKey}
                    className="flex-1"
                  />
                  {!isDisabledAllFields && (
                    <Button
                      label={isLoading ? "Looking Up..." : "Look Up"}
                      className="mt-8"
                      onClick={async () => {
                        const routingValue = formInnerData?.[sectionKey]?.[field?.uniqueId]?.value;
                        if (routingValue) {
                          getLookupRoutingHandler(routingValue);
                        }
                      }}
                    />
                  )}
                </div>
                {error && <p className="text-red-500">{error}</p>}
              </div>
            );
          }

          if (field.name === "confirm_bank_account_number") {
            return (
              <div key={index} className="relative mt-4">
                <OtherInputType
                  field={field}
                  placeholder={field.placeholder}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
                  className="w-full pr-10"
                  isConfirmField
                />
                <div className="mt-2 flex items-center gap-2">
                  {formInnerData?.[sectionKey]?.[field?.uniqueId]?.value && (
                    <span className="">
                      {accMatch ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </span>
                  )}
                  <p className="text-xs text-gray-500">Please type your account number manually (no copy/paste).</p>
                </div>
              </div>
            );
          }

          if (field.name === "bank_account_holder_name") {
            return (
              <div key={index} className="relative mt-4">
                <OtherInputType
                  field={field}
                  suggestions={ownersFromLookup}
                  placeholder={field.placeholder}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
                  className="w-full"
                />
              </div>
            );
          }

          if (field.type === FIELD_TYPES.SELECT) {
            return (
              <div key={index} className="mt-4">
                <SelectInputType
                  field={field}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
                  className={""}
                />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.MULTI_CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <MultiCheckboxInputType
                  field={field}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
                  className={""}
                />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RADIO) {
            return (
              <div key={index} className="mt-4">
                <RadioInputType
                  field={field}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
                  className={""}
                />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.FILE) {
            return (
              <div key={index} className="mt-4">
                <FileInputType
                  field={field}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
                  className={""}
                />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.RANGE) {
            return (
              <div key={index} className="mt-4">
                <RangeInputType
                  field={field}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
                  className={""}
                />
              </div>
            );
          }
          if (field.type === FIELD_TYPES.CHECKBOX) {
            return (
              <div key={index} className="mt-4">
                <CheckboxInputType
                  field={field}
                  placeholder={field.placeholder}
                  form={formInnerData?.[sectionKey]}
                  setForm={setFormInnerData}
                  sectionKey={sectionKey}
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
                form={formInnerData?.[sectionKey]}
                setForm={setFormInnerData}
                sectionKey={sectionKey}
                className={""}
              />
            </div>
          );
        })}

      <div className="mt-4">
        {isSignature && (
          <SignatureBox
            step={step}
            isPdf={true}
            onSave={signatureUploadHandler}
            oldSignatureUrl={formInnerData?.[sectionKey]?.signature?.value?.secureUrl || ""}
          />
        )}
      </div>

      {bankModal && (
        <Modal title={"Bank for your routing number "} isOpen={!!bankModal} onClose={() => setBankModal(null)}>
          {bankModal?.bankName ? (
            <>
              <p className="mb-6 leading-relaxed text-gray-600">
                That routing number belongs to{" "}
                <span className="font-semibold text-gray-900">{bankModal.bankName}</span>. Is this the bank you
                intended to enter?
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  label="No"
                  onClick={() => setBankModal(null)}
                  className="rounded-lg px-4 py-2"
                />
                <Button
                  label="Yes"
                  onClick={() => {
                    setFormInnerData((prev) => {
                      const section = prev?.[sectionKey] || {};
                      const bankNameId = Object.keys(section).find((key) => section[key]?.name === "bank_name");
                      if (!bankNameId) return prev;
                      return {
                        ...prev,
                        [sectionKey]: {
                          ...section,
                          [bankNameId]: { name: "bank_name", value: bankModal.bankName },
                        },
                      };
                    });
                    setBankModal(null);
                  }}
                  className="rounded-lg px-4 py-2"
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-3 text-xl font-semibold text-red-600">
                We could not identify a bank with this routing number. Please double-check the number or try again.
              </h2>
              <div className="flex justify-end">
                <Button label="Close" onClick={() => setBankModal(null)} className="rounded-lg px-4 py-2" />
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

export default BankInfoPdf;
