import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAddBrandingInFormMutation, useGetSingleBrandingQuery } from "@/redux/apis/branding.apis";
import { useGetMyAllFormsQuery } from "@/redux/apis/form.apis";
import useBranding from "@/hooks/useBranding";
import usePermission from "@/hooks/usePermission";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import TextField from "@/components/shared/TextField";
import BrandingAiSettings from "./BrandingAiSettings";
import BrandingBrowserTab from "./BrandingBrowserTab";
import BrandingColorPalette from "./BrandingColorPalette";
import BrandingElementAssignment from "./BrandingElementAssignment";
import BrandingEmailSection from "./BrandingEmailSection";
import BrandingManualExtractionModal from "./BrandingManualExtractionModal";
import BrandingPreview from "./BrandingPreview";
import BrandingSource from "./BrandingSource";
import useBrandingEditorExtraction from "../hooks/useBrandingEditorExtraction";
import useBrandingEditorForm from "../hooks/useBrandingEditorForm";
import useBrandingEditorSave from "../hooks/useBrandingEditorSave";
import useBrandingEditorScreenContext from "../hooks/useBrandingEditorScreenContext";
import useBrandingEditorSync from "../hooks/useBrandingEditorSync";
import { PERMISSIONS } from "@/utils/permissions";
import { BRANDING_ROUTES, BRANDING_SCREENSHOT_ELEMENT_ID } from "../utils/branding.constants";
import { pickFields, toFieldProps } from "../utils/branding.mapping.utils";

const ASSIGNMENT_FIELDS = [
  "headerBackground",
  "headerText",
  "appHeaderPadding",
  "headerAlignment",
  "appLogoMaxWidth",
  "appLogoMaxHeight",
  "headerEffect",
  "headerMaterial",
  "primaryColor",
  "secondaryColor",
  "buttonBorderPrimary",
  "buttonBorderSecondary",
  "buttonTextPrimary",
  "buttonTextSecondary",
  "buttonEffect",
  "buttonMaterial",
  "accentColor",
  "backgroundColor",
  "textColor",
  "linkColor",
  "frameColor",
  "highlightingColor",
  "fontFamily",
  "footerBackground",
  "footerText",
  "appFooterPadding",
  "applicationFooterText",
  "applicationFooterTextSize",
  "privacyPolicyUrl",
  "termsOfServiceUrl",
  "footerEffect",
  "footerMaterial",
];

const PREVIEW_FIELDS = [
  "companyName",
  "selectedLogo",
  "headerBackground",
  "headerText",
  "footerBackground",
  "footerText",
  "backgroundColor",
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "highlightingColor",
  "linkColor",
  "buttonTextPrimary",
  "buttonTextSecondary",
  "buttonBorderPrimary",
  "buttonBorderSecondary",
  "textColor",
  "frameColor",
  "headerAlignment",
  "applicationFooterText",
  "appHeaderPadding",
  "appFooterPadding",
  "appLogoMaxWidth",
  "appLogoMaxHeight",
  "headerEffect",
  "footerEffect",
  "buttonEffect",
  "headerMaterial",
  "footerMaterial",
  "buttonMaterial",
];

const STATE_CLASS_NAME = "flex flex-col items-center justify-center gap-4 py-16";

const BrandingEditor = ({ brandingId }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const branding = useBranding();
  const canCreateBranding = usePermission(PERMISSIONS.CREATE_BRANDING);
  const canUpdateBranding = usePermission(PERMISSIONS.UPDATE_BRANDING);
  const canFetchBranding = usePermission(PERMISSIONS.FETCH_BRANDING);
  const canReadForm = usePermission(PERMISSIONS.READ_FORM);
  const { values, setters, patchValues } = useBrandingEditorForm();
  const [image, setImage] = useState(null);

  const [addBrandingToForm] = useAddBrandingInFormMutation();
  const {
    data: singleBrandingData,
    isLoading: isBrandingLoading,
    isError: isBrandingError,
    refetch: refetchBranding,
  } = useGetSingleBrandingQuery(brandingId, { skip: !brandingId });
  const { data: allFormsResponse } = useGetMyAllFormsQuery(undefined, { skip: !canReadForm });

  const extraction = useBrandingEditorExtraction({ values, setters, patchValues });
  const save = useBrandingEditorSave({ brandingId, values, branding });
  const canSave = brandingId ? canUpdateBranding : canCreateBranding;

  useBrandingEditorSync({
    brandingId,
    singleBrandingData,
    user,
    values,
    setters,
    patchValues,
    branding,
    applyExtractedBranding: extraction.applyExtractedBranding,
  });

  useBrandingEditorScreenContext({
    brandingId,
    values,
    setters,
    forms: allFormsResponse?.data || [],
    addBrandingToForm,
    applyExtractedBranding: extraction.applyExtractedBranding,
    openExtractionModal: extraction.openExtractionModal,
    createBrandingHandler: save.createBrandingHandler,
    updateBrandingHandler: save.updateBrandingHandler,
    askToConfirmUpdate: save.updateConfirm.ask,
  });

  if (brandingId && isBrandingLoading) return <LoadingState title="Loading branding" className={STATE_CLASS_NAME} />;
  if (brandingId && isBrandingError)
    return (
      <EmptyState title="Could not load branding" className={STATE_CLASS_NAME}>
        <Button type="button" label="Try again" onClick={refetchBranding} />
      </EmptyState>
    );

  return (
    <article className="mb-6 rounded-xl border border-softBorder bg-white px-3 md:px-6">
      <h1 className="mt-12 mb-6 text-lg font-semibold text-gray-500 md:text-2xl">Global Branding</h1>
      <TextField
        label="Company Name"
        name="companyName"
        value={values.companyName}
        error={save.errors.companyName}
        onChange={(e) => setters.companyName(e.target.value)}
      />
      <div className="mt-12">
        <div className="bg-white" id={BRANDING_SCREENSHOT_ELEMENT_ID}>
          <BrandingSource
            websiteUrl={values.websiteUrl}
            setWebsiteUrl={setters.websiteUrl}
            websiteUrlError={save.errors.websiteUrl}
            websiteImage={values.websiteImage}
            setWebsiteImage={setters.websiteImage}
            logos={values.logos}
            setLogos={setters.logos}
            isFetchLoading={extraction.isFetchLoading}
            extractBranding={extraction.extractBranding}
            setSelectedLogo={setters.selectedLogo}
            selectedLogo={values.selectedLogo}
            defaultSelectedLogo={brandingId ? values.selectedLogo : null}
            handleExtraLogoUpload={(logo) => setters.extraLogos([...values.extraLogos, logo])}
            extractColorsFromLogosHandler={extraction.extractColorsFromLogosHandler}
            headerBackground={values.headerBackground}
            onLogoSelected={extraction.handleLogoSelected}
            onOpenExtractionModal={extraction.openExtractionModal}
            canFetchBranding={canFetchBranding}
          />

          <BrandingManualExtractionModal
            isOpen={canFetchBranding && extraction.isExtractionModalOpen}
            onClose={extraction.closeExtractionModal}
            initialUrl={values.websiteUrl}
            initialTab={extraction.extractionModalTab}
            onApply={extraction.applyExtractedWithName}
          />

          <BrandingColorPalette
            colorPalette={values.colorPalette}
            suggestedColors={values.suggestedColors}
            error={save.errors.colorPalette}
          />
        </div>

        <BrandingElementAssignment
          image={image}
          setImage={setImage}
          errors={save.errors}
          {...toFieldProps(values, setters, ASSIGNMENT_FIELDS)}
        />
        <hr className="border-primary my-6 border-t-2" />

        <BrandingPreview {...pickFields(values, PREVIEW_FIELDS)} />
        <hr className="border-primary my-6 border-t-2" />

        <BrandingEmailSection
          values={values}
          setters={setters}
          errors={save.errors}
          image={image}
          setImage={setImage}
          defaultSelectedLogo={brandingId ? values.selectedEmailLogo : null}
        />
        <hr className="border-primary my-6 border-t-2" />

        <BrandingAiSettings values={values} setters={setters} image={image} setImage={setImage} />
        <hr className="border-primary my-6 border-t-2" />

        <BrandingBrowserTab values={values} setters={setters} />

        <footer className="mt-6 mb-4 flex justify-end gap-2 md:gap-6">
          <Button variant="secondary" label="Cancel" onClick={() => navigate(BRANDING_ROUTES.LIST)} />
          {canSave && (
            <Button
              disabled={save.isSaving}
              label={brandingId ? "Update Branding" : "Create Branding"}
              onClick={save.handleSave}
            />
          )}
        </footer>
      </div>

      <ConfirmationModal
        isOpen={save.updateConfirm.isOpen}
        title="Update Branding"
        message={
          save.updateConfirm.pending?.message || `Are you sure you want to save the changes to ${values.companyName}?`
        }
        confirmButtonText="Update Branding"
        isLoading={save.isSaving}
        onConfirm={save.confirmUpdate}
        onClose={save.updateConfirm.close}
      />
    </article>
  );
};

export default BrandingEditor;
