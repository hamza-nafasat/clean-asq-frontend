import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useBranding from "@/hooks/useBranding";
import useBrandingEditorForm from "@/hooks/useBrandingEditorForm";
import useBrandingEditorSave from "@/hooks/useBrandingEditorSave";
import useBrandingEditorScreenContext from "@/hooks/useBrandingEditorScreenContext";
import useBrandingEditorSync from "@/hooks/useBrandingEditorSync";
import {
  useAddBrandingInFormMutation,
  useExtractColorsFromLogosMutation,
  useExtractColorsFromLogoUrlMutation,
  useFetchBrandingMutation,
  useGetSingleBrandingQuery,
} from "@/redux/apis/branding.apis";
import { useGetMyProfileFirstTimeMutation } from "@/redux/apis/auth.apis";
import { useGetMyAllFormsQuery } from "@/redux/apis/form.apis";
import { userExist } from "@/redux/slices/auth.slice";
import ApplyBranding from "@/components/global/ApplyBranding";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import Button from "@/components/shared/Button";
import TextField from "@/components/shared/TextField";
import BrandingAiSettings from "./BrandingAiSettings";
import BrandingBrowserTab from "./BrandingBrowserTab";
import ColorPalette from "./BrandingColorPalette";
import BrandElementAssignment from "./BrandingElementAssignment";
import BrandingEmailBody from "./BrandingEmailBody";
import BrandingEmailFooter from "./BrandingEmailFooter";
import BrandingEmailHeader from "./BrandingEmailHeader";
import BrandingEmailSettings from "./BrandingEmailSettings";
import ManualExtractionModal from "./BrandingManualExtractionModal";
import Preview, { EmailTemplatePreview } from "./BrandingPreview";
import BrandingSource from "./BrandingSource";
import {
  BRANDING_EXTRACTION_TABS,
  BRANDING_ROUTES,
  BRANDING_SCREENSHOT_ELEMENT_ID,
} from "../utils/branding.constants";
import { mapExtractedBranding, replaceLogoColors, toFieldProps } from "../utils/branding.utils3";
import { executeBrandingAssignment, getBrandingSettersFromHook } from "@/utils/executeBrandingAssignment";

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

const pickValues = (values, fields) => Object.fromEntries(fields.map((field) => [field, values[field]]));

const GlobalBrandingPage = ({ brandingId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const branding = useBranding();
  const { values, setters, patchValues } = useBrandingEditorForm();

  const [image, setImage] = useState(null);
  const [isExtractionModalOpen, setIsExtractionModalOpen] = useState(false);
  const [extractionModalTab, setExtractionModalTab] = useState(BRANDING_EXTRACTION_TABS.AUTO);
  const [applyBrandingModalOpen, setApplyBrandingModalOpen] = useState(false);
  const [applyFormId, setApplyFormId] = useState(null);
  const [applyOnHome, setApplyOnHome] = useState(false);

  const [fetchBranding, { isLoading: isFetchLoading }] = useFetchBrandingMutation();
  const [extractColorsFromLogos] = useExtractColorsFromLogosMutation();
  const [extractColorsFromLogoUrl] = useExtractColorsFromLogoUrlMutation();
  const [addBrandingToForm] = useAddBrandingInFormMutation();
  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const { data: singleBrandingData } = useGetSingleBrandingQuery(brandingId || "");
  const { data: allFormsResponse, refetch: refetchAllForms } = useGetMyAllFormsQuery();

  const { createBrandingHandler, updateBrandingHandler, isSaving } = useBrandingEditorSave({ values, branding });

  const applyExtractedBranding = (data) => patchValues(mapExtractedBranding(data));

  const openExtractionModal = (tab = BRANDING_EXTRACTION_TABS.AUTO) => {
    setExtractionModalTab(tab);
    setIsExtractionModalOpen(true);
  };

  useBrandingEditorSync({
    brandingId,
    singleBrandingData,
    user,
    values,
    setters,
    patchValues,
    branding,
    applyExtractedBranding,
  });

  useBrandingEditorScreenContext({
    brandingId,
    values,
    setters,
    forms: allFormsResponse?.data || [],
    addBrandingToForm,
    applyExtractedBranding,
    openExtractionModal,
    createBrandingHandler,
    updateBrandingHandler,
  });

  const dispatchUserRefresh = async (profileRes) => {
    if (profileRes?.success) dispatch(userExist(profileRes.data));
  };

  const closeApplyModal = () => {
    setApplyBrandingModalOpen(false);
    setApplyFormId(null);
    setApplyOnHome(false);
  };

  const onConfirmApplyBranding = async () => {
    if (!brandingId) {
      toast.error("Save the branding profile before applying it to forms or home");
      return;
    }
    if (!applyFormId && !applyOnHome) {
      toast.error("Select a form or check For Website");
      return;
    }
    try {
      const res = await executeBrandingAssignment({
        addBrandingMutation: addBrandingToForm,
        getUserProfile,
        brandingSetters: getBrandingSettersFromHook({ ...branding, setAiSliderColor: undefined }),
        dispatchUserRefresh,
        assignment: { brandingId, formId: applyFormId || undefined, applyToHome: applyOnHome },
      });
      await refetchAllForms();
      toast.success(res?.message || "Branding applied successfully");
    } catch (error) {
      toast.error(error?.message || error?.data?.message || "Failed to apply branding");
    } finally {
      closeApplyModal();
    }
  };

  const handleLogoSelected = async (logoUrl) => {
    try {
      const res = await extractColorsFromLogoUrl({ url: logoUrl }).unwrap();
      if (res?.success && res?.data?.length) {
        setters.colorPalette((prev) => replaceLogoColors(prev, res.data));
      }
    } catch (error) {
      console.error("Extract colors from logo error:", error);
    }
  };

  const extractBranding = async () => {
    if (!values.websiteUrl) {
      toast.error("Please enter a valid website URL");
      return;
    }
    try {
      const existingName = values.companyName;
      const res = await fetchBranding({ url: values.websiteUrl }).unwrap();
      if (res.success) {
        applyExtractedBranding(res.data);
        if (!existingName && res.data?.name) setters.companyName(res.data.name);
      }
    } catch (error) {
      console.error("Extract branding error:", error);
      toast.error(
        <span>
          Failed to extract branding.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => openExtractionModal(BRANDING_EXTRACTION_TABS.MANUAL)}
          >
            Site blocking access? Try manual.
          </button>
        </span>,
        { autoClose: 8000 },
      );
    }
  };

  const extractColorsFromLogosHandler = async () => {
    if (!values.extraLogos?.length) {
      toast.error("Please upload at least one new logo");
      return;
    }
    try {
      const formData = new FormData();
      values.extraLogos.forEach((file) => formData.append("files", file));
      const res = await extractColorsFromLogos(formData).unwrap();
      if (res?.success && res?.data) {
        toast.success(res.message);
        setters.colorPalette((prev) => [...new Set([...prev, ...res.data])]);
      }
    } catch (error) {
      console.error("Extract colors from logos error:", error);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-[#F0F0F0] bg-white px-3 md:px-6">
      <h1 className="mt-12 mb-6 text-lg font-semibold text-gray-500 md:text-2xl">Global Branding</h1>
      <TextField
        label={"Company Name"}
        value={values.companyName}
        onChange={(e) => setters.companyName(e.target.value)}
      />
      <div className="mt-12">
        <div className="bg-white" id={BRANDING_SCREENSHOT_ELEMENT_ID}>
          <BrandingSource
            websiteUrl={values.websiteUrl}
            setWebsiteUrl={setters.websiteUrl}
            websiteImage={values.websiteImage}
            setWebsiteImage={setters.websiteImage}
            logos={values.logos}
            setLogos={setters.logos}
            isFetchLoading={isFetchLoading}
            extractBranding={extractBranding}
            setSelectedLogo={setters.selectedLogo}
            selectedLogo={values.selectedLogo}
            defaultSelectedLogo={brandingId ? values.selectedLogo : null}
            handleExtraLogoUpload={(logo) => setters.extraLogos([...values.extraLogos, logo])}
            extractColorsFromLogosHandler={extractColorsFromLogosHandler}
            headerBackground={values.headerBackground}
            onLogoSelected={handleLogoSelected}
            onOpenExtractionModal={openExtractionModal}
          />

          <ManualExtractionModal
            isOpen={isExtractionModalOpen}
            onClose={() => setIsExtractionModalOpen(false)}
            initialUrl={values.websiteUrl}
            initialTab={extractionModalTab}
            onApply={(brandingData) => {
              applyExtractedBranding(brandingData);
              if (!values.companyName && brandingData?.name) setters.companyName(brandingData.name);
            }}
          />

          {applyBrandingModalOpen && (
            <ConfirmationModal
              isOpen={applyBrandingModalOpen}
              title="Apply Branding"
              confirmButtonText="Apply Branding"
              confirmButtonClassName="border-none hover:bg-red-600 text-white"
              cancelButtonText="cancel"
              onConfirm={onConfirmApplyBranding}
              onClose={closeApplyModal}
              message={
                <ApplyBranding
                  selectedId={applyFormId}
                  setSelectedId={setApplyFormId}
                  setOnHome={setApplyOnHome}
                  onHome={applyOnHome}
                  initialFormId={applyFormId}
                  initialOnHome={applyOnHome}
                />
              }
            />
          )}

          <ColorPalette colorPalette={values.colorPalette} suggestedColors={values.suggestedColors} />
        </div>

        <BrandElementAssignment image={image} setImage={setImage} {...toFieldProps(values, setters, ASSIGNMENT_FIELDS)} />
        <div className="border-primary my-6 border-t-2"></div>

        <Preview {...pickValues(values, PREVIEW_FIELDS)} />
        <div className="border-primary my-6 border-t-2"></div>

        <article className="flex flex-col gap-2">
          <BrandingEmailSettings
            values={values}
            setters={setters}
            defaultSelectedLogo={brandingId ? values.selectedEmailLogo : null}
          />
          <BrandingEmailHeader values={values} setters={setters} image={image} setImage={setImage} />
          <BrandingEmailBody values={values} setters={setters} image={image} setImage={setImage} />
          <BrandingEmailFooter values={values} setters={setters} image={image} setImage={setImage} />
        </article>

        <div className="mt-6 rounded-xl border border-[#F0F0F0] p-3 shadow-sm md:p-6">
          <EmailTemplatePreview
            emailHeader={values.emailHeader}
            emailFooter={values.emailFooter}
            emailBodyColor={values.emailBodyColor}
            emailText={values.emailTextColor}
          />
        </div>
        <div className="border-primary my-6 border-t-2"></div>

        <BrandingAiSettings values={values} setters={setters} image={image} setImage={setImage} />
        <div className="border-primary my-6 border-t-2"></div>

        <BrandingBrowserTab values={values} setters={setters} />

        <footer className="mt-6 mb-4 flex justify-end space-x-2 md:space-x-4">
          <div className="flex gap-2 md:gap-6">
            <Button variant="secondary" label={"Cancel"} onClick={() => navigate(BRANDING_ROUTES.LIST)} />
            <Button
              disabled={isSaving}
              className={`${isSaving ? "cursor-not-allowed opacity-50" : ""} `}
              label={brandingId ? "Update Branding" : "Create Branding"}
              onClick={brandingId ? () => updateBrandingHandler(brandingId) : () => createBrandingHandler()}
            />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default GlobalBrandingPage;
