import SignatureBox from "@/components/shared/SignatureBox";
import Button from "@/components/shared/small/Button";
import CustomLoading from "@/components/shared/small/CustomLoading";
import { AiHelpModal, RadioInputType } from "@/components/shared/small/DynamicField";
import { EditSectionDisplayTextFromatingModal } from "@/components/shared/small/EditSectionDisplayTextFromatingModal";
import { LoadingWithTimer } from "@/components/shared/small/LoadingWithTimer";
import Modal from "@/components/shared/small/Modal";
import TextField from "@/components/shared/small/TextField";
import { ID_ISSUE_STATES_AND_COUNTRIES, MAJOR_CITIES } from "@/data/constants";
import { useApplicantScreenContext } from "@/hooks/useApplicantScreenContext";
import useApplyBranding from "@/hooks/useApplyBranding";
import getEnv from "@/lib/env";
import { socket } from "@/main";
import { useGetMyProfileFirstTimeMutation, useUpdateMyProfileMutation } from "@/redux/apis/authApis";
import {
  useFormateTextInMarkDownMutation,
  useGetSavedFormMutation,
  useGetSingleFormQueryQuery,
  useSaveFormInDraftMutation,
  useUpdateFormMutation,
  useUpdateFormSectionMutation,
} from "@/redux/apis/formApis";
import { useGetIdMissionSessionMutation, useSendOtpMutation, useVerifyEmailMutation } from "@/redux/apis/idMissionApis";
import { userExist, userNotExist } from "@/redux/slices/authSlice";
import {
  addSavedFormData,
  updateEmailVerified,
  updateFormHeaderAndFooter,
  updateFormState,
} from "@/redux/slices/formSlice";
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from "@/utils/cloudinary";
import { formatData, makeCompleteName } from "@/utils/idMissionMapingUtils";
import { collectClientDetails } from "@/utils/userDetails";
import { Autocomplete } from "@react-google-maps/api";
import { unwrapResult } from "@reduxjs/toolkit";
import DOMPurify from "dompurify";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function SingleApplication() {
  const navigate = useNavigate();
  const params = useParams();
  const formId = params.formId;
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { emailVerified } = useSelector((state) => state.form);
  const [webLink, setWebLink] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [qrFetchError, setQrFetchError] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isIdMissionProcessing, setIsIdMissionProcessing] = useState(false);
  const [idMissionVerified, setIdMissionVerified] = useState(false);
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const [emailVerifiedLoading, setEmailVerifiedLoading] = useState(false);

  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [getIdMissionSession] = useGetIdMissionSessionMutation();
  const [sendOtp, { isLoading: otpLoading }] = useSendOtpMutation();
  const [verifyEmail, { isLoading: emailLoading }] = useVerifyEmailMutation();
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const { data: form, refetch: formRefetch, isLoading: isFormLoading } = useGetSingleFormQueryQuery({ _id: formId });
  const [getSavedFormData] = useGetSavedFormMutation();
  const { formData } = useSelector((state) => state?.form);
  const [saveFormInDraft] = useSaveFormInDraftMutation();
  const [openRedirectModal, setOpenRedirectModal] = useState(false);
  const { isApplied, isApplying } = useApplyBranding({ formId: formId });
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showSignatureHelpModal, setShowSignatureHelpModal] = useState(false);
  const [showIdMissionDataModal, setShowIdMissionDataModal] = useState(false);
  const [customizeIdMissionTextModal, setCustomizeIdMissionTextModal] = useState(false);
  const [openAiHelpSignModal, setOpenAiHelpSignModal] = useState(false);
  const [openOtpDisplayTextModal, setOpenOtpDisplayTextModal] = useState(false);
  const [loadingForValidatingOtp, setLoadingForValidatingOtp] = useState(false);
  const [idMissionVerifiedData, setIdMissionVerifiedData] = useState({
    name: { name: "name", value: "" },
    email: { value: user?.email },
    idNumber: { name: "idNumber", value: "" },
    streetAddress: { name: "streetAddress", value: "" },
    phoneNumber: { name: "phoneNumber", value: "" },
    companyTitle: { name: "companyTitle", value: "" },
    issueDate: { name: "issueDate", value: "" },
    idIssuer: { name: "idIssuer", value: "" },
    idType: { name: "idType", value: "" },
    idExpiryDate: { name: "idExpiryDate", value: "" },
    city: { name: "city", value: "" },
    state: { value: "" },
    dateOfBirth: { name: "dateOfBirth", value: "" },
    zipCode: { name: "zipCode", value: "" },
    country: { name: "country", value: "" },
    roleFillingForCompany: { name: "roleFillingForCompany", value: "" },
    signature: { name: "signature", value: { secureUrl: "", publicId: "", resourceType: "" } },
    data: { name: "data", value: "null" },
  });
  const autocompleteRef = useRef(null);
  const emailFormRef = useRef(null); // email/OTP fields for AI DOM discovery + guided lock scoping
  const idMissionFormRef = useRef(null); // used by DOM field discovery
  const initialDataLoadRef = useRef(null); // tracks the in-flight getSavedFormDataAndSaveInRedux promise
  const navigatingAwayRef = useRef(false); // set true before navigate() to suppress idmission-qr stage during the outbound render
  const hasFocusedDetailsRef = useRef(false);
  const submitFromEnterRef = useRef(null);

  // ─── Render-level state snapshot ────────────────────────────────────────────
  // Fires on every render so we can trace what changed.
  const aiStageForLog =
    !emailVerified || emailVerifiedLoading ? "email" : !idMissionVerified ? "idmission-qr" : "idmission-details";
  console.log(
    "%c[SA:render] stage=%s emailVerified=%s idMissionVerified=%s otpSent=%s email=%s otp=%s",
    "color:#6366f1; font-weight:bold",
    aiStageForLog,
    emailVerified,
    idMissionVerified,
    otpSent,
    email || "(empty)",
    otp || "(empty)",
  );

  const idMissionSection = form?.data?.sections?.find((sec) => sec?.title?.toLowerCase() == "id_verification_blk");
  const handleSignature = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error("Please add signature");
      if (idMissionVerifiedData?.signature?.publicId || idMissionVerifiedData?.signature?.secureUrl) {
        await deleteImageFromCloudinary(
          idMissionVerifiedData?.signature?.publicId,
          idMissionVerifiedData?.signature?.resourceType,
        );
      }
      const { secureUrl, publicId, resourceType } = await uploadImageOnCloudinary(file);
      if (!secureUrl || !publicId) return toast.error("Something went wrong while uploading image");
      setIdMissionVerifiedData((prev) => ({
        ...prev,
        signature: { name: "signature", value: { secureUrl, publicId, resourceType } },
      }));
      toast.success("Signature uploaded successfully");
    } catch (error) {
      console.log("error while uploading image", error);
      toast.error("Something went wrong while uploading image");
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

  const isGuestApplicant = user?.role?.name === "guest" || user?.role === "guest";
  const aiStage =
    !emailVerified || emailVerifiedLoading || navigatingAwayRef.current
      ? "email"
      : !idMissionVerified
        ? "idmission-qr"
        : "idmission-details";

  useApplicantScreenContext(
    {
      screenId: `single-application-${aiStage}`,
      screenName:
        aiStage === "email"
          ? "Email Verification"
          : aiStage === "idmission-qr"
            ? "Identity Verification — QR Code"
            : "Identity Verification — Personal Details",
      description:
        aiStage === "email"
          ? "The applicant must verify their email address. They enter their email, receive a one-time passcode (OTP), and enter it to confirm."
          : aiStage === "idmission-qr"
            ? "The applicant scans a QR code (or uses a web link) with their phone to complete photo ID verification through IDMission. No form fields to fill at this step — they must use the QR code or web link."
            : 'The applicant completes their personal details and adds their signature to proceed. Some fields may already be filled from identity verification — present those pre-filled values to the applicant for confirmation before moving on to empty fields. For the roleFillingForCompany field, valid values are: "both" (operator and primary contact), "primaryContact" (primary contact only), or "primaryOperatorAndController" (C-level executive or owner). Present these as readable choices to the applicant.',
      aiEndpoint: `${getEnv("SERVER_URL")}/api/ai/applicant-chat`,
      // Keep this page manually editable for everyone (including guest applicants) so the
      // email/OTP and IDMission detail fields stay enabled. The AI assistant can still fill
      // these fields via the DOM.
      allowManualEdit: true,
      formRef: aiStage === "idmission-details" ? idMissionFormRef : aiStage === "email" ? emailFormRef : null,
      currentState: {
        ...(aiStage === "email" && {
          otpSent,
          fields: [
            {
              id: "email-field",
              label: "Email Address",
              type: "email",
              value: email,
              required: true,
              filled: !!email,
              isSignature: false,
            },
            {
              id: "otp-field",
              label: "OTP Code",
              type: "text",
              value: otp,
              required: true,
              filled: !!otp,
              isSignature: false,
            },
          ],
        }),
        ...(aiStage === "idmission-qr" && {
          webLinkAvailable: !!webLink,
          fields: [],
        }),
        // Fields are discovered from the live DOM via formRef — no hardcoded list needed.
      },
      actions: {
        scrollToField: ({ fieldId }) => {
          const el = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        },
        ...(aiStage === "email" && {
          fillField: ({ fieldId, value }) => {
            if (fieldId === "email-field") setEmail(value);
            else if (fieldId === "otp-field") setOtp(value);
          },
          // Sends OTP directly — accepts email as arg to avoid React state flush timing issues
          sendOtpForEmail: async ({ email: emailValue }) => {
            const res = await sendOtp({ email: emailValue, formId }).unwrap();
            if (!res?.success) throw new Error(res?.message || "Failed to send OTP");
            setEmail(emailValue);
            setOtpSent(true);
            return res;
          },
          // Verifies OTP directly — accepts both values as args to avoid state flush timing issues
          verifyOtpCode: async ({ otp: otpValue, email: emailValue }) => {
            setLoadingForValidatingOtp(true);
            try {
              const res = await verifyEmail({ email: emailValue, otp: otpValue, formId }).unwrap();
              if (!res?.success) throw new Error(res?.message || "Verification failed");
              setOtp(otpValue);
              // Raise the loading flag BEFORE dispatching emailVerified — React 18 batches
              // these two state updates into one render, keeping aiStage="email" so the
              // IDMission QR context is never registered until we know the user stays there.
              setEmailVerifiedLoading(true);
              dispatch(updateEmailVerified(true));
              await getUserProfile()
                .then((r) => {
                  if (r?.data?.success) dispatch(userExist(r.data.data));
                  else dispatch(userNotExist());
                })
                .catch(() => dispatch(userNotExist()));
              // After email is verified, always send the applicant to company verification.
              // Once that page is completed it redirects back to /application-form/... where
              // this screen (with emailVerified=true) fetches the IDMission QR code.
              navigatingAwayRef.current = true;
              navigate(`/verification?formid=${formId}&brandingName=${form?.data?.branding?.name}`);
              return res;
            } finally {
              setLoadingForValidatingOtp(false);
              setEmailVerifiedLoading(false);
            }
          },
        }),
      },
      deps: [aiStage, email, otp, webLink, idMissionVerifiedData, isGuestApplicant],
    },
    { clearOnMount: !emailVerified, autoOpen: false },
  );
  const getQrAndWebLink = useCallback(async () => {
    setQrLoading(true);
    setQrFetchError(false);
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      setQrLoading(false);
      setQrFetchError(true);
    }, 10000);
    try {
      const res = await getIdMissionSession().unwrap();
      clearTimeout(timeoutId);
      if (!timedOut) {
        if (res.success) {
          setQrCode(res.data?.customerData?.qrCode);
          setWebLink(res.data?.customerData?.kycUrl);
        } else {
          setQrFetchError(true);
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (!timedOut) {
        console.log("Error fetching session ID:", error);
        setQrFetchError(true);
      }
    } finally {
      setQrLoading(false);
    }
  }, [getIdMissionSession]);
  const getSavedFormDataAndSaveInRedux = useCallback(
    async ({ skipRedirectOnError = false } = {}) => {
      console.log(
        "%c[SA:getSavedForm] called — skipRedirectOnError=%s formId=%s",
        "color:#7c3aed; font-weight:bold",
        skipRedirectOnError,
        formId,
      );
      try {
        const res = await getSavedFormData({ formId: formId }).unwrap();
        console.log(
          "%c[SA:getSavedForm] API response — success=%s keys=%o",
          "color:#7c3aed",
          res?.success,
          res?.data?.savedData ? Object.keys(res.data.savedData) : [],
        );
        if (res.success) {
          const savedData = res?.data?.savedData || [];
          const formDataOfIdMission = savedData?.idMission;
          console.log(
            "%c[SA:getSavedForm] idMission data — name=%s email=%s company_lookup_data=%s",
            "color:#7c3aed",
            formDataOfIdMission?.name?.value || "(none)",
            formDataOfIdMission?.email?.value || "(none)",
            !!savedData?.company_lookup_data,
          );
          const action = await dispatch(addSavedFormData(savedData || []));
          unwrapResult(action);
          setIdMissionVerifiedData({
            name: { name: "name", value: formDataOfIdMission?.name?.value || "" },
            // Priority: (1) fresh OTP email from this session, (2) previously-saved draft
            // email (also OTP-verified), (3) user?.email — safe here because after OTP
            // verification the user is logged in AS the OTP email, so user?.email === OTP email.
            // We never reach this fallback chain before emailVerified is true.
            email: { name: "email", value: email || formDataOfIdMission?.email?.value || user?.email || "" },
            idNumber: { name: "idNumber", value: formDataOfIdMission?.idNumber?.value || "" },
            idIssuer: { name: "idIssuer", value: formDataOfIdMission?.idIssuer?.value || "" },
            idType: { name: "idType", value: formDataOfIdMission?.idType?.value || "" },
            idExpiryDate: { name: "idExpiryDate", value: formDataOfIdMission?.idExpiryDate?.value || "" },
            streetAddress: { name: "streetAddress", value: formDataOfIdMission?.streetAddress?.value || "" },
            address2: { name: "address2", value: formDataOfIdMission?.address2?.value || "" },
            phoneNumber: { name: "phoneNumber", value: formDataOfIdMission?.phoneNumber?.value || "" },
            zipCode: { name: "zipCode", value: formDataOfIdMission?.zipCode?.value || "" },
            dateOfBirth: { name: "dateOfBirth", value: formDataOfIdMission?.dateOfBirth?.value || "" },
            country: { name: "country", value: formDataOfIdMission?.country?.value || "" },
            issueDate: { name: "issueDate", value: formDataOfIdMission?.issueDate?.value || "" },
            companyTitle: { name: "companyTitle", value: formDataOfIdMission?.companyTitle?.value || "" },
            state: { name: "state", value: formDataOfIdMission?.state?.value || "" },
            city: { name: "city", value: formDataOfIdMission?.city?.value || "" },
            signature: { name: "signature", value: formDataOfIdMission?.signature?.value || "" },
            createdAt: formDataOfIdMission?.createdAt || new Date().toISOString(),
            updatedAt: formDataOfIdMission?.updatedAt || new Date().toISOString(),
          });
          if (formDataOfIdMission?.name?.value && savedData?.company_lookup_data) {
            console.log(
              "%c[SA:getSavedForm] → idMissionVerified=true + openRedirectModal (name+lookup both present)",
              "color:#7c3aed",
            );
            setIdMissionVerified(true);
            setOpenRedirectModal(true);
          } else if (!skipRedirectOnError && !savedData?.company_lookup_data) {
            // Draft exists but company lookup hasn't completed yet — send to company page.
            // Only redirect on the post-OTP path (skipRedirectOnError=false); on the remount
            // path the lookup may still be running in the background, so we wait.
            console.log(
              "%c[SA:getSavedForm] → navigating to /verification (no company_lookup_data, skipRedirectOnError=false)",
              "color:#7c3aed",
            );
            navigatingAwayRef.current = true;
            return navigate(`/verification?formid=${formId}&brandingName=${form?.data?.branding?.name}`);
          } else {
            // User is staying on the QR / manual-entry step — fetch QR now (first time we know it's needed).
            console.log(
              "%c[SA:getSavedForm] → no navigation (skipRedirectOnError=%s name=%s lookup=%s) — fetching QR",
              "color:#7c3aed",
              skipRedirectOnError,
              !!formDataOfIdMission?.name?.value,
              !!savedData?.company_lookup_data,
            );
            getQrAndWebLink();
          }
        }
      } catch (error) {
        if (error?.data?.message === "Form Not Saved in draft") {
          if (skipRedirectOnError) {
            // Draft doesn't exist yet — company info hasn't been submitted. Don't redirect
            // (the skipRedirectOnError=false call from verifyOtpCode handles navigation).
            // Pre-fill email so it's ready if/when the user eventually reaches this page.
            // Do NOT fetch QR here — the draft being absent means company info isn't done yet,
            // so we have no business initialising IDMission.
            console.log(
              "%c[SA:getSavedForm] catch: Form Not Saved in draft + skipRedirectOnError → pre-filling email only",
              "color:#ea580c",
            );
            setIdMissionVerifiedData((prev) => ({
              ...prev,
              email: { name: "email", value: prev.email?.value || email || user?.email || "" },
            }));
            return;
          }
          console.log(
            "%c[SA:getSavedForm] catch: Form Not Saved in draft → navigating to /verification",
            "color:#ea580c",
          );
          navigatingAwayRef.current = true;
          return navigate(`/verification?formid=${formId}&brandingName=${form?.data?.branding?.name}`);
        }
        console.error("%c[SA:getSavedForm] ERROR", "color:#dc2626; font-weight:bold", error);
        // toast.error(error?.data?.message || 'Error while getting saved form data');
      }
    },
    [dispatch, email, form?.data?.branding?.name, formId, getQrAndWebLink, getSavedFormData, navigate, user?.email],
  );

  // functions for autocomplete
  // ===========================

  const onLoad = (autocompleteInstance) => {
    autocompleteRef.current = autocompleteInstance;
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place) return;

    if (!place.address_components?.length && place.place_id) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: place.place_id }, (results, status) => {
        if (status === "OK" && results?.length) {
          handleGeocodeResults(results);
        } else {
          handlePlace(place);
        }
      });
      return;
    }

    handlePlace(place);

    const hasPostal = (place.address_components || []).some((c) => c.types.includes("postal_code"));

    if (!hasPostal && place.geometry?.location) {
      reverseGeocode(place.geometry.location.lat(), place.geometry.location.lng());
    }
  };

  const handlePlace = (place) => {
    const components = place.address_components || [];
    const geometry = place.geometry;
    const parsed = parseComponents(components, geometry);

    setIdMissionVerifiedData((prev) => ({
      ...prev,
      streetAddress: { name: "streetAddress", value: parsed.streetAddress },
      city: { name: "city", value: parsed.city },
      state: { name: "state", value: parsed.state },
      country: { name: "country", value: parsed.country },
      zipCode: { name: "zipCode", value: parsed.zipCode },
    }));
    setTimeout(() => document.getElementById("companyTitle")?.focus(), 50);
  };

  const handleGeocodeResults = (results) => {
    const parsed = parseComponentsFromResults(results);
    setIdMissionVerifiedData((prev) => ({
      ...prev,
      streetAddress: { name: "streetAddress", value: parsed.streetAddress },
      city: { name: "city", value: parsed.city },
      state: { name: "state", value: parsed.state },
      country: { name: "country", value: parsed.country },
      zipCode: { name: "zipCode", value: parsed.zipCode },
    }));
    setTimeout(() => document.getElementById("companyTitle")?.focus(), 50);
  };

  const parseComponents = (components = [], geometry) => {
    const find = (types) => {
      const t = Array.isArray(types) ? types : [types];
      return components.find((c) => t.some((x) => c.types.includes(x)));
    };

    const getLong = (types) => find(types)?.long_name || "";
    const getShort = (types) => find(types)?.short_name || "";

    const streetNumber = getLong("street_number");
    const route = getLong("route");
    const subpremise = getLong("subpremise");
    const premise = getLong("premise");

    const city =
      getLong("locality") ||
      getLong("postal_town") ||
      getLong("administrative_area_level_3") ||
      getLong("administrative_area_level_2") ||
      getLong(["sublocality", "sublocality_level_1"]) ||
      "";

    const stateShort = getShort("administrative_area_level_1");
    const stateLong = getLong("administrative_area_level_1");

    const postal = getLong("postal_code");
    const postalSuffix = getLong("postal_code_suffix");
    const zipCode = postalSuffix ? `${postal}-${postalSuffix}` : postal;

    const country = getLong("country");

    const streetAddress = [premise, streetNumber, route, subpremise].filter(Boolean).join(" ").trim();

    return {
      streetAddress: streetAddress,
      city,
      state: stateShort || stateLong,
      country,
      zipCode,
      lat: geometry?.location?.lat?.() ?? null,
      lng: geometry?.location?.lng?.() ?? null,
    };
  };

  const parseComponentsFromResults = (results) => {
    let city = "";
    let state = "";
    let postal = "";
    let suffix = "";
    let country = "";
    let lat, lng;
    let streetAddress = "";

    for (const result of results) {
      const comps = result.address_components || [];

      const find = (types) => {
        const t = Array.isArray(types) ? types : [types];
        return comps.find((c) => t.some((x) => c.types.includes(x)));
      };

      if (!city) {
        city =
          find("locality")?.long_name ||
          find("postal_town")?.long_name ||
          find("administrative_area_level_3")?.long_name ||
          find("administrative_area_level_2")?.long_name ||
          "";
      }

      if (!state) {
        const s = find("administrative_area_level_1");
        if (s) state = s.short_name || s.long_name;
      }

      if (!postal) {
        const p = find("postal_code");
        if (p) postal = p.long_name;
      }

      if (!suffix) {
        const s = find("postal_code_suffix");
        if (s) suffix = s.long_name;
      }

      if (!country) {
        const c = find("country");
        if (c) country = c.long_name;
      }

      if (!lat && result.geometry?.location) {
        lat = result.geometry.location.lat();
        lng = result.geometry.location.lng();
      }

      if (!streetAddress) {
        const sn = find("street_number")?.long_name || "";
        const rt = find("route")?.long_name || "";
        const pm = find("premise")?.long_name || "";
        const sp = find("subpremise")?.long_name || "";

        const assembled = [pm, sn, rt, sp].filter(Boolean).join(" ").trim();
        if (assembled) streetAddress = assembled;
      }

      if (city && state && postal && country) break;
    }

    const zipCode = suffix ? `${postal}-${suffix}` : postal;

    return {
      streetAddress,
      city,
      state,
      country,
      zipCode,
      lat,
      lng,
    };
  };

  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== "OK" || !results?.length) return;

      const parsed = parseComponentsFromResults(results);

      setIdMissionVerifiedData((prev) => ({
        ...prev,
        streetAddress: { name: "streetAddress", value: prev.streetAddress?.value || parsed.streetAddress },
        city: { name: "city", value: prev.city?.value || parsed.city },
        state: { name: "state", value: prev.state?.value || parsed.state },
        country: { name: "country", value: prev.country?.value || parsed.country },
        zipCode: { name: "zipCode", value: prev.zipCode?.value || parsed.zipCode },
        lat: { name: "lat", value: parsed.lat ?? prev.lat },
        lng: { name: "lng", value: parsed.lng ?? prev.lng },
      }));
    });
  };

  // other functions
  // ==============

  const saveInProgress = useCallback(
    async ({ data, name }) => {
      try {
        if (!formId) return toast.error("From id not provided");
        const { data: userDetailsData } = await collectClientDetails();
        const formDataInRedux = {
          ...formData,
          [name]: data,
          ["metadata"]: {
            ...userDetailsData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: {
              _id: user?._id,
              email: user?.email,
              name: user?.firstName + " " + user?.lastName,
              role: user?.role?.name,
            },
          },
        };
        const res = await saveFormInDraft({
          formId: formId,
          formData: { ...formDataInRedux },
        }).unwrap();
        if (res.success) toast.success(res.message);
      } catch (error) {
        console.log("error while saving form in draft", error);
        toast.error(error?.data?.message || "Error while saving form in draft");
      }
    },
    [formData, formId, saveFormInDraft, user?._id, user?.email, user?.firstName, user?.lastName, user?.role?.name],
  );

  const submitIdMissionData = useCallback(
    async (e) => {
      setOpenRedirectModal(false);
      e.preventDefault();
      setSubmiting(true);
      try {
        if (!idMissionVerifiedData?.signature?.value?.publicId && !idMissionVerifiedData?.signature?.value?.secureUrl) {
          return toast.error("You must save your signature before taking the next step.");
        }
        const action = await dispatch(updateFormState({ data: idMissionVerifiedData, name: "idMission" }));
        unwrapResult(action);
        await saveInProgress({
          data: {
            ...idMissionVerifiedData,
            updatedBy: {
              _id: user?._id,
              email: user?.email,
              name: user?.firstName + " " + user?.lastName,
              role: user?.role?.name,
            },
          },
          name: "idMission",
        });
        dispatch(updateEmailVerified(false));
        return navigate(`/singleform/stepper/${formId}`);
      } catch (error) {
        console.log("error while saving form in draft", error);
      } finally {
        setSubmiting(false);
      }
    },
    [
      dispatch,
      formId,
      idMissionVerifiedData,
      navigate,
      saveInProgress,
      user?._id,
      user?.email,
      user?.firstName,
      user?.lastName,
      user?.role?.name,
    ],
  );
  const sentOtpForEmail = useCallback(async () => {
    try {
      console.log(
        "%c[SA:sentOtpForEmail] called — email=%s formId=%s",
        "color:#16a34a; font-weight:bold",
        email,
        formId,
      );
      if (!email) return toast.error("Please enter your email");
      const res = await sendOtp({ email, formId }).unwrap();
      if (res.success) {
        setOtpSent(true);
        toast.success(res.message);
      }
    } catch (error) {
      console.log("Error sending OTP:", error);
      console.error("%c[SA:sentOtpForEmail] ERROR", "color:#dc2626; font-weight:bold", error);
      toast.error(error?.data?.message || "Failed to send OTP");
    }
  }, [email, formId, sendOtp]);

  const verifyWithOtp = useCallback(async () => {
    try {
      if (!email || !otp) return toast.error("Please enter your email and otp");
      setLoadingForValidatingOtp(true);
      const res = await verifyEmail({ email, otp, formId }).unwrap();
      if (res.success) {
        await dispatch(updateEmailVerified(true));
        await getUserProfile()
          .then((res) => {
            if (res?.data?.success) dispatch(userExist(res.data.data));
            else dispatch(userNotExist());
          })
          .catch(() => dispatch(userNotExist()));
        // After email is verified, always send the applicant to company verification.
        // Once that page is completed it redirects back to /application-form/... where
        // this screen (with emailVerified=true) fetches the IDMission QR code.
        navigatingAwayRef.current = true;
        navigate(`/verification?formid=${formId}&brandingName=${form?.data?.branding?.name}`);
      }
    } catch (error) {
      console.log("Error sending OTP:", error);
      toast.error(error?.data?.message || "Failed to send OTP");
    } finally {
      setLoadingForValidatingOtp(false);
    }
  }, [dispatch, email, formId, form?.data?.branding?.name, getUserProfile, navigate, otp, verifyEmail]);

  const getQrLinkOnEmailVerified = useCallback(() => {
    if (emailVerified && formData && formData?.idMission) {
      const formDataOfIdMission = formData?.idMission;
      setIdMissionVerifiedData({
        name: { name: "name", value: formDataOfIdMission?.name?.value || "" },
        email: { name: "email", value: formDataOfIdMission?.email?.value || user?.email || "" },
        idNumber: { name: "idNumber", value: formDataOfIdMission?.idNumber?.value || "" },
        idIssuer: { name: "idIssuer", value: formDataOfIdMission?.idIssuer?.value || "" },
        idType: { name: "idType", value: formDataOfIdMission?.idType?.value || "" },
        idExpiryDate: { name: "idExpiryDate", value: formDataOfIdMission?.idExpiryDate?.value || "" },
        streetAddress: { name: "streetAddress", value: formDataOfIdMission?.streetAddress?.value || "" },
        phoneNumber: { name: "phoneNumber", value: formDataOfIdMission?.phoneNumber?.value || "" },
        zipCode: { name: "zipCode", value: formDataOfIdMission?.zipCode?.value || "" },
        dateOfBirth: { name: "dateOfBirth", value: formDataOfIdMission?.dateOfBirth?.value || "" },
        country: { name: "country", value: formDataOfIdMission?.country?.value || "" },
        issueDate: { name: "issueDate", value: formDataOfIdMission?.issueDate?.value || "" },
        companyTitle: { name: "companyTitle", value: formDataOfIdMission?.companyTitle?.value || "" },
        state: { name: "state", value: formDataOfIdMission?.state?.value || "" },
        city: { name: "city", value: formDataOfIdMission?.city?.value || "" },
        signature: { name: "signature", value: formDataOfIdMission?.signature?.value || "" },
        roleFillingForCompany: {
          name: "roleFillingForCompany",
          value: formDataOfIdMission?.roleFillingForCompany?.value || "",
        },
        createdAt: formDataOfIdMission?.createdAt || new Date().toISOString(),
        updatedAt: formDataOfIdMission?.updatedAt || new Date().toISOString(),
      });
      setIdMissionVerified(true);
      setOpenRedirectModal(true);
    }
    if (!qrCode && !webLink) {
      setQrLoading(true);
      getQrAndWebLink()
        .then(() => setQrLoading(false))
        .catch(() => setQrFetchError(true))
        .finally(() => setQrLoading(false));
    }
  }, [emailVerified, formData, getQrAndWebLink, qrCode, user?.email, webLink]);

  // add footer and header text in state
  useEffect(() => {
    const { footerText, headerText, name, headerTextSize } = form?.data || {};
    if (footerText || headerText || name || headerTextSize) {
      dispatch(updateFormHeaderAndFooter({ headerText, footerText, headerTextSize }));
    }
    return () => {
      dispatch(updateFormHeaderAndFooter({ headerText: "", footerText: "All rights reserved", headerTextSize: 24 }));
    };
  }, [dispatch, form?.data]);

  // get qr and session id
  useEffect(() => {
    if (!qrCode && !webLink && !idMissionVerified) {
      getQrLinkOnEmailVerified();
    }
  }, [getQrLinkOnEmailVerified, idMissionVerified, qrCode, webLink]);

  useEffect(() => {
    console.log(
      "%c[SA:effect/emailVerified] deps changed — emailVerified=%s idMissionVerified=%s → %s",
      "color:#7c3aed",
      emailVerified,
      idMissionVerified,
      emailVerified && !idMissionVerified
        ? "calling getSavedFormDataAndSaveInRedux(skipRedirectOnError=true)"
        : "skipping",
    );
    if (emailVerified && !idMissionVerified) {
      // Store the promise so the "Enter Details Manually" button can await it.
      // This prevents the button from changing stage before pre-fill data is loaded,
      // which would cause two separate AI context reads and two auto-messages.
      // skipRedirectOnError: true — companyLookup() may not have saved the draft yet.
      // Don't redirect; let the QR/manual screen show and pre-fill what we can.
      initialDataLoadRef.current = getSavedFormDataAndSaveInRedux({ skipRedirectOnError: true });
    }
  }, [emailVerified, idMissionVerified, getSavedFormDataAndSaveInRedux]);

  useEffect(() => {
    if (aiStage === "idmission-qr" && !qrCode) {
      console.log(
        "%c[SA:effect/qr] aiStage=idmission-qr, qrCode absent — fetching QR",
        "color:#0891b2; font-weight:bold",
      );
      getQrAndWebLink();
    }
  }, [aiStage, qrCode, getQrAndWebLink]);

  // Focus the email field once the screen finishes loading and the field is in the DOM.
  // We watch the same conditions that gate the early <CustomLoading /> return so the field
  // actually exists when we try to focus it. The small delay lets the chat widget settle.
  useEffect(() => {
    if (!isApplied || isFormLoading || isApplying || emailVerified) return;
    setTimeout(() => document.getElementById("email-field")?.focus(), 100);
  }, [isApplied, isFormLoading, isApplying, emailVerified]);

  // Focus the OTP field as soon as it appears after sending the code.
  useEffect(() => {
    if (otpSent) setTimeout(() => document.getElementById("otp-field")?.focus(), 50);
  }, [otpSent]);

  // get user when he logged in
  useEffect(() => {
    getUserProfile()
      .then((res) => {
        if (res?.data?.success) dispatch(userExist(res.data.data));
        else dispatch(userNotExist());
      })
      .catch(() => dispatch(userNotExist()));
  }, [getUserProfile, dispatch]);

  // check and get socket events
  useEffect(() => {
    // Setup listener ONCE when component mounts
    // start id mission
    socket.on("idMission_processing_started", () => {
      setIsIdMissionProcessing(true);
    });
    // id mission verified success fully
    socket.on("idMission_verified", async (data) => {
      const f = data?.Form_Data;

      // 1) Fill the UI immediately from the webhook payload
      setIsIdMissionProcessing(false);
      setIdMissionVerifiedData({
        name: {
          name: "name",
          value: makeCompleteName(f?.First_Name, f?.Middle_Name, f?.Last_Name, f?.FullName, f?.Name),
        },
        email: { name: "email", value: f?.Email || user?.email || "" },
        idNumber: { name: "idNumber", value: f?.ID_Number || "" },
        idIssuer: {
          name: "idIssuer",
          value: f?.ID_State ? f?.ID_State + f?.Issuing_Country : f?.Issuing_Country || "",
        },
        idType: { name: "idType", value: f?.DocumentType || "" },
        idExpiryDate: { name: "idExpiryDate", value: f?.Expiration_Date ? formatData(f?.Expiration_Date) : "" },
        streetAddress: {
          name: "streetAddress",
          value: (f?.ParsedAddressStreetNumber || "") + " " + (f?.ParsedAddressStreetName || ""),
        },
        phoneNumber: { name: "phoneNumber", value: f?.PhoneNumber || "" },
        zipCode: { name: "zipCode", value: f?.ParsedAddressPostalCode || "" },
        dateOfBirth: { name: "dateOfBirth", value: f?.Date_of_Birth ? formatData(f?.Date_of_Birth) : "" },
        country: { name: "country", value: f?.Issuing_Country || "" },
        issueDate: { name: "issueDate", value: f?.Issue_Date ? formatData(f?.Issue_Date) : "" },
        companyTitle: { name: "companyTitle", value: "" },
        state: { name: "state", value: f?.ParsedAddressProvince || "" },
        city: { name: "city", value: f?.ParsedAddressMunicipality || "" },
        data: { name: "data", value: f || "null" },
        createdAt: idMissionVerifiedData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIdMissionVerified(true);

      // 2) Sync profile in the background — does NOT block the form
      if (user?._id && f?.FullName) {
        try {
          let firstName = "";
          let middleName = "";
          let lastName = "";
          if (f.FullName?.split(" ").length > 2) {
            firstName = f?.First_Name || f?.FullName?.split(" ")?.[0] || "";
            middleName = f?.Middle_Name || f?.FullName?.split(" ")?.[1] || "";
            lastName = f?.Last_Name || f?.FullName?.split(" ")?.[2] || "";
          } else {
            firstName = f?.First_Name || f?.FullName?.split(" ")?.[0] || "";
            lastName = f?.Last_Name || f?.FullName?.split(" ")?.[1] || "";
          }
          const res = await updateMyProfile({ _id: user?._id, firstName, middleName, lastName }).unwrap();
          if (res?.success) {
            const r = await getUserProfile();
            if (r?.data?.success) dispatch(userExist(r.data.data));
          }
        } catch (e) {
          console.error("profile sync failed", e);
        }
      }
    });
    // id mission failed
    socket.on("idMission_failed", async (data) => {
      const action = await dispatch(
        updateFormState({
          data: {
            idMissionVerification: "failed",
            verificationStatus: data?.Form_Status || "rejected",
            idMissionData: data,
          },
          name: "idMission",
        }),
      );

      // console.log('You are verified successfully', data);
      setIsIdMissionProcessing(false);
      const formDataOfIdMission = data?.Form_Data;

      setIdMissionVerifiedData({
        name: {
          name: "name",
          value: makeCompleteName(
            formDataOfIdMission?.First_Name,
            formDataOfIdMission?.Middle_Name,
            formDataOfIdMission?.Last_Name,
            formDataOfIdMission?.FullName,
            formDataOfIdMission?.Name,
          ),
        },
        email: { name: "email", value: formDataOfIdMission?.Email || user?.email || "" },
        idNumber: { name: "idNumber", value: formDataOfIdMission?.ID_Number || "" },
        idIssuer: {
          name: "idIssuer",
          value: formDataOfIdMission?.ID_State
            ? formDataOfIdMission?.ID_State + formDataOfIdMission?.Issuing_Country
            : formDataOfIdMission?.Issuing_Country || "",
        },
        idType: { name: "idType", value: formDataOfIdMission?.DocumentType || "" },
        idExpiryDate: {
          name: "idExpiryDate",
          value: formDataOfIdMission?.Expiration_Date ? formatData(formDataOfIdMission?.Expiration_Date) : "",
        },
        streetAddress: {
          name: "streetAddress",
          value: formDataOfIdMission?.ParsedAddressStreetNumber + formDataOfIdMission?.ParsedAddressStreetName || "",
        },
        phoneNumber: { name: "phoneNumber", value: formDataOfIdMission?.PhoneNumber || "" },
        zipCode: { name: "zipCode", value: formDataOfIdMission?.ParsedAddressPostalCode || "" },
        dateOfBirth: {
          name: "dateOfBirth",
          value: formDataOfIdMission?.Date_of_Birth ? formatData(formDataOfIdMission?.Date_of_Birth) : "",
        },
        country: { name: "country", value: formDataOfIdMission?.Issuing_Country || "" },
        issueDate: {
          name: "issueDate",
          value: formDataOfIdMission?.Issue_Date ? formatData(formDataOfIdMission?.Issue_Date) : "",
        },
        companyTitle: { name: "companyTitle", value: "" },
        state: { name: "state", value: formDataOfIdMission?.ParsedAddressProvince || "" },
        city: { name: "city", value: formDataOfIdMission?.ParsedAddressMunicipality || "" },
        data: { name: "data", value: formDataOfIdMission || "null" },
        createdAt: idMissionVerifiedData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      unwrapResult(action);
      setIsIdMissionProcessing(false);
      setIdMissionVerified(true);
    });
    socket.on("idMission_other", async (data) => {
      const action = await dispatch(
        updateFormState({
          data: {
            value: {
              idMissionVerification: "failed",
              verificationStatus: data?.Form_Status || "rejected",
              idMissionData: data,
            },
          },
          name: "idMission",
        }),
      );

      setIsIdMissionProcessing(false);
      const formDataOfIdMission = data?.Form_Data;

      setIdMissionVerifiedData({
        name: {
          name: "name",
          value: makeCompleteName(
            formDataOfIdMission?.First_Name,
            formDataOfIdMission?.Middle_Name,
            formDataOfIdMission?.Last_Name,
            formDataOfIdMission?.FullName,
            formDataOfIdMission?.Name,
          ),
        },
        email: { name: "email", value: formDataOfIdMission?.Email || user?.email || "" },
        idNumber: { name: "idNumber", value: formDataOfIdMission?.ID_Number || "" },
        idIssuer: {
          name: "idIssuer",
          value: formDataOfIdMission?.ID_State
            ? formDataOfIdMission?.ID_State + formDataOfIdMission?.Issuing_Country
            : formDataOfIdMission?.Issuing_Country || "",
        },
        idType: { name: "idType", value: formDataOfIdMission?.DocumentType || "" },
        idExpiryDate: {
          name: "idExpiryDate",
          value: formDataOfIdMission?.Expiration_Date ? formatData(formDataOfIdMission?.Expiration_Date) : "",
        },
        streetAddress: {
          name: "streetAddress",
          value: formDataOfIdMission?.ParsedAddressStreetNumber + formDataOfIdMission?.ParsedAddressStreetName || "",
        },
        phoneNumber: { name: "phoneNumber", value: formDataOfIdMission?.PhoneNumber || "" },
        zipCode: { name: "zipCode", value: formDataOfIdMission?.ParsedAddressPostalCode || "" },
        dateOfBirth: {
          name: "dateOfBirth",
          value: formDataOfIdMission?.Date_of_Birth ? formatData(formDataOfIdMission?.Date_of_Birth) : "",
        },
        country: { name: "country", value: formDataOfIdMission?.Issuing_Country || "" },
        issueDate: {
          name: "issueDate",
          value: formDataOfIdMission?.Issue_Date ? formatData(formDataOfIdMission?.Issue_Date) : "",
        },
        companyTitle: { name: "companyTitle", value: "" },
        state: { name: "state", value: formDataOfIdMission?.ParsedAddressProvince || "" },
        city: { name: "city", value: formDataOfIdMission?.ParsedAddressMunicipality || "" },
        data: { name: "data", value: formDataOfIdMission || "null" },
        createdAt: idMissionVerifiedData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      unwrapResult(action);
      // toast.error("you id didn't approved please try again");
      setIsIdMissionProcessing(false);
      setIdMissionVerified(true);
    });
    // Cleanup listener when component unmounts
    return () => {
      socket.off("idMission_processing_started");
      socket.off("idMission_verified");
      socket.off("idMission_failed");
      socket.off("idMission_other");
    };
  }, [dispatch, getUserProfile, idMissionVerifiedData?.createdAt, updateMyProfile, user?._id, user?.email]);

  // check validations
  useEffect(() => {
    const allFilled = Object.keys(idMissionVerifiedData).every((name) => {
      const val = idMissionVerifiedData[name];
      if (val == null) return false;
      if (typeof val === "string") return val.trim() !== "";
      if (typeof val === "object" && name !== "data")
        return Object.values(val).every((v) => v?.toString().trim() !== "");
      return true;
    });
    setIsAllRequiredFieldsFilled(allFilled);
  }, [idMissionVerifiedData]);

  useEffect(() => {
    if (!idMissionVerified || hasFocusedDetailsRef.current) return;
    hasFocusedDetailsRef.current = true;
    let f1, f2;
    f1 = requestAnimationFrame(() => {
      f2 = requestAnimationFrame(() => {
        const container = idMissionFormRef.current;
        if (!container) return;
        const inputs = Array.from(container.querySelectorAll("input:not([disabled]):not([readonly])")).filter(
          (el) => el.offsetParent !== null,
        );
        if (inputs.length > 0) inputs[0].focus();
      });
    });
    return () => {
      cancelAnimationFrame(f1);
      cancelAnimationFrame(f2);
    };
  }, [idMissionVerified]);

  // Enter-to-advance for the IDMission details form: pressing Enter in a text field
  // moves focus to the next text field (and submits on the last one). Attached directly
  // to the <form> via React onKeyDown so it reliably runs before the AI widget's global
  // Enter handler, regardless of ref/HMR timing.
  const handleIdMissionEnter = useCallback((e) => {
    if (e.key !== "Enter" || e.defaultPrevented) return;
    const active = e.target;
    if (active?.tagName?.toLowerCase() !== "input") return;
    // Radio/checkbox inputs are toggled with space/arrows — don't hijack Enter for them.
    if (active.type === "radio" || active.type === "checkbox") return;
    const container = idMissionFormRef.current;
    if (!container) return;
    // Let Google Places autocomplete keep Enter while its suggestion dropdown is open,
    // so selecting an address (which fills city/state/zip/country) still works.
    const pac = document.querySelector(".pac-container");
    if (pac && getComputedStyle(pac).display !== "none" && active.closest("[data-places-input]")) return;
    // Only visible, editable text-style inputs participate in the "Enter → next field" chain.
    const inputs = Array.from(
      container.querySelectorAll("input:not([disabled]):not([readonly]):not([type=hidden])"),
    ).filter((el) => el.offsetParent !== null && el.type !== "radio" && el.type !== "checkbox");
    const idx = inputs.indexOf(active);
    if (idx === -1) return;
    e.preventDefault();
    if (idx < inputs.length - 1) {
      inputs[idx + 1].focus();
    } else {
      submitFromEnterRef.current?.(e);
    }
  }, []);

  submitFromEnterRef.current = isAllRequiredFieldsFilled && !submiting ? submitIdMissionData : null;

  const isCreator = user?._id && user?._id == form?.data?.owner && user?.role !== "guest";
  if (!isApplied || loadingForValidatingOtp || isFormLoading || isApplying) return <CustomLoading />;

  return submiting ? (
    <div className="flex h-full flex-col items-center justify-center space-y-6 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-900">
      <div className="spinner"></div>
      <p className="animate-fade-in-out text-center text-lg font-medium text-gray-700 dark:text-gray-300">
        We are personalizing the form for you, please wait...
      </p>
    </div>
  ) : (
    <>
      {openOtpDisplayTextModal && form?.data && (
        <Modal onClose={() => setOpenOtpDisplayTextModal(false)}>
          <OtpDisplayText
            formRefetch={formRefetch}
            setOpenOtpDisplayTextModal={setOpenOtpDisplayTextModal}
            form={form?.data}
          />
        </Modal>
      )}
      {showIdMissionDataModal && (
        <Modal isOpen={customizeIdMissionTextModal} onClose={() => setShowIdMissionDataModal(false)}>
          <IdMissionDataModal
            formRefetch={formRefetch}
            setOpenIdMissionDataDisplayTextModal={setShowIdMissionDataModal}
            form={form?.data}
          />
        </Modal>
      )}
      {showSignatureModal && (
        <Modal onClose={() => setShowSignatureModal(false)}>
          <SignatureCustomization
            formRefetch={formRefetch}
            setShowSignatureModal={setShowSignatureModal}
            section={idMissionSection}
          />
        </Modal>
      )}
      {showSignatureHelpModal && (
        <Modal onClose={() => setShowSignatureHelpModal(false)}>
          <SignatureHelpCustomization
            formRefetch={formRefetch}
            setShowSignatureHelpModal={setShowSignatureHelpModal}
            section={idMissionSection}
          />
        </Modal>
      )}
      {openAiHelpSignModal && idMissionSection?.signAiResponse && (
        <Modal onClose={() => setOpenAiHelpSignModal(false)}>
          <AiHelpModal
            aiPrompt={idMissionSection?.signAiPrompt}
            aiResponse={idMissionSection?.signAiResponse}
            setOpenAiHelpModal={setOpenAiHelpSignModal}
          />
        </Modal>
      )}
      {customizeIdMissionTextModal && idMissionSection && (
        <Modal isOpen={customizeIdMissionTextModal} onClose={() => setCustomizeIdMissionTextModal(false)}>
          <EditSectionDisplayTextFromatingModal step={idMissionSection} setModal={setCustomizeIdMissionTextModal} />
        </Modal>
      )}
      {openRedirectModal ? (
        <>
          <div className="flex h-full"></div>
          <Modal>
            <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
              {/* Success Icon */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Title */}
              <h1 className="text-xl font-semibold text-gray-900">You’ve completed this step</h1>

              {/* Description */}
              <p className="mt-2 max-w-sm text-gray-600">
                You’ve already finished the ID Mission verification. Would you like to edit your details, or move to the
                next step?
              </p>

              {/* Buttons */}
              <div className="mt-6 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setOpenRedirectModal(false)}
                  label="Edit ID Mission"
                />
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setOpenRedirectModal(false);
                    dispatch(updateEmailVerified(false));
                    navigate(`/singleform/stepper/${formId}`);
                  }}
                  label="Continue to Next"
                />
              </div>
            </div>
          </Modal>
        </>
      ) : isIdMissionProcessing ? (
        <LoadingWithTimer setIsProcessing={setIsIdMissionProcessing} />
      ) : (
        <div className="mt-14 h-full overflow-auto text-center" data-testid="single-application">
          {!idMissionVerified ? (
            !emailVerified ? (
              <>
                <div ref={emailFormRef} className="flex flex-col items-center gap-3 w-full">
                  {isCreator && (
                    <div className="flex w-full items-center justify-end">
                      <Button label="Edit OTP Display Text" onClick={() => setOpenOtpDisplayTextModal(true)} />
                    </div>
                  )}
                  {form?.data?.otpDisplayFormatedText && (
                    <div className="flex w-full justify-center">
                      <div
                        className="w-full p-4 lg:px-20"
                        data-ai-display-text
                        dangerouslySetInnerHTML={{
                          __html: String(form?.data?.otpDisplayFormatedText || "")
                            // kill vw padding
                            .replace(/padding:\s*0\s*[\d.]+vw;?/g, "padding: 0;")
                            // kill vw width
                            .replace(/width:\s*[\d.]+vw;?/g, "width: 100%;")
                            // safety for links
                            .replace(/<a(\s+.*?)?>/g, (match) => {
                              if (match.includes("target=")) return match;
                              return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
                            }),
                        }}
                      />
                    </div>
                  )}
                  <div className="flex w-full items-center justify-center gap-4">
                    <TextField
                      data-testid="verification-email-input"
                      id="email-field"
                      name="email-field"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="max-w-125"
                      autoFocus={!otpSent ? true : false}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sentOtpForEmail();
                        }
                      }}
                    />
                    <Button
                      onClick={sentOtpForEmail}
                      disabled={otpLoading}
                      className={`min-w-32.5 py-2 ${otpLoading && "cursor-not-allowed opacity-25"}`}
                      label={"Send Code"}
                      data-testid="verification-send-otp-btn"
                    />
                  </div>
                  {otpSent && (
                    <div className="flex w-full items-center justify-center gap-4">
                      <TextField
                        data-testid="verification-otp-input"
                        id="otp-field"
                        name="otp-field"
                        type="text"
                        placeholder="Enter your Code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="max-w-125"
                        autoFocus={otpSent ? true : false}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            verifyWithOtp();
                          }
                        }}
                      />
                      <Button
                        onClick={verifyWithOtp}
                        disabled={emailLoading}
                        className={`min-w-32.5 py-2 ${emailLoading && "cursor-not-allowed opacity-25"}`}
                        label={"Submit Code"}
                        data-testid="verification-submit-otp-btn"
                      />
                    </div>
                  )}
                  {isCreator && (
                    <Button
                      onClick={() => {
                        dispatch(updateEmailVerified(true));
                        navigate(`/verification?formid=${formId}&brandingName=${form?.data?.branding?.name}`);
                      }}
                      className="w-full max-w-162.5"
                      variant="secondary"
                      label={"Skip"}
                    />
                  )}
                </div>
              </>
            ) : qrLoading ? (
              <CustomLoading />
            ) : (
              <div className="flex flex-col items-center gap-3">
                {isCreator && (
                  <div className="flex w-full items-center justify-end p-4">
                    <Button onClick={() => setCustomizeIdMissionTextModal(true)} label={"Customize Display Text"} />
                  </div>
                )}
                {(idMissionSection?.ai_formatting || idMissionSection?.displayText) && (
                  <div className="flex w-full gap-3">
                    <div
                      className="w-full"
                      data-ai-display-text
                      dangerouslySetInnerHTML={{
                        __html: String(idMissionSection?.ai_formatting || idMissionSection?.displayText || "").replace(
                          /<a(\s+.*?)?>/g,
                          (match) => {
                            if (match.includes("target=")) return match;
                            return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
                          },
                        ),
                      }}
                    />
                  </div>
                )}
                <div className="mt-4 flex w-full flex-col items-center gap-4">
                  {qrCode ? (
                    <img
                      data-testid="idmission-qr-code"
                      className="h-57.5 w-57.5"
                      src={`data:image/jpeg;base64,${qrCode}`}
                      alt="qr code "
                    />
                  ) : qrFetchError ? (
                    <p className="max-w-57.5 text-center text-sm text-gray-500">
                      QR code could not be loaded. Use the refresh button to try again, or enter your ID details
                      manually below.
                    </p>
                  ) : null}
                </div>
                <div className="mt-4 flex w-full flex-col items-center gap-4">
                  <Button
                    data-testid="idmission-refresh-qr-btn"
                    className="w-full max-w-57.5"
                    label={"Refresh QR Code"}
                    onClick={getQrAndWebLink}
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (initialDataLoadRef.current) await initialDataLoadRef.current;
                    setIdMissionVerified(true);
                  }}
                  className="w-full max-w-57.5"
                  variant="secondary"
                  data-testid="idmission-manual-entry-btn"
                  label={"Enter ID Details Manually"}
                />
              </div>
            )
          ) : idMissionVerified ? (
            idMissionVerifiedData && (
              <div className="flex w-full flex-col p-2">
                <div className="flex items-center justify-between">
                  {form?.data?.idMissionDataDisplayFormatedText ? (
                    <div className="flex items-end gap-3">
                      <div
                        className="w-full"
                        data-ai-display-text
                        dangerouslySetInnerHTML={{
                          __html: String(form?.data?.idMissionDataDisplayFormatedText || "").replace(
                            /<a(\s+.*?)?>/g,
                            (match) => {
                              if (match.includes("target=")) return match; // avoid duplicates
                              return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
                            },
                          ),
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex w-full gap-3">
                      <h3 className="text-textPrimary mb-4 w-full text-center text-2xl font-semibold">
                        Primary Applicant Information
                      </h3>
                    </div>
                  )}
                  {isCreator && (
                    <Button
                      className="self-end"
                      label={"Customize Display Text"}
                      onClick={() => setShowIdMissionDataModal(true)}
                    />
                  )}
                </div>
                <form ref={idMissionFormRef} onKeyDown={handleIdMissionEnter} className="flex flex-wrap gap-4">
                  <TextField
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        name: { name: "name", value: e.target.value },
                      })
                    }
                    id="name"
                    name="name"
                    required
                    value={idMissionVerifiedData?.name?.value}
                    label="Name:*"
                    placeholder="First name, middle name (optional), last name"
                    className={"max-w-100!"}
                  />
                  <TextField
                    id="email"
                    name="email"
                    value={idMissionVerifiedData?.email?.value}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        email: { name: "email", value: e.target.value },
                      })
                    }
                    label="Email Address:*"
                    required
                    placeholder="e.g. john.doe@email.com"
                    className={"max-w-100!"}
                  />
                  <TextField
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={idMissionVerifiedData?.dateOfBirth?.value}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        dateOfBirth: { name: "dateOfBirth", value: e.target.value },
                      })
                    }
                    label="Date of Birth:*"
                    required
                    className={"max-w-100!"}
                  />
                  <TextField
                    id="idType"
                    name="idType"
                    type="text"
                    value={idMissionVerifiedData?.idType?.value}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        idType: { name: "idType", value: e.target.value },
                      })
                    }
                    label="ID Type:*"
                    required
                    placeholder={'e.g. "Driver\'s License", "State ID", "Passport"'}
                    suggestions={["Driver's License", "State ID", "Passport"]}
                    className={"max-w-100!"}
                  />{" "}
                  <TextField
                    id="idIssuer"
                    name="idIssuer"
                    type="text"
                    value={idMissionVerifiedData?.idIssuer?.value}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        idIssuer: { name: "idIssuer", value: e.target.value },
                      })
                    }
                    label="ID Issuer:*"
                    required
                    placeholder="State/Province or Country"
                    suggestions={ID_ISSUE_STATES_AND_COUNTRIES}
                    className={"max-w-100!"}
                  />{" "}
                  <TextField
                    id="idExpiryDate"
                    name="idExpiryDate"
                    type="date"
                    value={idMissionVerifiedData?.idExpiryDate?.value}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        idExpiryDate: { name: "idExpiryDate", value: e.target.value },
                      })
                    }
                    label="ID Expiry Date:*"
                    required
                    className={"max-w-100!"}
                  />{" "}
                  <TextField
                    id="issueDate"
                    name="issueDate"
                    type="date"
                    value={idMissionVerifiedData?.issueDate?.value}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        issueDate: { name: "issueDate", value: e.target.value },
                      })
                    }
                    label="Issue Date:*"
                    required
                    className={"max-w-100!"}
                  />{" "}
                  <TextField
                    id="idNumber"
                    name="idNumber"
                    required
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        idNumber: { name: "idNumber", value: e.target.value },
                      })
                    }
                    value={idMissionVerifiedData?.idNumber?.value || ""}
                    label="ID Number:*"
                    placeholder="As it appears on your ID"
                    className={"max-w-100!"}
                  />{" "}
                  <div data-places-input="true" className="w-full max-w-100">
                    <Autocomplete
                      onLoad={onLoad}
                      className="w-full"
                      onPlaceChanged={onPlaceChanged}
                      options={{
                        types: ["address"],
                        fields: ["address_components", "geometry", "formatted_address", "place_id"],
                      }}
                    >
                      <TextField
                        id="streetAddress"
                        name="streetAddress"
                        type="text"
                        required
                        value={idMissionVerifiedData?.streetAddress?.value || ""}
                        onChange={(e) =>
                          setIdMissionVerifiedData({
                            ...idMissionVerifiedData,
                            streetAddress: { name: "streetAddress", value: e.target.value },
                          })
                        }
                        label="Street Address:*"
                        placeholder="Start typing your address"
                        className={"max-w-100!"}
                      />
                    </Autocomplete>
                  </div>
                  <TextField
                    id="address2"
                    name="address2"
                    type="text"
                    value={idMissionVerifiedData?.address2?.value || ""}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        address2: { name: "address2", value: e.target.value },
                      })
                    }
                    label="Address 2 (Apt, Suite, Unit)"
                    placeholder="Apt, Suite, Unit, Floor, etc."
                    className={"max-w-100!"}
                  />
                  <TextField
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={idMissionVerifiedData?.city?.value || ""}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        city: { name: "city", value: e.target.value },
                      })
                    }
                    label="City:*"
                    placeholder="e.g. New York City"
                    suggestions={MAJOR_CITIES}
                    className={"max-w-100!"}
                  />
                  <TextField
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    value={idMissionVerifiedData?.zipCode?.value || ""}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        zipCode: { name: "zipCode", value: e.target.value },
                      })
                    }
                    label="Zip or Postal Code"
                    placeholder="e.g. 90210"
                    className={"max-w-100!"}
                  />
                  <TextField
                    id="state"
                    name="state"
                    type="text"
                    required
                    value={idMissionVerifiedData?.state?.value || ""}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        state: { name: "state", value: e.target.value },
                      })
                    }
                    label="State/Province:*"
                    placeholder="e.g. California"
                    className={"max-w-100!"}
                  />
                  <TextField
                    id="country"
                    name="country"
                    type="text"
                    required
                    value={idMissionVerifiedData?.country?.value || ""}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        country: { name: "country", value: e.target.value },
                      })
                    }
                    label="Country:*"
                    placeholder="e.g. United States"
                    className={"max-w-100!"}
                  />
                  <TextField
                    id="companyTitle"
                    name="companyTitle"
                    value={idMissionVerifiedData?.companyTitle?.value || ""}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        companyTitle: { name: "companyTitle", value: e.target.value },
                      })
                    }
                    label="Company Title:*"
                    required
                    placeholder="e.g. CEO, Owner, Director"
                    className={"max-w-100!"}
                  />
                  <TextField
                    id="phoneNumber"
                    name="phoneNumber"
                    value={idMissionVerifiedData?.phoneNumber?.value || ""}
                    onChange={(e) =>
                      setIdMissionVerifiedData({
                        ...idMissionVerifiedData,
                        phoneNumber: { name: "phoneNumber", value: e.target.value },
                      })
                    }
                    formatting="3,3,4"
                    label="Phone Number:*"
                    placeholder="e.g. 555-867-5309"
                    required
                    type="text"
                    className={"max-w-100!"}
                  />
                  <div className="bg-backgroundColor flex w-full border p-4">
                    <RadioInputType
                      optionColumnCount={1}
                      className={"w-full"}
                      field={{
                        label: "What is the role you are filling for the company as you complete this application? ",
                        options: [
                          {
                            label:
                              "A primary company operator/controller (C-level executive, owner or other person that holds significant control over company direction and decisions)",
                            value: "primaryOperatorAndController",
                          },
                          {
                            label:
                              "The primary contact for the company for this product or service, but not a company operator/controller ",
                            value: "primaryContact",
                          },
                          {
                            label: "Both a company operator and the primary contact",
                            value: "both",
                          },
                        ],
                        name: "roleFillingForCompany",
                        uniqueId: "roleFillingForCompany",
                        required: true,
                      }}
                      form={{
                        roleFillingForCompany: {
                          name: "roleFillingForCompany",
                          value: idMissionVerifiedData?.roleFillingForCompany?.value || "",
                        },
                      }}
                      onChange={(e) =>
                        setIdMissionVerifiedData({
                          ...idMissionVerifiedData,
                          roleFillingForCompany: { name: "roleFillingForCompany", value: e?.target?.value },
                        })
                      }
                    />
                  </div>
                  <div className="flex w-full flex-col">
                    <div className="my-4 flex w-full justify-between gap-2">
                      {(form?.data?.idMissionSignDisplayFormatedText || form?.data?.idMissionSignDisplayText) && (
                        <div className="flex items-end gap-3">
                          <div
                            // className="flex flex-1 items-end gap-3"
                            className="w-full"
                            data-ai-display-text
                            dangerouslySetInnerHTML={{
                              __html: String(
                                form?.data?.idMissionSignDisplayFormatedText ||
                                  form?.data?.idMissionSignDisplayText ||
                                  "",
                              ).replace(/<a(\s+.*?)?>/g, (match) => {
                                if (match.includes("target=")) return match; // avoid duplicates
                                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
                              }),
                            }}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-2">
                        {isCreator && (
                          <div className="flex items-center gap-2">
                            <Button label="Enable Help" onClick={() => setShowSignatureHelpModal(true)} />
                            <Button label="Customize Signature" onClick={() => setShowSignatureModal(true)} />
                          </div>
                        )}
                        {idMissionSection?.signAiResponse && (
                          <Button label="Help" onClick={() => setOpenAiHelpSignModal(true)} />
                        )}
                      </div>
                    </div>
                    <div
                      data-ai-type="sign"
                      data-ai-id="signature-field"
                      data-ai-label="Signature"
                      data-ai-required="true"
                      data-ai-value={idMissionVerifiedData?.signature?.value?.secureUrl || ""}
                      data-ai-text={(() => {
                        const strip = (v) =>
                          String(v || "")
                            .replace(/<[^>]*>/g, " ")
                            .replace(/\s+/g, " ")
                            .trim();
                        return (
                          strip(form?.data?.idMissionSignDisplayFormatedText) ||
                          strip(form?.data?.idMissionSignDisplayText)
                        ).slice(0, 500);
                      })()}
                    >
                      <SignatureBox
                        oldSignatureUrl={idMissionVerifiedData?.signature?.value?.secureUrl || ""}
                        className={"min-w-full"}
                        onSave={handleSignature}
                      />
                    </div>
                  </div>
                </form>
                <div className="flex w-full items-center justify-end gap-2 p-2">
                  {isCreator && (
                    <Button
                      onClick={() => {
                        navigate(`/singleform/stepper/${formId}`);
                      }}
                      className="mt-4"
                      variant="secondary"
                      label={"Skip for now"}
                    />
                  )}
                  <Button
                    disabled={!isAllRequiredFieldsFilled || submiting}
                    label={!isAllRequiredFieldsFilled ? "Some fields are missing" : "Continue to next"}
                    onClick={submitIdMissionData}
                    className="mt-4"
                  />
                </div>
              </div>
            )
          ) : (
            <CustomLoading />
          )}
        </div>
      )}
    </>
  );
}

const SignatureCustomization = ({ section, formRefetch, setShowSignatureModal }) => {
  const [updateSection, { isLoading: isUpdatingSection }] = useUpdateFormSectionMutation();
  const [formateTextInMarkDown, { isLoading: isFormating }] = useFormateTextInMarkDownMutation();
  const [signatureData, setSignatureData] = useState({
    isSignature: section?.isSignature || false,
    isSignDisplayText: section?.isSignDisplayText || false,
    signDisplayText: section?.signDisplayText || "",
    signFormatedDisplayText: section?.signDisplayFormattedText || "",
    formatingAiInstruction: section?.signDisplayFormattingTextInstructions || "",
  });

  const handleUpdateSectionForSignature = async () => {
    try {
      const res = await updateSection({
        _id: section?._id,
        data: {
          isSignature: signatureData.isSignature,
          isSignDisplayText: signatureData.isSignDisplayText,
          signDisplayText: signatureData.signDisplayText,
          signDisplayFormattedText: signatureData.signFormatedDisplayText,
          signDisplayFormattingTextInstructions: signatureData.formatingAiInstruction,
        },
      }).unwrap();
      if (res.success) {
        await formRefetch();
        toast.success(res.message);
        setShowSignatureModal(false);
      }
    } catch (error) {
      console.log("Error while updating signature", error);
    }
  };

  const formateTextWithAi = useCallback(async () => {
    if (!signatureData?.signDisplayText || !signatureData?.formatingAiInstruction) {
      toast.error("Please enter formatting instruction and text to format");
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: signatureData.signDisplayText,
        instructions: signatureData?.formatingAiInstruction,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setSignatureData((prev) => ({ ...prev, signFormatedDisplayText: html }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to format text");
    }
  }, [formateTextInMarkDown, signatureData?.formatingAiInstruction, signatureData.signDisplayText]);

  return (
    <div className="flex flex-col gap-2 border-2 p-2 pb-4">
      {/* display text  */}
      <div className="flex w-full flex-col gap-2 pb-4">
        <TextField
          type="textarea"
          label="Display Text"
          value={signatureData?.signDisplayText}
          name="displayText"
          onChange={(e) => setSignatureData((prev) => ({ ...prev, signDisplayText: e.target.value }))}
        />
        <label htmlFor="formattingInstructionForAi">Enter formatting instruction for AI and click on generate</label>
        <textarea
          id="formattingInstructionForAi"
          rows={2}
          value={signatureData?.formatingAiInstruction}
          onChange={(e) => setSignatureData((prev) => ({ ...prev, formatingAiInstruction: e.target.value }))}
          className="w-full rounded-md border border-gray-300 p-2 outline-none"
        />
        <div className="flex justify-end">
          <Button onClick={formateTextWithAi} disabled={isFormating} className="mt-8" label={"Format Text"} />
        </div>
        {signatureData?.signFormatedDisplayText && (
          <div
            className="w-full"
            data-ai-display-text
            dangerouslySetInnerHTML={{
              __html: String(signatureData?.signFormatedDisplayText || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match; // avoid duplicates
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        )}
      </div>

      <div className="flex w-full items-center justify-end gap-2">
        <Button
          onClick={() => setShowSignatureModal(false)}
          disabled={isUpdatingSection}
          variant="secondary"
          label={"Cancel"}
        />
        <Button onClick={handleUpdateSectionForSignature} disabled={isUpdatingSection} label={"Save"} />
      </div>
    </div>
  );
};
const SignatureHelpCustomization = ({ section, formRefetch, setShowSignatureHelpModal }) => {
  const [updateSection, { isLoading: isUpdatingSection }] = useUpdateFormSectionMutation();
  const [formateTextInMarkDown, { isLoading: isFormating }] = useFormateTextInMarkDownMutation();
  const [signatureData, setSignatureData] = useState({
    isSignAiHelp: section?.isSignAiHelp || true,
    signAiPrompt: section?.signAiPrompt || "",
    signAiResponse: section?.signAiResponse || "",
  });

  const handleUpdateSectionForSignature = async () => {
    try {
      const res = await updateSection({
        _id: section?._id,
        data: {
          isSignAiHelp: signatureData.isSignAiHelp,
          signAiPrompt: signatureData.signAiPrompt,
          signAiResponse: signatureData.signAiResponse,
        },
      }).unwrap();
      if (res.success) {
        await formRefetch();
        toast.success(res.message);
        setShowSignatureHelpModal(false);
      }
    } catch (error) {
      console.log("Error while updating signature", error);
    }
  };

  const formateTextWithAi = useCallback(async () => {
    if (!signatureData?.signAiPrompt) {
      toast.error("Please enter prompt to first");
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: signatureData.signAiPrompt,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setSignatureData((prev) => ({ ...prev, signAiResponse: html }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to format text");
    }
  }, [formateTextInMarkDown, signatureData.signAiPrompt]);

  return (
    <div className="flex flex-col gap-2 border-2 p-2 pb-4">
      {/* display text  */}
      <div className="flex w-full flex-col gap-2 pb-4">
        <TextField
          label="Ai Prompt"
          type="textarea"
          value={signatureData?.signAiPrompt}
          name="aiPrompt"
          onChange={(e) => setSignatureData((prev) => ({ ...prev, signAiPrompt: e.target.value }))}
        />

        <div className="flex justify-end">
          <Button onClick={formateTextWithAi} disabled={isFormating} className="mt-8" label={"Get Response"} />
        </div>
        {signatureData?.signAiResponse && (
          <div
            className="w-full"
            dangerouslySetInnerHTML={{
              __html: String(signatureData?.signAiResponse || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match; // avoid duplicates
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        )}
      </div>

      <div className="flex w-full items-center justify-end gap-2">
        <Button
          onClick={() => setShowSignatureHelpModal(false)}
          variant="secondary"
          disabled={isUpdatingSection}
          label={"Cancel"}
        />
        <Button onClick={handleUpdateSectionForSignature} disabled={isUpdatingSection} label={"Save"} />
      </div>
    </div>
  );
};
const OtpDisplayText = ({ form, formRefetch, setOpenOtpDisplayTextModal }) => {
  const [updateForm, { isLoading: isUpdatingSection }] = useUpdateFormMutation();
  const [formateTextInMarkDown, { isLoading: isFormating }] = useFormateTextInMarkDownMutation();
  const [displayData, setDisplayData] = useState({
    otpDisplayText: form?.otpDisplayText || "",
    otpDisplayFormatingInstructions: form?.otpDisplayFormatingInstructions || "",
    otpDisplayFormatedText: form?.otpDisplayFormatedText || "",
  });

  const handleUpdateSectionForSignature = async () => {
    try {
      const res = await updateForm({
        _id: form?._id,
        data: {
          otpDisplayText: displayData.otpDisplayText,
          otpDisplayFormatingInstructions: displayData.otpDisplayFormatingInstructions,
          otpDisplayFormatedText: displayData.otpDisplayFormatedText,
        },
      }).unwrap();
      if (res.success) {
        await formRefetch();
        toast.success(res.message);
        setOpenOtpDisplayTextModal(false);
      }
    } catch (error) {
      console.log("Error while updating signature", error);
    }
  };

  const formateTextWithAi = useCallback(async () => {
    if (!displayData?.otpDisplayText || !displayData?.otpDisplayFormatingInstructions) {
      toast.error("Please enter formatting instruction and text to format");
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: displayData.otpDisplayText,
        instructions: displayData?.otpDisplayFormatingInstructions,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setDisplayData((prev) => ({ ...prev, otpDisplayFormatedText: html }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to format text");
    }
  }, [displayData.otpDisplayText, displayData?.otpDisplayFormatingInstructions, formateTextInMarkDown]);

  return (
    <div className="flex flex-col gap-2 border-2 p-2 pb-4">
      {/* display text  */}
      <div className="flex w-full flex-col gap-2 pb-4">
        <TextField
          type="textarea"
          label="Display Text"
          value={displayData?.otpDisplayText}
          name="displayText"
          onChange={(e) => setDisplayData((prev) => ({ ...prev, otpDisplayText: e.target.value }))}
        />
        <label htmlFor="formattingInstructionForAi">Enter formatting instruction for AI and click on generate</label>
        <textarea
          id="formattingInstructionForAi"
          rows={2}
          value={displayData?.otpDisplayFormatingInstructions}
          onChange={(e) => setDisplayData((prev) => ({ ...prev, otpDisplayFormatingInstructions: e.target.value }))}
          className="w-full rounded-md border border-gray-300 p-2 outline-none"
        />
        <div className="flex justify-end">
          <Button onClick={formateTextWithAi} disabled={isFormating} className="mt-8" label={"Format Text"} />
        </div>
        {displayData?.otpDisplayFormatedText && (
          <div
            className="w-full text-center"
            dangerouslySetInnerHTML={{
              __html: String(displayData?.otpDisplayFormatedText || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match; // avoid duplicates
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        )}
      </div>

      <div className="flex w-full items-center justify-end gap-2">
        <Button
          onClick={() => setOpenOtpDisplayTextModal(false)}
          disabled={isUpdatingSection}
          variant="secondary"
          label={" Cancel"}
        />
        <Button onClick={handleUpdateSectionForSignature} disabled={isUpdatingSection} label={"Save"} />
      </div>
    </div>
  );
};

const IdMissionDataModal = ({ form, formRefetch, setOpenIdMissionDataDisplayTextModal }) => {
  const [updateForm, { isLoading: isUpdatingSection }] = useUpdateFormMutation();
  const [formateTextInMarkDown, { isLoading: isFormating }] = useFormateTextInMarkDownMutation();
  const [displayData, setDisplayData] = useState({
    idMissionDataDisplayText: form?.idMissionDataDisplayText || "",
    idMissionDataDisplayFormatingInstructions: form?.idMissionDataDisplayFormatingInstructions || "",
    idMissionDataDisplayFormatedText: form?.idMissionDataDisplayFormatedText || "",
  });

  const handleUpdateSectionForSignature = async () => {
    try {
      const res = await updateForm({
        _id: form?._id,
        data: {
          idMissionDataDisplayText: displayData.idMissionDataDisplayText,
          idMissionDataDisplayFormatingInstructions: displayData.idMissionDataDisplayFormatingInstructions,
          idMissionDataDisplayFormatedText: displayData.idMissionDataDisplayFormatedText,
        },
      }).unwrap();
      if (res.success) {
        await formRefetch();
        toast.success(res.message);
        setOpenIdMissionDataDisplayTextModal(false);
      }
    } catch (error) {
      console.log("Error while updating signature", error);
    }
  };

  const formateTextWithAi = useCallback(async () => {
    if (!displayData?.idMissionDataDisplayText || !displayData?.idMissionDataDisplayFormatingInstructions) {
      toast.error("Please enter formatting instruction and text to format");
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: displayData.idMissionDataDisplayText,
        instructions: displayData?.idMissionDataDisplayFormatingInstructions,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setDisplayData((prev) => ({ ...prev, idMissionDataDisplayFormatedText: html }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to format text");
    }
  }, [
    displayData.idMissionDataDisplayText,
    displayData?.idMissionDataDisplayFormatingInstructions,
    formateTextInMarkDown,
  ]);

  return (
    <div className="flex flex-col gap-2 border-2 p-2 pb-4">
      {/* display text  */}
      <div className="flex w-full flex-col gap-2 pb-4">
        <TextField
          type="textarea"
          label="Display Text"
          value={displayData?.idMissionDataDisplayText}
          name="displayText"
          onChange={(e) => setDisplayData((prev) => ({ ...prev, idMissionDataDisplayText: e.target.value }))}
        />
        <label htmlFor="formattingInstructionForAi">Enter formatting instruction for AI and click on generate</label>
        <textarea
          id="formattingInstructionForAi"
          rows={2}
          value={displayData?.idMissionDataDisplayFormatingInstructions}
          onChange={(e) =>
            setDisplayData((prev) => ({
              ...prev,
              idMissionDataDisplayFormatingInstructions: e.target.value,
            }))
          }
          className="w-full rounded-md border border-gray-300 p-2 outline-none"
        />
        <div className="flex justify-end">
          <Button onClick={formateTextWithAi} disabled={isFormating} className="mt-8" label={"Format Text"} />
        </div>
        {displayData?.idMissionDataDisplayFormatedText && (
          <div
            className="w-full"
            dangerouslySetInnerHTML={{
              __html: String(displayData?.idMissionDataDisplayFormatedText || "").replace(/<a(\s+.*?)?>/g, (match) => {
                if (match.includes("target=")) return match; // avoid duplicates
                return match.replace("<a", '<a target="_blank" rel="noopener noreferrer"');
              }),
            }}
          />
        )}
      </div>

      <div className="flex w-full items-center justify-end gap-2">
        <Button
          onClick={() => setOpenIdMissionDataDisplayTextModal(false)}
          disabled={isUpdatingSection}
          variant="secondary"
          label={" Cancel"}
        />
        <Button onClick={handleUpdateSectionForSignature} disabled={isUpdatingSection} label={"Save"} />
      </div>
    </div>
  );
};
