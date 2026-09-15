import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";

import { useGetBankLookupMutation } from "@/redux/apis/form.apis";
import ApplicationPdfField from "@/components/global/ApplicationPdfField";
import ApplicationPdfOtherInputType from "@/components/global/ApplicationPdfOtherInputType";
import SignatureBox from "@/components/global/SignatureBox";
import BankLookupModal from "@/components/modals/BankLookupModal";
import Button from "@/components/shared/Button";
import { FIELD_NAMES, SIGNATURE_KEY } from "@/constants";
import { collectLookupOwners } from "@/utils/lookupOwners";
import { uploadSectionSignature } from "@/utils/sectionSignature";
import HtmlContent from "@/components/shared/HtmlContent";

const ROUTING_NOT_VERIFIED_MESSAGE =
  "we’re unable to verify this routing number, if you are sure it’s correct please continue. Otherwise correct any errors before moving forward.";

const BankInfoPdf = ({ name, fields, step, isSignature, formInnerData, setFormInnerData, sectionKey }) => {
  const { formData, isDisabledAllFields } = useSelector((state) => state?.form);
  const [ownersFromLookup, setOwnersFromLookup] = useState([]);
  const [bankModal, setBankModal] = useState(null);
  const [getBankLookup, { isLoading }] = useGetBankLookupMutation();

  const sectionData = formInnerData?.[sectionKey] || {};
  const accountNumberId = fields.find((field) => field.name === FIELD_NAMES.BANK_ACCOUNT_NUMBER)?.uniqueId;
  const confirmAccountNumberId = fields.find(
    (field) => field.name === FIELD_NAMES.CONFIRM_BANK_ACCOUNT_NUMBER,
  )?.uniqueId;
  const accMatch =
    sectionData[accountNumberId]?.value &&
    sectionData[confirmAccountNumberId]?.value &&
    sectionData[accountNumberId]?.value === sectionData[confirmAccountNumberId]?.value;

  const handleRoutingLookup = async (routing) => {
    try {
      const res = await getBankLookup(routing).unwrap();
      if (res.success && Array.isArray(res?.data?.bankDetailsList) && res?.data?.bankDetailsList?.length > 0) {
        setBankModal(res?.data?.bankDetailsList?.[0]);
      } else {
        setBankModal(null);
        toast.error(ROUTING_NOT_VERIFIED_MESSAGE);
      }
    } catch (error) {
      console.error("Bank lookup error:", error);
      setBankModal(null);
      toast.error(ROUTING_NOT_VERIFIED_MESSAGE);
    }
  };

  const handleConfirmBank = (bankName) => {
    setFormInnerData((prev) => {
      const section = prev?.[sectionKey] || {};
      const bankNameId = Object.keys(section).find((key) => section[key]?.name === FIELD_NAMES.BANK_NAME);
      if (!bankNameId) return prev;
      return { ...prev, [sectionKey]: { ...section, [bankNameId]: { name: FIELD_NAMES.BANK_NAME, value: bankName } } };
    });
    setBankModal(null);
  };

  // owners from the lookup as account holder suggestions
  useEffect(() => {
    if (formData) setOwnersFromLookup(collectLookupOwners(formData, step?.ownerSuggesstions));
  }, [formData, step?.ownerSuggesstions]);

  const renderField = (field, index) => {
    const inputProps = { field, form: formInnerData?.[sectionKey], setForm: setFormInnerData, sectionKey };

    if (field.name === FIELD_NAMES.BANK_ROUTING_NUMBER) {
      return (
        <div key={index}>
          <div className="mt-4 flex items-center gap-2">
            <ApplicationPdfOtherInputType {...inputProps} className="flex-1" />
            {!isDisabledAllFields && (
              <Button
                label={isLoading ? "Looking Up..." : "Look Up"}
                className="mt-8"
                onClick={() => {
                  const routingValue = formInnerData?.[sectionKey]?.[field?.uniqueId]?.value;
                  if (routingValue) handleRoutingLookup(routingValue);
                }}
              />
            )}
          </div>
        </div>
      );
    }

    if (field.name === FIELD_NAMES.CONFIRM_BANK_ACCOUNT_NUMBER) {
      return (
        <div key={index} className="relative mt-4">
          <ApplicationPdfOtherInputType {...inputProps} className="w-full pr-10" isConfirmField />
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

    if (field.name === FIELD_NAMES.BANK_ACCOUNT_HOLDER_NAME) {
      return (
        <div key={index} className="relative mt-4">
          <ApplicationPdfOtherInputType {...inputProps} suggestions={ownersFromLookup} className="w-full" />
        </div>
      );
    }

    return <ApplicationPdfField key={index} {...inputProps} />;
  };

  return (
    <div className="mt-14 h-full overflow-auto rounded-lg border p-6 shadow-md">
      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-textPrimary text-2xl font-semibold">{name}</h3>
      </div>
      {(step?.ai_formatting || step?.displayText) && (
        <div className="mb-4 flex w-full items-end justify-between gap-3">
          <HtmlContent html={step?.ai_formatting || step?.displayText} linkMode="none" />
        </div>
      )}

      {fields?.length > 0 && fields.map(renderField)}

      <div className="mt-4">
        {isSignature && (
          <SignatureBox
            step={step}
            isPdf={true}
            onSave={(file, setIsSaving) =>
              uploadSectionSignature({ file, setIsSaving, sectionKey, formInnerData, setFormInnerData })
            }
            oldSignatureUrl={formInnerData?.[sectionKey]?.[SIGNATURE_KEY]?.value?.secureUrl || ""}
          />
        )}
      </div>

      <BankLookupModal
        isOpen={Boolean(bankModal)}
        bankName={bankModal?.bankName}
        onClose={() => setBankModal(null)}
        onConfirm={() => handleConfirmBank(bankModal?.bankName)}
      />
    </div>
  );
};

export default BankInfoPdf;
