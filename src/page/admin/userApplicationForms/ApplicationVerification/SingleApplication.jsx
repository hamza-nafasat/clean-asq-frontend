import SignatureBox from '@/components/shared/SignatureBox';
import Button from '@/components/shared/small/Button';
import CustomLoading from '@/components/shared/small/CustomLoading';
import { AiHelpModal, RadioInputType } from '@/components/shared/small/DynamicField';
import { EditSectionDisplayTextFromatingModal } from '@/components/shared/small/EditSectionDisplayTextFromatingModal';
import { LoadingWithTimer } from '@/components/shared/small/LoadingWithTimer';
import Modal from '@/components/shared/small/Modal';
import TextField from '@/components/shared/small/TextField';
import useApplyBranding from '@/hooks/useApplyBranding';
import { socket } from '@/main';
import { useGetMyProfileFirstTimeMutation, useUpdateMyProfileMutation } from '@/redux/apis/authApis';
import {
  useFormateTextInMarkDownMutation,
  useGetSavedFormMutation,
  useGetSingleFormQueryQuery,
  useSaveFormInDraftMutation,
  useUpdateFormMutation,
  useUpdateFormSectionMutation,
} from '@/redux/apis/formApis';
import { useGetIdMissionSessionMutation, useSendOtpMutation, useVerifyEmailMutation } from '@/redux/apis/idMissionApis';
import { userExist, userNotExist } from '@/redux/slices/authSlice';
import { addSavedFormData, updateEmailVerified, updateFormState } from '@/redux/slices/formSlice';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary';
import { collectClientDetails } from '@/utils/userDetails';
import { Autocomplete } from '@react-google-maps/api';
import { unwrapResult } from '@reduxjs/toolkit';
import DOMPurify from 'dompurify';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function SingleApplication() {
  const navigate = useNavigate();
  const params = useParams();
  const formId = params.formId;
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { emailVerified } = useSelector(state => state.form);
  const [webLink, setWebLink] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [getQrAndWebLinkLoading, setGetQrAndWebLinkLoading] = useState(false);
  const [isIdMissionProcessing, setIsIdMissionProcessing] = useState(false);
  const [idMissionVerified, setIdMissionVerified] = useState(false);
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [submiting, setSubmiting] = useState(false);

  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [getIdMissionSession] = useGetIdMissionSessionMutation();
  const [sendOtp, { isLoading: otpLoading }] = useSendOtpMutation();
  const [verifyEmail, { isLoading: emailLoading }] = useVerifyEmailMutation();
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const { data: form, refetch: formRefetch, isLoading: isFormLoading } = useGetSingleFormQueryQuery({ _id: formId });
  const [getSavedFormData] = useGetSavedFormMutation();
  const { formData } = useSelector(state => state?.form);
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
    name: '',
    email: user?.email,
    idNumber: '',
    streetAddress: '',
    phoneNumber: '',
    companyTitle: '',
    issueDate: '',
    idIssuer: '',
    idType: '',
    idExpiryDate: '',
    city: '',
    state: '',
    dateOfBirth: '',
    zipCode: '',
    country: '',
    roleFillingForCompany: '',
    address2: 'None',
    signature: { secureUrl: '', publicId: '', resourceType: '' },
  });

  const autocompleteRef = useRef(null);

  const idMissionSection = form?.data?.sections?.find(sec => sec?.title?.toLowerCase() == 'id_verification_blk');
  const handleSignature = async (file, setIsSaving) => {
    try {
      if (!file) return toast.error('Please add signature');
      if (idMissionVerifiedData?.signature?.publicId || idMissionVerifiedData?.signature?.secureUrl) {
        await deleteImageFromCloudinary(
          idMissionVerifiedData?.signature?.publicId,
          idMissionVerifiedData?.signature?.resourceType
        );
      }
      const { secureUrl, publicId, resourceType } = await uploadImageOnCloudinary(file);
      if (!secureUrl || !publicId) return toast.error('Something went wrong while uploading image');
      setIdMissionVerifiedData(prev => ({ ...prev, signature: { secureUrl, publicId, resourceType } }));
      toast.success('Signature uploaded successfully');
    } catch (error) {
      console.log('error while uploading image', error);
      toast.error('Something went wrong while uploading image');
    } finally {
      if (setIsSaving) setIsSaving(false);
    }
  };

  // functions for autocomplete
  // ===========================

  const onLoad = autocompleteInstance => {
    autocompleteRef.current = autocompleteInstance;
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place) return;

    if (!place.address_components?.length && place.place_id) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: place.place_id }, (results, status) => {
        if (status === 'OK' && results?.length) {
          handleGeocodeResults(results);
        } else {
          handlePlace(place);
        }
      });
      return;
    }

    handlePlace(place);

    const hasPostal = (place.address_components || []).some(c => c.types.includes('postal_code'));

    if (!hasPostal && place.geometry?.location) {
      reverseGeocode(place.geometry.location.lat(), place.geometry.location.lng());
    }
  };

  const handlePlace = place => {
    const components = place.address_components || [];
    const geometry = place.geometry;
    const parsed = parseComponents(components, geometry);

    setIdMissionVerifiedData(prev => ({ ...prev, ...parsed }));
  };

  const handleGeocodeResults = results => {
    const parsed = parseComponentsFromResults(results);
    setIdMissionVerifiedData(prev => ({ ...prev, ...parsed }));
  };

  const parseComponents = (components = [], geometry) => {
    const find = types => {
      const t = Array.isArray(types) ? types : [types];
      return components.find(c => t.some(x => c.types.includes(x)));
    };

    const getLong = types => find(types)?.long_name || '';
    const getShort = types => find(types)?.short_name || '';

    const streetNumber = getLong('street_number');
    const route = getLong('route');
    const subpremise = getLong('subpremise');
    const premise = getLong('premise');

    const city =
      getLong('locality') ||
      getLong('postal_town') ||
      getLong('administrative_area_level_3') ||
      getLong('administrative_area_level_2') ||
      getLong(['sublocality', 'sublocality_level_1']) ||
      '';

    const stateShort = getShort('administrative_area_level_1');
    const stateLong = getLong('administrative_area_level_1');

    const postal = getLong('postal_code');
    const postalSuffix = getLong('postal_code_suffix');
    const zipCode = postalSuffix ? `${postal}-${postalSuffix}` : postal;

    const country = getLong('country');

    const streetAddress = [premise, streetNumber, route, subpremise].filter(Boolean).join(' ').trim();

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

  const parseComponentsFromResults = results => {
    let city = '';
    let state = '';
    let postal = '';
    let suffix = '';
    let country = '';
    let lat, lng;
    let streetAddress = '';

    for (const result of results) {
      const comps = result.address_components || [];

      const find = types => {
        const t = Array.isArray(types) ? types : [types];
        return comps.find(c => t.some(x => c.types.includes(x)));
      };

      if (!city) {
        city =
          find('locality')?.long_name ||
          find('postal_town')?.long_name ||
          find('administrative_area_level_3')?.long_name ||
          find('administrative_area_level_2')?.long_name ||
          '';
      }

      if (!state) {
        const s = find('administrative_area_level_1');
        if (s) state = s.short_name || s.long_name;
      }

      if (!postal) {
        const p = find('postal_code');
        if (p) postal = p.long_name;
      }

      if (!suffix) {
        const s = find('postal_code_suffix');
        if (s) suffix = s.long_name;
      }

      if (!country) {
        const c = find('country');
        if (c) country = c.long_name;
      }

      if (!lat && result.geometry?.location) {
        lat = result.geometry.location.lat();
        lng = result.geometry.location.lng();
      }

      if (!streetAddress) {
        const sn = find('street_number')?.long_name || '';
        const rt = find('route')?.long_name || '';
        const pm = find('premise')?.long_name || '';
        const sp = find('subpremise')?.long_name || '';

        const assembled = [pm, sn, rt, sp].filter(Boolean).join(' ').trim();
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
      if (status !== 'OK' || !results?.length) return;

      const parsed = parseComponentsFromResults(results);

      setIdMissionVerifiedData(prev => ({
        ...prev,
        streetAddress: prev.streetAddress || parsed.streetAddress,
        city: prev.city || parsed.city,
        state: prev.state || parsed.state,
        country: prev.country || parsed.country,
        zipCode: prev.zipCode || parsed.zipCode,
        lat: parsed.lat ?? prev.lat,
        lng: parsed.lng ?? prev.lng,
      }));
    });
  };

  // other functions
  // ==============

  const formatData = useCallback(date => {
    const [d, m, y] = date.split('/');
    return `${y}-${m}-${d}`;
  }, []);

  const saveInProgress = useCallback(
    async ({ data, name }) => {
      try {
        if (!formId) return toast.error('From id not provided');
        const { data: userDetailsData } = await collectClientDetails();
        const formDataInRedux = { ...formData, [name]: data, ['metadata']: userDetailsData };
        // console.log('save in progress', formDataInRedux);
        const res = await saveFormInDraft({
          formId: formId,
          formData: { ...formDataInRedux },
        }).unwrap();
        if (res.success) toast.success(res.message);
      } catch (error) {
        console.log('error while saving form in draft', error);
        toast.error(error?.data?.message || 'Error while saving form in draft');
      }
    },
    [formData, formId, saveFormInDraft]
  );

  const getSavedFormDataAndSaveInredux = useCallback(async () => {
    try {
      const res = await getSavedFormData({ formId: formId }).unwrap();
      if (res.success) {
        const savedData = res?.data?.savedData || [];
        const formDataOfIdMission = savedData?.idMission;
        const action = await dispatch(addSavedFormData(savedData || []));
        unwrapResult(action);
        if (!savedData?.company_lookup_data) {
          console.log('saved data is ,', savedData);
          return navigate(`/verification?formid=${formId}`);
        }
        setIdMissionVerifiedData({
          name: formDataOfIdMission?.name || '',
          email: formDataOfIdMission?.email || user?.email,
          idNumber: formDataOfIdMission?.idNumber || '',
          idIssuer: formDataOfIdMission?.idIssuer || '',
          idType: formDataOfIdMission?.idType || '',
          idExpiryDate: formDataOfIdMission?.idExpiryDate || '',
          streetAddress: formDataOfIdMission?.streetAddress || '',
          phoneNumber: formDataOfIdMission?.phoneNumber || '',
          zipCode: formDataOfIdMission?.zipCode || '',
          dateOfBirth: formDataOfIdMission?.dateOfBirth || '',
          country: formDataOfIdMission?.country || '',
          issueDate: formDataOfIdMission?.issueDate || '',
          companyTitle: formDataOfIdMission?.companyTitle || '',
          state: formDataOfIdMission?.state || '',
          city: formDataOfIdMission?.city || '',
          address2: formDataOfIdMission?.address2 || 'None',
          signature: formDataOfIdMission?.signature || '',
        });
        if (formDataOfIdMission?.name && savedData?.company_lookup_data) {
          setIdMissionVerified(true);
          setOpenRedirectModal(true);
        }
      }
    } catch (error) {
      if (error?.data?.message === 'Form Not Saved in draft') {
        return navigate(`/verification?formid=${formId}`);
      }
      console.log('error while getting saved form data', error);
      // toast.error(error?.data?.message || 'Error while getting saved form data');
    }
  }, [dispatch, formId, getSavedFormData, navigate, user?.email]);

  const submitIdMissionData = useCallback(
    async e => {
      setOpenRedirectModal(false);
      e.preventDefault();
      setSubmiting(true);
      try {
        if (!idMissionVerifiedData?.signature?.publicId && !idMissionVerifiedData?.signature?.secureUrl) {
          return toast.error('Please do and save the signature');
        }
        const action = await dispatch(updateFormState({ data: idMissionVerifiedData, name: 'idMission' }));
        unwrapResult(action);
        await saveInProgress({ data: idMissionVerifiedData, name: 'idMission' });
        return navigate(`/singleform/stepper/${formId}`);
      } catch (error) {
        console.log('error while saving form in draft', error);
      } finally {
        setSubmiting(false);
      }
    },
    [dispatch, formId, idMissionVerifiedData, navigate, saveInProgress]
  );

  const getQrAndWebLink = useCallback(async () => {
    try {
      const res = await getIdMissionSession().unwrap();
      // console.log('session id is ', res);
      if (res.success) {
        setQrCode(res.data?.customerData?.qrCode);
        setWebLink(res.data?.customerData?.kycUrl);
      }
    } catch (error) {
      console.log('Error fetching session ID:', error);
    }
  }, [getIdMissionSession]);

  const sentOtpForEmail = useCallback(async () => {
    try {
      if (!email) return toast.error('Please enter your email');
      const res = await sendOtp({ email, formId }).unwrap();
      if (res.success) {
        setOtpSent(true);
        toast.success(res.message);
      }
    } catch (error) {
      console.log('Error sending OTP:', error);
      toast.error(error?.data?.message || 'Failed to send OTP');
    }
  }, [email, formId, sendOtp]);

  const verifyWithOtp = useCallback(async () => {
    try {
      if (!email || !otp) return toast.error('Please enter your email and otp');
      setLoadingForValidatingOtp(true);
      const res = await verifyEmail({ email, otp }).unwrap();
      if (res.success) {
        await dispatch(updateEmailVerified(true));
        await getUserProfile()
          .then(res => {
            if (res?.data?.success) dispatch(userExist(res.data.data));
            else dispatch(userNotExist());
          })
          .catch(() => dispatch(userNotExist()));
        await getSavedFormDataAndSaveInredux();
      }
    } catch (error) {
      console.log('Error sending OTP:', error);
      toast.error(error?.data?.message || 'Failed to send OTP');
    } finally {
      setLoadingForValidatingOtp(false);
    }
  }, [dispatch, email, getSavedFormDataAndSaveInredux, getUserProfile, otp, verifyEmail]);

  const getQrLinkOnEmailVerified = useCallback(() => {
    if (emailVerified && formData && formData?.idMission) {
      const formDataOfIdMission = formData?.idMission;
      setIdMissionVerifiedData({
        name: formDataOfIdMission?.name || '',
        email: formDataOfIdMission?.email || user?.email || '',
        idNumber: formDataOfIdMission?.idNumber || '',
        idIssuer: formDataOfIdMission?.idIssuer || '',
        idType: formDataOfIdMission?.idType || '',
        idExpiryDate: formDataOfIdMission?.idExpiryDate || '',
        streetAddress: formDataOfIdMission?.streetAddress || '',
        phoneNumber: formDataOfIdMission?.phoneNumber || '',
        zipCode: formDataOfIdMission?.zipCode || '',
        dateOfBirth: formDataOfIdMission?.dateOfBirth || '',
        country: formDataOfIdMission?.country || '',
        issueDate: formDataOfIdMission?.issueDate || '',
        companyTitle: formDataOfIdMission?.companyTitle || '',
        state: formDataOfIdMission?.state || '',
        city: formDataOfIdMission?.city || '',
        address2: formDataOfIdMission?.address2 || 'None',
        signature: formDataOfIdMission?.signature || '',
        roleFillingForCompany: formDataOfIdMission?.roleFillingForCompany || '',
      });
      setIdMissionVerified(true);
      setOpenRedirectModal(true);
    }
    if (!qrCode && !webLink) {
      setGetQrAndWebLinkLoading(true);
      getQrAndWebLink().finally(() => setGetQrAndWebLinkLoading(false));
    }
  }, [emailVerified, formData, getQrAndWebLink, qrCode, user?.email, webLink]);

  // get qr and session id
  useEffect(() => {
    if (!qrCode && !webLink && !idMissionVerified) {
      getQrLinkOnEmailVerified();
    }
  }, [getQrLinkOnEmailVerified, idMissionVerified, qrCode, webLink]);

  // get user when he logged in
  useEffect(() => {
    getUserProfile()
      .then(res => {
        if (res?.data?.success) dispatch(userExist(res.data.data));
        else dispatch(userNotExist());
      })
      .catch(() => dispatch(userNotExist()));
  }, [getUserProfile, dispatch]);

  // check and get socket events
  useEffect(() => {
    // Setup listener ONCE when component mounts
    // start id mission
    socket.on('idMission_processing_started', data => {
      console.log('you start id mission verification', data);
      setIsIdMissionProcessing(true);
    });
    // id mission verified success fully
    socket.on('idMission_verified', async data => {
      console.log('verified id mission data is', data);
      if (user?._id && data?.Form_Data?.FullName) {
        const res = await updateMyProfile({
          _id: user?._id,
          firstName: data?.Form_Data?.FullName?.split(' ')[0],
          lastName: data?.Form_Data?.FullName?.split(' ')[1],
        }).unwrap();
        if (!res.success) return toast.error(res.message);
        else {
          await getUserProfile()
            .then(res => {
              if (res?.data?.success) dispatch(userExist(res.data.data));
            })
            .catch(() => dispatch(userNotExist()));
        }
      }

      // console.log('You are verified successfully', data);
      setIsIdMissionProcessing(false);
      const formDataOfIdMission = data?.Form_Data;
      let address2 = formDataOfIdMission?.Address2 || '';
      let address = formDataOfIdMission?.Address || '';
      if (address.includes(address2)) {
        address2 = 'None';
      }

      setIdMissionVerifiedData({
        name: (formDataOfIdMission?.Name || '').concat(' ', formDataOfIdMission?.Last_Name || ''),
        email: formDataOfIdMission?.Email || user?.email || '',
        idNumber: formDataOfIdMission?.ID_Number || '',
        idIssuer: formDataOfIdMission?.ID_State
          ? formDataOfIdMission?.ID_State + formDataOfIdMission?.Issuing_Country
          : formDataOfIdMission?.Issuing_Country || '',
        idType: formDataOfIdMission?.DocumentType || '',
        idExpiryDate: formDataOfIdMission?.Expiration_Date ? formatData(formDataOfIdMission?.Expiration_Date) : '',
        streetAddress:
          (formDataOfIdMission?.ParsedAddressStreetNumber || '') +
          ' ' +
          (formDataOfIdMission?.ParsedAddressStreetName || ''),
        phoneNumber: formDataOfIdMission?.PhoneNumber || '',
        zipCode: formDataOfIdMission?.ParsedAddressPostalCode || '',
        dateOfBirth: formDataOfIdMission?.Date_of_Birth ? formatData(formDataOfIdMission?.Date_of_Birth) : '',
        country: formDataOfIdMission?.Issuing_Country || '',
        issueDate: formDataOfIdMission?.Issue_Date ? formatData(formDataOfIdMission?.Issue_Date) : '',
        companyTitle: '',
        state: formDataOfIdMission?.ParsedAddressProvince || '',
        city: formDataOfIdMission?.ParsedAddressMunicipality || '',
        address2: address2,
      });
      setIdMissionVerified(true);
    });
    // id mission failed
    socket.on('idMission_failed', async data => {
      console.log('failed id mission data is', data);

      // console.log('you start id mission failed', data);
      // toast.error("you id didn't approved please try again");
      const action = await dispatch(
        updateFormState({
          data: {
            idMissionVerification: 'failed',
            verificationStatus: data?.Form_Status || 'rejected',
            idMissionData: data,
          },
          name: 'idMission',
        })
      );

      // console.log('You are verified successfully', data);
      setIsIdMissionProcessing(false);
      const formDataOfIdMission = data?.Form_Data;
      let address2 = formDataOfIdMission?.Address2 || '';
      let address = formDataOfIdMission?.Address || '';
      if (address.includes(address2)) {
        address2 = 'None';
      }

      setIdMissionVerifiedData({
        name: (formDataOfIdMission?.name || '')?.concat(' ', formDataOfIdMission?.Last_Name || ''),
        email: formDataOfIdMission?.Email || user?.email || '',
        idNumber: formDataOfIdMission?.ID_Number || '',
        idIssuer: formDataOfIdMission?.ID_State
          ? formDataOfIdMission?.ID_State + formDataOfIdMission?.Issuing_Country
          : formDataOfIdMission?.Issuing_Country || '',
        idType: formDataOfIdMission?.DocumentType || '',
        idExpiryDate: formDataOfIdMission?.Expiration_Date ? formatData(formDataOfIdMission?.Expiration_Date) : '',
        streetAddress:
          formDataOfIdMission?.ParsedAddressStreetNumber + formDataOfIdMission?.ParsedAddressStreetName || '',
        phoneNumber: formDataOfIdMission?.PhoneNumber || '',
        zipCode: formDataOfIdMission?.ParsedAddressPostalCode || '',
        dateOfBirth: formDataOfIdMission?.Date_of_Birth ? formatData(formDataOfIdMission?.Date_of_Birth) : '',
        country: formDataOfIdMission?.Issuing_Country || '',
        issueDate: formDataOfIdMission?.Issue_Date ? formatData(formDataOfIdMission?.Issue_Date) : '',
        companyTitle: '',
        state: formDataOfIdMission?.ParsedAddressProvince || '',
        city: formDataOfIdMission?.ParsedAddressMunicipality || '',
        address2: address2,
      });
      unwrapResult(action);
      setIsIdMissionProcessing(false);
      setIdMissionVerified(true);
    });
    socket.on('idMission_other', async data => {
      console.log('other id mission data is', data);

      console.log('Id Mission Data ', data);
      const action = await dispatch(
        updateFormState({
          data: {
            idMissionVerification: 'failed',
            verificationStatus: data?.Form_Status || 'rejected',
            idMissionData: data,
          },
          name: 'idMission',
        })
      );

      setIsIdMissionProcessing(false);
      const formDataOfIdMission = data?.Form_Data;
      let address2 = formDataOfIdMission?.Address2 || '';
      let address = formDataOfIdMission?.Address || '';
      if (address.includes(address2)) {
        address2 = 'None';
      }

      setIdMissionVerifiedData({
        name: (formDataOfIdMission?.name || '')?.concat(' ', formDataOfIdMission?.Last_Name || ''),
        email: formDataOfIdMission?.Email || user?.email || '',
        idNumber: formDataOfIdMission?.ID_Number || '',
        idIssuer: formDataOfIdMission?.ID_State
          ? formDataOfIdMission?.ID_State + formDataOfIdMission?.Issuing_Country
          : formDataOfIdMission?.Issuing_Country || '',
        idType: formDataOfIdMission?.DocumentType || '',
        idExpiryDate: formDataOfIdMission?.Expiration_Date ? formatData(formDataOfIdMission?.Expiration_Date) : '',
        streetAddress:
          formDataOfIdMission?.ParsedAddressStreetNumber + formDataOfIdMission?.ParsedAddressStreetName || '',
        phoneNumber: formDataOfIdMission?.PhoneNumber || '',
        zipCode: formDataOfIdMission?.ParsedAddressPostalCode || '',
        dateOfBirth: formDataOfIdMission?.Date_of_Birth ? formatData(formDataOfIdMission?.Date_of_Birth) : '',
        country: formDataOfIdMission?.Issuing_Country || '',
        issueDate: formDataOfIdMission?.Issue_Date ? formatData(formDataOfIdMission?.Issue_Date) : '',
        companyTitle: '',
        state: formDataOfIdMission?.ParsedAddressProvince || '',
        city: formDataOfIdMission?.ParsedAddressMunicipality || '',
        address2: address2,
      });
      unwrapResult(action);
      toast.error("you id didn't approved please try again");
      setIsIdMissionProcessing(false);
      setIdMissionVerified(true);
    });

    // Cleanup listener when component unmounts
    return () => {
      socket.off('idMission_processing_started');
      socket.off('idMission_verified');
      socket.off('idMission_failed');
      socket.off('idMission_other');
    };
  }, [dispatch, formId, formatData, getUserProfile, idMissionVerified, updateMyProfile, user?._id, user?.email]);

  // check validations
  useEffect(() => {
    const allFilled = Object.keys(idMissionVerifiedData).every(name => {
      const val = idMissionVerifiedData[name];
      console.log('val is ', val);
      if (val == null) return false;
      if (typeof val === 'string') return val.trim() !== '';
      if (Array.isArray(val))
        return (
          val.length > 0 &&
          val.every(item =>
            typeof item === 'object'
              ? Object.values(item).every(v => v?.toString().trim() !== '')
              : item?.toString().trim() !== ''
          )
        );
      if (typeof val === 'object') return Object.values(val).every(v => v?.toString().trim() !== '');
      return true;
    });
    setIsAllRequiredFieldsFilled(allFilled);
  }, [idMissionVerifiedData]);

  const isCreator = user?._id && user?._id == form?.data?.owner && user?.role !== 'guest';
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
        <div className="mt-14 h-full overflow-auto text-center">
          {!idMissionVerified ? ( // TODO add not
            !emailVerified ? (
              <>
                <div className="flex flex-col items-center gap-3">
                  {isCreator && (
                    <div className="flex w-full items-center justify-end">
                      <Button label="Edit OTP Display Text" onClick={() => setOpenOtpDisplayTextModal(true)} />
                    </div>
                  )}
                  {form?.data?.otpDisplayFormatedText && (
                    <div className="flex w-full gap-3">
                      <div
                        className="w-full"
                        dangerouslySetInnerHTML={{
                          __html: String(form?.data?.otpDisplayFormatedText || '').replace(/<a(\s+.*?)?>/g, match => {
                            if (match.includes('target=')) return match; // avoid duplicates
                            return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
                          }),
                        }}
                      />
                    </div>
                  )}
                  <div className="flex w-full items-center justify-center gap-4">
                    <TextField
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="max-w-[500px]"
                    />
                    <Button
                      onClick={sentOtpForEmail}
                      disabled={otpLoading}
                      className={`min-w-[130px] py-2 ${otpLoading && 'cursor-not-allowed opacity-25'}`}
                      label={'Send Code'}
                    />
                  </div>
                  {otpSent && (
                    <div className="flex w-full items-center justify-center gap-4">
                      <TextField
                        type="text"
                        placeholder="Enter your Code"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        className="max-w-[500px]"
                      />
                      <Button
                        onClick={verifyWithOtp}
                        disabled={emailLoading}
                        className={`min-w-[130px] py-2 ${emailLoading && 'cursor-not-allowed opacity-25'}`}
                        label={'Submit Code'}
                      />
                    </div>
                  )}
                  {isCreator && (
                    <Button
                      onClick={() => {
                        dispatch(updateEmailVerified(true));
                        navigate(`/verification?formid=${formId}`);
                      }}
                      className="w-full max-w-[650px]"
                      variant="secondary"
                      label={'Skip'}
                    />
                  )}
                </div>
              </>
            ) : getQrAndWebLinkLoading ? (
              <CustomLoading />
            ) : (
              <div className="flex flex-col items-center gap-3">
                {isCreator && (
                  <div className="flex w-full items-center justify-end p-4">
                    <Button onClick={() => setCustomizeIdMissionTextModal(true)} label={'Customize Text'} />
                  </div>
                )}
                {qrCode && webLink && (
                  <>
                    {/* <h1 className="text-textPrimary text-start text-2xl font-semibold">Id Mission Verification</h1>
                    <p className="text-textPrimary mt-10 text-[18px] font-semibold">We need to Verify your identity</p> */}
                    {idMissionSection?.ai_formatting && (
                      <div className="flex w-full gap-3">
                        <div
                          className="w-full"
                          dangerouslySetInnerHTML={{
                            __html: String(idMissionSection?.ai_formatting || '').replace(/<a(\s+.*?)?>/g, match => {
                              if (match.includes('target=')) return match; // avoid duplicates
                              return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
                            }),
                          }}
                        />
                      </div>
                    )}
                    <div className="mt-4 flex w-full flex-col items-center gap-4">
                      <img className="h-[230px] w-[230px]" src={`data:image/jpeg;base64,${qrCode}`} alt="qr code " />
                    </div>
                    <div className="mt-4 flex w-full flex-col items-center gap-4">
                      <Button className="w-full max-w-[230px]" label={'Refresh QR Code'} onClick={getQrAndWebLink} />
                    </div>
                    {/* <div className="mt-4 flex w-full flex-col items-center gap-4">
                      <Button
                      className="w-full max-w-[230px]"
                        label={'Open LInk in New Tab'}
                        onClick={async () => {
                          window.open(webLink, '_blank');
                        }}
                        rightIcon={MdVerifiedUser}
                      />
                    </div> */}
                  </>
                )}
                {isCreator && (
                  <Button
                    onClick={() => {
                      setIdMissionVerified(true);
                    }}
                    className="w-full max-w-[230px]"
                    variant="secondary"
                    label={'Skip'}
                  />
                )}
              </div>
            )
          ) : (
            <div className="flex w-full flex-col p-2">
              <div className="flex items-center justify-between">
                {form?.data?.idMissionDataDisplayFormatedText ? (
                  <div className="flex items-end gap-3">
                    <div
                      className="w-full"
                      dangerouslySetInnerHTML={{
                        __html: String(form?.data?.idMissionDataDisplayFormatedText || '').replace(
                          /<a(\s+.*?)?>/g,
                          match => {
                            if (match.includes('target=')) return match; // avoid duplicates
                            return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
                          }
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
                    onClick={() => setShowIdMissionDataModal(true)}
                    label={'Customize Display Text'}
                  />
                )}
              </div>
              <form className="flex flex-wrap gap-4">
                <TextField
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, name: e.target.value })}
                  required
                  value={idMissionVerifiedData?.name}
                  label="Name:*"
                  className={'max-w-[400px]!'}
                />
                <TextField
                  value={idMissionVerifiedData?.email}
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, email: e.target.value })}
                  label="Email Address:*"
                  required
                  className={'max-w-[400px]!'}
                />
                <TextField
                  type="date"
                  value={idMissionVerifiedData?.dateOfBirth}
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, dateOfBirth: e.target.value })}
                  label="Date of Birth:*"
                  required
                  className={'max-w-[400px]!'}
                />
                <TextField
                  type="text"
                  value={idMissionVerifiedData?.idType}
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, idType: e.target.value })}
                  label="Id Type:*"
                  required
                  className={'max-w-[400px]!'}
                />{' '}
                <TextField
                  type="text"
                  value={idMissionVerifiedData?.idIssuer}
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, idIssuer: e.target.value })}
                  label="Id Issuer:*"
                  required
                  className={'max-w-[400px]!'}
                />{' '}
                <TextField
                  type="text"
                  value={idMissionVerifiedData?.idExpiryDate}
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, idExpiryDate: e.target.value })}
                  label="Id Expiry Date:*"
                  required
                  className={'max-w-[400px]!'}
                />{' '}
                <TextField
                  type="text"
                  value={idMissionVerifiedData?.issueDate}
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, issueDate: e.target.value })}
                  label="Issue Date:*"
                  required
                  className={'max-w-[400px]!'}
                />{' '}
                <TextField
                  required
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, idNumber: e.target.value })}
                  value={idMissionVerifiedData?.idNumber}
                  label="Id Number:*"
                  className={'max-w-[400px]!'}
                />{' '}
                <Autocomplete
                  onLoad={onLoad}
                  className="w-full max-w-[400px]"
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    types: ['address'],
                    fields: ['address_components', 'geometry', 'formatted_address', 'place_id'],
                  }}
                >
                  <TextField
                    type="text"
                    required
                    value={idMissionVerifiedData?.streetAddress}
                    onChange={e =>
                      setIdMissionVerifiedData({ ...idMissionVerifiedData, streetAddress: e.target.value })
                    }
                    label="Street Address:*"
                    className={'max-w-[400px]!'}
                  />
                </Autocomplete>
                <TextField
                  type="text"
                  required
                  value={idMissionVerifiedData?.city}
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, city: e.target.value })}
                  label="City:*"
                  className={'max-w-[400px]!'}
                />
                <TextField
                  type="text"
                  required
                  value={idMissionVerifiedData?.zipCode}
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, zipCode: e.target.value })}
                  label="Zip Code:*"
                  className={'max-w-[400px]!'}
                />
                <TextField
                  type="text"
                  required
                  value={idMissionVerifiedData?.state}
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, state: e.target.value })}
                  label="State:*"
                  className={'max-w-[400px]!'}
                />
                <TextField
                  type="text"
                  required
                  value={idMissionVerifiedData?.country}
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, country: e.target.value })}
                  label="Country:*"
                  className={'max-w-[400px]!'}
                />
                <TextField
                  value={idMissionVerifiedData?.companyTitle}
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, companyTitle: e.target.value })}
                  label="Company Title:*"
                  required
                  className={'max-w-[400px]!'}
                />
                <TextField
                  value={idMissionVerifiedData?.phoneNumber}
                  onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, phoneNumber: e.target.value })}
                  formatting="3,3,4"
                  label="Phone Number:*"
                  required
                  name={'phoneNumber'}
                  type="text"
                  className={'max-w-[400px]!'}
                />
                <div className="bg-backgroundColor flex w-full border p-4">
                  <RadioInputType
                    className={'w-full'}
                    field={{
                      label: 'What is the role you are filling for the company as you complete this application? ',
                      options: [
                        {
                          label:
                            'A primary company operator/controller (C-level executive, owner or other person that holds significant control over company direction and decisions)',
                          value: 'primaryOperatorAndController',
                        },
                        {
                          label:
                            'The primary contact for the company for this product or service, but not a company operator/controller ',
                          value: 'primaryContact',
                        },
                        {
                          label: 'Both a company operator and the primary contact',
                          value: 'both',
                        },
                      ],
                      name: 'roleFillingForCompany',
                      required: true,
                    }}
                    form={{ roleFillingForCompany: idMissionVerifiedData?.roleFillingForCompany }}
                    onChange={e =>
                      setIdMissionVerifiedData({ ...idMissionVerifiedData, roleFillingForCompany: e.target?.value })
                    }
                    setForm={setIdMissionVerifiedData}
                  />
                </div>
                <div className="flex w-full flex-col">
                  <div className="my-4 flex w-full justify-between gap-2">
                    {idMissionSection?.signDisplayFormattedText && (
                      <div className="flex items-end gap-3">
                        <div
                          // className="flex flex-1 items-end gap-3"
                          className="w-full"
                          dangerouslySetInnerHTML={{
                            __html: String(idMissionSection?.signDisplayFormattedText || '').replace(
                              /<a(\s+.*?)?>/g,
                              match => {
                                if (match.includes('target=')) return match; // avoid duplicates
                                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
                              }
                            ),
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
                  <SignatureBox
                    oldSignatureUrl={idMissionVerifiedData?.signature?.secureUrl}
                    className={'min-w-full'}
                    onSave={handleSignature}
                  />
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
                    label={'Skip for now'}
                  />
                )}
                <Button
                  disabled={!isAllRequiredFieldsFilled || submiting}
                  label={!isAllRequiredFieldsFilled ? 'Some fields are missing' : 'Continue to next'}
                  onClick={submitIdMissionData}
                  className="mt-4"
                />
              </div>
            </div>
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
    signDisplayText: section?.signDisplayText || '',
    signFormatedDisplayText: section?.signDisplayFormattedText || '',
    formatingAiInstruction: section?.signDisplayFormattingTextInstructions || '',
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
      console.log('Error while updating signature', error);
    }
  };

  const formateTextWithAi = useCallback(async () => {
    if (!signatureData?.signDisplayText || !signatureData?.formatingAiInstruction) {
      toast.error('Please enter formatting instruction and text to format');
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: signatureData.signDisplayText,
        instructions: signatureData?.formatingAiInstruction,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setSignatureData(prev => ({ ...prev, signFormatedDisplayText: html }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
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
          onChange={e => setSignatureData(prev => ({ ...prev, signDisplayText: e.target.value }))}
        />
        <label htmlFor="formattingInstructionForAi">Enter formatting instruction for AI and click on generate</label>
        <textarea
          id="formattingInstructionForAi"
          rows={2}
          value={signatureData?.formatingAiInstruction}
          onChange={e => setSignatureData(prev => ({ ...prev, formatingAiInstruction: e.target.value }))}
          className="w-full rounded-md border border-gray-300 p-2 outline-none"
        />
        <div className="flex justify-end">
          <Button onClick={formateTextWithAi} disabled={isFormating} className="mt-8" label={'Format Text'} />
        </div>
        {signatureData?.signFormatedDisplayText && (
          <div
            className="w-full"
            dangerouslySetInnerHTML={{
              __html: String(signatureData?.signFormatedDisplayText || '').replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
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
          label={'Cancel'}
        />
        <Button onClick={handleUpdateSectionForSignature} disabled={isUpdatingSection} label={'Save'} />
      </div>
    </div>
  );
};
const SignatureHelpCustomization = ({ section, formRefetch, setShowSignatureHelpModal }) => {
  const [updateSection, { isLoading: isUpdatingSection }] = useUpdateFormSectionMutation();
  const [formateTextInMarkDown, { isLoading: isFormating }] = useFormateTextInMarkDownMutation();
  const [signatureData, setSignatureData] = useState({
    isSignAiHelp: section?.isSignAiHelp || true,
    signAiPrompt: section?.signAiPrompt || '',
    signAiResponse: section?.signAiResponse || '',
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
      console.log('Error while updating signature', error);
    }
  };

  const formateTextWithAi = useCallback(async () => {
    if (!signatureData?.signAiPrompt) {
      toast.error('Please enter prompt to first');
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: signatureData.signAiPrompt,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setSignatureData(prev => ({ ...prev, signAiResponse: html }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
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
          onChange={e => setSignatureData(prev => ({ ...prev, signAiPrompt: e.target.value }))}
        />

        <div className="flex justify-end">
          <Button onClick={formateTextWithAi} disabled={isFormating} className="mt-8" label={'Get Response'} />
        </div>
        {signatureData?.signAiResponse && (
          <div
            className="w-full"
            dangerouslySetInnerHTML={{
              __html: String(signatureData?.signAiResponse || '').replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
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
          label={'Cancel'}
        />
        <Button onClick={handleUpdateSectionForSignature} disabled={isUpdatingSection} label={'Save'} />
      </div>
    </div>
  );
};
const OtpDisplayText = ({ form, formRefetch, setOpenOtpDisplayTextModal }) => {
  const [updateForm, { isLoading: isUpdatingSection }] = useUpdateFormMutation();
  const [formateTextInMarkDown, { isLoading: isFormating }] = useFormateTextInMarkDownMutation();
  const [displayData, setDisplayData] = useState({
    otpDisplayText: form?.otpDisplayText || '',
    otpDisplayFormatingInstructions: form?.otpDisplayFormatingInstructions || '',
    otpDisplayFormatedText: form?.otpDisplayFormatedText || '',
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
      console.log('Error while updating signature', error);
    }
  };

  const formateTextWithAi = useCallback(async () => {
    if (!displayData?.otpDisplayText || !displayData?.otpDisplayFormatingInstructions) {
      toast.error('Please enter formatting instruction and text to format');
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: displayData.otpDisplayText,
        instructions: displayData?.otpDisplayFormatingInstructions,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setDisplayData(prev => ({ ...prev, otpDisplayFormatedText: html }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
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
          onChange={e => setDisplayData(prev => ({ ...prev, otpDisplayText: e.target.value }))}
        />
        <label htmlFor="formattingInstructionForAi">Enter formatting instruction for AI and click on generate</label>
        <textarea
          id="formattingInstructionForAi"
          rows={2}
          value={displayData?.otpDisplayFormatingInstructions}
          onChange={e => setDisplayData(prev => ({ ...prev, otpDisplayFormatingInstructions: e.target.value }))}
          className="w-full rounded-md border border-gray-300 p-2 outline-none"
        />
        <div className="flex justify-end">
          <Button onClick={formateTextWithAi} disabled={isFormating} className="mt-8" label={'Format Text'} />
        </div>
        {displayData?.otpDisplayFormatedText && (
          <div
            className="w-full text-center"
            dangerouslySetInnerHTML={{
              __html: String(displayData?.otpDisplayFormatedText || '').replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
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
          label={' Cancel'}
        />
        <Button onClick={handleUpdateSectionForSignature} disabled={isUpdatingSection} label={'Save'} />
      </div>
    </div>
  );
};

const IdMissionDataModal = ({ form, formRefetch, setOpenIdMissionDataDisplayTextModal }) => {
  const [updateForm, { isLoading: isUpdatingSection }] = useUpdateFormMutation();
  const [formateTextInMarkDown, { isLoading: isFormating }] = useFormateTextInMarkDownMutation();
  const [displayData, setDisplayData] = useState({
    idMissionDataDisplayText: form?.idMissionDataDisplayText || '',
    idMissionDataDisplayFormatingInstructions: form?.idMissionDataDisplayFormatingInstructions || '',
    idMissionDataDisplayFormatedText: form?.idMissionDataDisplayFormatedText || '',
  });

  const handleUpdateSectionForSignature = async () => {
    try {
      console.log('');
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
      console.log('Error while updating signature', error);
    }
  };

  const formateTextWithAi = useCallback(async () => {
    if (!displayData?.idMissionDataDisplayText || !displayData?.idMissionDataDisplayFormatingInstructions) {
      toast.error('Please enter formatting instruction and text to format');
      return;
    }
    try {
      const res = await formateTextInMarkDown({
        text: displayData.idMissionDataDisplayText,
        instructions: displayData?.idMissionDataDisplayFormatingInstructions,
      }).unwrap();
      if (res.success) {
        let html = DOMPurify.sanitize(res.data);
        setDisplayData(prev => ({ ...prev, idMissionDataDisplayFormatedText: html }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || 'Failed to format text');
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
          onChange={e => setDisplayData(prev => ({ ...prev, idMissionDataDisplayText: e.target.value }))}
        />
        <label htmlFor="formattingInstructionForAi">Enter formatting instruction for AI and click on generate</label>
        <textarea
          id="formattingInstructionForAi"
          rows={2}
          value={displayData?.idMissionDataDisplayFormatingInstructions}
          onChange={e =>
            setDisplayData(prev => ({ ...prev, idMissionDataDisplayFormatingInstructions: e.target.value }))
          }
          className="w-full rounded-md border border-gray-300 p-2 outline-none"
        />
        <div className="flex justify-end">
          <Button onClick={formateTextWithAi} disabled={isFormating} className="mt-8" label={'Format Text'} />
        </div>
        {displayData?.idMissionDataDisplayFormatedText && (
          <div
            className="w-full"
            dangerouslySetInnerHTML={{
              __html: String(displayData?.idMissionDataDisplayFormatedText || '').replace(/<a(\s+.*?)?>/g, match => {
                if (match.includes('target=')) return match; // avoid duplicates
                return match.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
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
          label={' Cancel'}
        />
        <Button onClick={handleUpdateSectionForSignature} disabled={isUpdatingSection} label={'Save'} />
      </div>
    </div>
  );
};
