import { Fragment } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { RadioInputType } from "@/components/global/DynamicField";
import SignatureBox from "@/components/global/SignatureBox";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import { ROLE_FILLING_FIELD } from "@/constants";
import { ADDRESS_AUTOCOMPLETE_OPTIONS, ID_MISSION_DETAIL_FIELDS } from "../utils/applicant.constants";
import { getIdMissionSignDisplayHtml } from "../utils/applicant.utils5";
import { stripHtml } from "../utils/applicant.utils6";
import HtmlContent from "@/components/shared/HtmlContent";

const ApplicantIdMissionDetailsForm = ({
  formDocument = {},
  section = {},
  isCreator = false,
  data = {},
  setData,
  formRef,
  isAllRequiredFieldsFilled = false,
  isSubmitting = false,
  onKeyDown,
  onPlaceLoad,
  onPlaceChanged,
  onCustomizeText,
  onEnableHelp,
  onCustomizeSignature,
  onSaveSignature,
  onSkip,
  onSubmit,
}) => {
  const signDisplayHtml = getIdMissionSignDisplayHtml(formDocument, section);
  const signatureAiText = (
    stripHtml(formDocument?.idMissionSignDisplayFormatedText) || stripHtml(formDocument?.idMissionSignDisplayText)
  ).slice(0, 500);
  const signatureUrl = data?.signature?.value?.secureUrl || "";

  return (
    <div className="flex w-full flex-col p-2">
      <div className="flex items-center justify-between">
        {formDocument?.idMissionDataDisplayFormatedText ? (
          <div className="flex items-end gap-3">
            <HtmlContent className="w-full" data-ai-display-text html={formDocument?.idMissionDataDisplayFormatedText} />
          </div>
        ) : (
          <div className="flex w-full gap-3">
            <h3 className="text-textPrimary mb-4 w-full text-center text-2xl font-semibold">
              Primary Applicant Information
            </h3>
          </div>
        )}
        {isCreator && <Button className="self-end" label="Customize Display Text" onClick={onCustomizeText} />}
      </div>

      <form ref={formRef} onKeyDown={onKeyDown} className="flex flex-wrap gap-4">
        {ID_MISSION_DETAIL_FIELDS.map(({ hasEmptyFallback, isAddressLookup, ...field }) => {
          const value = data?.[field.name]?.value;
          const input = (
            <TextField
              id={field.name}
              {...field}
              value={hasEmptyFallback ? value || "" : value}
              onChange={(e) => setData?.({ ...data, [field.name]: { name: field.name, value: e.target.value } })}
              className="max-w-100!"
            />
          );
          if (!isAddressLookup) return <Fragment key={field.name}>{input}</Fragment>;
          return (
            <div key={field.name} data-places-input="true" className="w-full max-w-100">
              <Autocomplete
                onLoad={onPlaceLoad}
                className="w-full"
                onPlaceChanged={onPlaceChanged}
                options={ADDRESS_AUTOCOMPLETE_OPTIONS}
              >
                {input}
              </Autocomplete>
            </div>
          );
        })}
        <div className="bg-backgroundColor flex w-full border p-4">
          <RadioInputType
            optionColumnCount={1}
            className="w-full"
            field={ROLE_FILLING_FIELD}
            form={{
              roleFillingForCompany: {
                name: ROLE_FILLING_FIELD.name,
                value: data?.roleFillingForCompany?.value || "",
              },
            }}
            onChange={(e) =>
              setData?.((prev) => ({
                ...prev,
                roleFillingForCompany: { name: ROLE_FILLING_FIELD.name, value: e?.target?.value },
              }))
            }
          />
        </div>

        {/* Signature */}
        <div className="flex w-full flex-col">
          <div className="my-4 flex w-full justify-between gap-2">
            {signDisplayHtml && (
              <div className="flex items-end gap-3">
                <HtmlContent className="w-full" data-ai-display-text html={signDisplayHtml} />
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              {isCreator && (
                <div className="flex items-center gap-2">
                  <Button label="Enable Help" onClick={onEnableHelp} />
                  <Button label="Customize Signature" onClick={onCustomizeSignature} />
                </div>
              )}
            </div>
          </div>
          <div
            data-ai-type="sign"
            data-ai-id="signature-field"
            data-ai-label="Signature"
            data-ai-required="true"
            data-ai-value={signatureUrl}
            data-ai-text={signatureAiText}
          >
            <SignatureBox oldSignatureUrl={signatureUrl} className="min-w-full" onSave={onSaveSignature} />
          </div>
        </div>
      </form>

      {/* Actions */}
      <div className="flex w-full items-center justify-end gap-2 p-2">
        {isCreator && <Button onClick={onSkip} className="mt-4" variant="secondary" label="Skip for now" />}
        <Button
          disabled={!isAllRequiredFieldsFilled || isSubmitting}
          label={!isAllRequiredFieldsFilled ? "Some fields are missing" : "Continue to next"}
          onClick={onSubmit}
          className="mt-4"
        />
      </div>
    </div>
  );
};

export default ApplicantIdMissionDetailsForm;
