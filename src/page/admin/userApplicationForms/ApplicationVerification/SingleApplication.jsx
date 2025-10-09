import SignatureBox from '@/components/shared/SignatureBox';
import Button from '@/components/shared/small/Button';
import Checkbox from '@/components/shared/small/Checkbox';
import CustomLoading from '@/components/shared/small/CustomLoading';
import { LoadingWithTimer } from '@/components/shared/small/LoadingWithTimer';
import Modal from '@/components/shared/small/Modal';
import TextField from '@/components/shared/small/TextField';
import DOMPurify from 'dompurify';
import { useBranding } from '@/hooks/BrandingContext';
import { socket } from '@/main';
import { useGetMyProfileFirstTimeMutation, useUpdateMyProfileMutation } from '@/redux/apis/authApis';
import {
  useFormateTextInMarkDownMutation,
  useGetSavedFormMutation,
  useGetSingleFormQueryQuery,
  useSaveFormInDraftMutation,
  useUpdateFormSectionMutation,
} from '@/redux/apis/formApis';
import { useGetIdMissionSessionMutation, useSendOtpMutation, useVerifyEmailMutation } from '@/redux/apis/idMissionApis';
import { userExist, userNotExist } from '@/redux/slices/authSlice';
import { addSavedFormData, updateEmailVerified, updateFormState } from '@/redux/slices/formSlice';
import { deleteImageFromCloudinary, uploadImageOnCloudinary } from '@/utils/cloudinary';
import { collectClientDetails } from '@/utils/userDetails';
import { Autocomplete } from '@react-google-maps/api';
import { unwrapResult } from '@reduxjs/toolkit';
import { useCallback, useEffect, useState } from 'react';
import { MdVerifiedUser } from 'react-icons/md';
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
  const [autocomplete, setAutocomplete] = useState(null);
  const [getQrAndWebLinkLoading, setGetQrAndWebLinkLoading] = useState(false);
  const [isIdMissionProcessing, setIsIdMissionProcessing] = useState(false);
  const [idMissionVerified, setIdMissionVerified] = useState(false);
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);

  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [getIdMissionSession] = useGetIdMissionSessionMutation();
  const [sendOtp, { isLoading: otpLoading }] = useSendOtpMutation();
  const [verifyEmail, { isLoading: emailLoading }] = useVerifyEmailMutation();
  const [updateMyProfile] = useUpdateMyProfileMutation();
  const { data: form, refetch: formRefetch } = useGetSingleFormQueryQuery({ _id: formId });
  const [getSavedFormData] = useGetSavedFormMutation();
  const { formData } = useSelector(state => state?.form);
  const [saveFormInDraft] = useSaveFormInDraftMutation();
  const [openRedirectModal, setOpenRedirectModal] = useState(false);
  const [idMissionVerifiedData, setIdMissionVerifiedData] = useState({
    name: '',
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
    signature: { secureUrl: '', publicId: '', resourceType: '' },
  });
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const idMissionSection = form?.data?.sections?.find(sec => sec?.title?.toLowerCase() == 'id_verification_blk');

  const handleSignature = async file => {
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
    } catch (error) {
      console.log('error while uploading image', error);
      toast.error('Something went wrong while uploading image');
    }
  };

  const onLoad = useCallback(autoC => {
    autoC.setFields(['address_components', 'formatted_address', 'geometry', 'place_id']);
    setAutocomplete(autoC);
  }, []);

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

  const onPlaceChanged = () => {
    const place = autocomplete.getPlace();
    // console.log('place', place);
    fillBasicComponents(place.address_components || []);
    if (!place.address_components.some(c => c.types.includes('postal_code'))) {
      const { lat, lng } = place.geometry.location;
      reverseGeocode(lat(), lng());
    }
  };
  const fillBasicComponents = components => {
    const getComp = type => {
      const c = components.find(c => c.types.includes(type));
      return c ? c.long_name : '';
    };

    const findStreetNumber = getComp('street_number');
    const findStreetAddress = getComp('sublocality') || getComp('route') || getComp('locality');
    const combineStreetAddress = findStreetNumber ? `${findStreetNumber} ${findStreetAddress}` : findStreetAddress;

    setIdMissionVerifiedData(prev => ({
      ...prev,
      streetAddress: combineStreetAddress,
      city: getComp('locality') || getComp('administrative_area_level_1'),
      state: getComp('administrative_area_level_1'),
      country: getComp('country'),
      zipCode: getComp('postal_code'), // may be empty
    }));
  };
  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== 'OK' || !results || !results.length) {
        console.warn('Geocoder failed:', status);
        return;
      }
      const comp = results[0].address_components;
      const postal = comp.find(c => c.types.includes('postal_code'));
      if (postal) {
        setIdMissionVerifiedData(prev => ({
          ...prev,
          zipCode: postal?.short_name,
        }));
      }
    });
  };

  const submitIdMissionData = useCallback(
    async e => {
      e.preventDefault();
      if (!idMissionVerifiedData?.signature?.publicId && !idMissionVerifiedData?.signature?.secureUrl) {
        return toast.error('Please do and save the signature');
      }
      const action = await dispatch(updateFormState({ data: idMissionVerifiedData, name: 'idMission' }));
      unwrapResult(action);
      await saveInProgress({ data: idMissionVerifiedData, name: 'idMission' });
      navigate(`/singleform/stepper/${formId}`);
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
      const res = await sendOtp({ email }).unwrap();
      if (res.success) {
        setOtpSent(true);
        toast.success(res.message);
      }
    } catch (error) {
      console.log('Error sending OTP:', error);
      toast.error(error?.data?.message || 'Failed to send OTP');
    }
  }, [email, sendOtp]);

  const verifyWithOtp = useCallback(async () => {
    try {
      if (!email || !otp) return toast.error('Please enter your email and otp');
      const res = await verifyEmail({ email, otp }).unwrap();
      if (res.success) {
        await dispatch(updateEmailVerified(true));
        await getUserProfile()
          .then(res => {
            if (res?.data?.success) dispatch(userExist(res.data.data));
            else dispatch(userNotExist());
          })
          .catch(() => dispatch(userNotExist()));
        toast.success(res.message);
        // check if company verification already exist then dont navigate to company verification
        if (formData && !formData?.company_lookup_data) {
          navigate(`/verification?formid=${formId}`);
        }
      }
    } catch (error) {
      console.log('Error sending OTP:', error);
      toast.error(error?.data?.message || 'Failed to send OTP');
    }
  }, [dispatch, email, formId, getUserProfile, navigate, otp, formData, verifyEmail]);

  const getQrLinkOnEmailVerified = useCallback(() => {
    if (!qrCode && !webLink && emailVerified) {
      if (formData && formData?.idMission) {
        // return navigate(`/singleform/stepper/${formId}`);
        const formDataOfIdMission = formData?.idMission;
        setIdMissionVerifiedData({
          name: formDataOfIdMission?.name || '',
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
          address2: formDataOfIdMission?.address2 || '',
          signature: formDataOfIdMission?.signature || '',
        });
        setIdMissionVerified(true);
        setOpenRedirectModal(true);
      }
      setGetQrAndWebLinkLoading(true);
      getQrAndWebLink().finally(() => setGetQrAndWebLinkLoading(false));
    }
  }, [emailVerified, formData, getQrAndWebLink, qrCode, webLink]);

  // get qr and session id
  useEffect(() => {
    getQrLinkOnEmailVerified();
  }, [getQrLinkOnEmailVerified]);

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
    socket.on('idMission_processing_started', data => {
      console.log('you start id mission verification', data);
      setIsIdMissionProcessing(true);
    });
    socket.on('idMission_verified', async data => {
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
        name: (formDataOfIdMission?.FullName || formDataOfIdMission?.name || '')?.concat(
          formDataOfIdMission?.Last_Name || ''
        ),
        idNumber: formDataOfIdMission?.ID_Number || '',
        idIssuer: formDataOfIdMission?.ID_State
          ? formDataOfIdMission?.ID_State + formDataOfIdMission?.Issuing_Country
          : formDataOfIdMission?.Issuing_Country || '',
        idType: formDataOfIdMission?.DocumentType || '',
        idExpiryDate: formDataOfIdMission?.Expiration_Date ? formatData(formDataOfIdMission?.Expiration_Date) : '',
        streetAddress:
          formDataOfIdMission?.ParsedAddressStreetNumber + formDataOfIdMission?.ParsedAddressStreetName || '',
        phoneNumber: formDataOfIdMission?.PhoneNumber || '',
        zipCode: formDataOfIdMission?.PostalCode_Extracted || '',
        dateOfBirth: formDataOfIdMission?.Date_of_Birth ? formatData(formDataOfIdMission?.Date_of_Birth) : '',
        country: formDataOfIdMission?.Issuing_Country || '',
        issueDate: formDataOfIdMission?.Issue_Date ? formatData(formDataOfIdMission?.Issue_Date) : '',
        companyTitle: '',
        state: formDataOfIdMission?.ParsedAddressProvince || '',
        city: formDataOfIdMission?.ParsedAddressMunicipality || '',
        address2: address2,
      });
      console.log(idMissionVerified);

      setIdMissionVerified(true);
    });
    socket.on('idMission_failed', async data => {
      // console.log('you start id mission failed', data);
      const action = await dispatch(
        updateFormState({
          data: { idMissionVerification: 'failed', verificationStatus: data?.Form_Status || 'rejected' },
          name: 'idMission',
        })
      );
      unwrapResult(action);
    });

    // Cleanup listener when component unmounts
    return () => {
      socket.off('idMission_processing_started');
      socket.off('idMission_verified');
      socket.off('idMission_failed');
    };
  }, [dispatch, formId, formatData, getUserProfile, idMissionVerified, updateMyProfile, user?._id]);

  // check validations
  useEffect(() => {
    const allFilled = Object.keys(idMissionVerifiedData).every(name => {
      const val = idMissionVerifiedData[name];
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

  // add a keydown event listener to the document
  useEffect(() => {
    const handleEnter = e => {
      if (e.key === 'Enter' && !otp && !otpLoading) sentOtpForEmail();
      if (e.key === 'Enter' && otp && !otpLoading) verifyWithOtp();
    };
    window.addEventListener('keydown', handleEnter);
    return () => window.removeEventListener('keydown', handleEnter);
  }, [otp, otpLoading, sentOtpForEmail, verifyWithOtp]);

  // use effect for getting data from draft and save in redux
  useEffect(() => {
    if (form?.data?._id) {
      getSavedFormData({ formId: form?.data?._id }).then(res => {
        const data = res?.data?.data?.savedData;
        if (data) dispatch(addSavedFormData(data));
      });
    }
  }, [dispatch, form, getSavedFormData]);

  const isCreator = user?._id && user?._id == form?.data?.owner && user?.role !== 'guest';

  // const isCreator = true;
  const {
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setTextColor,
    setLinkColor,
    setBackgroundColor,
    setFrameColor,
    setFontFamily,
    setLogo,
    setButtonTextPrimary,
    setButtonTextSecondary,
  } = useBranding();

  useEffect(() => {
    // console.log('form?.data?.branding', form?.data?.branding);
    if (form?.data?.branding?.colors) {
      const firstFormBranding = form?.data?.branding;
      if (firstFormBranding?.colors) {
        setPrimaryColor(firstFormBranding?.colors?.primary);
        setSecondaryColor(firstFormBranding?.colors?.secondary);
        setAccentColor(firstFormBranding?.colors?.accent);
        setTextColor(firstFormBranding?.colors?.text);
        setLinkColor(firstFormBranding?.colors?.link);
        setBackgroundColor(firstFormBranding?.colors?.background);
        setFrameColor(firstFormBranding?.colors?.frame);
        setFontFamily(firstFormBranding?.fontFamily);
        setButtonTextPrimary(firstFormBranding?.colors?.buttonTextPrimary);
        setButtonTextSecondary(firstFormBranding?.colors?.buttonTextSecondary);
        setLogo(firstFormBranding?.selectedLogo);
      }
    }

    return () => {
      const firstFormBranding = user?.branding;
      setPrimaryColor(firstFormBranding?.colors?.primary);
      setSecondaryColor(firstFormBranding?.colors?.secondary);
      setAccentColor(firstFormBranding?.colors?.accent);
      setTextColor(firstFormBranding?.colors?.text);
      setLinkColor(firstFormBranding?.colors?.link);
      setBackgroundColor(firstFormBranding?.colors?.background);
      setFrameColor(firstFormBranding?.colors?.frame);
      setFontFamily(firstFormBranding?.fontFamily);
      setButtonTextPrimary(firstFormBranding?.colors?.buttonTextPrimary);
      setButtonTextSecondary(firstFormBranding?.colors?.buttonTextSecondary);
      setLogo(firstFormBranding?.selectedLogo);
    };
  }, [
    form?.data?.branding,
    setAccentColor,
    setBackgroundColor,
    setButtonTextPrimary,
    setButtonTextSecondary,
    setFontFamily,
    setFrameColor,
    setLinkColor,
    setLogo,
    setPrimaryColor,
    setSecondaryColor,
    setTextColor,
    user?.branding,
    user?.branding?.colors,
    user?.branding?.fontFamily,
    user?.branding?.selectedLogo,
  ]);

  return (
    <>
      {showSignatureModal && (
        <Modal onClose={() => setShowSignatureModal(false)}>
          <SignatureCustomization
            formRefetch={formRefetch}
            setShowSignatureModal={setShowSignatureModal}
            section={idMissionSection}
          />
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
                    navigate(`/singleform/stepper/${formId}`);
                    setOpenRedirectModal(false);
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
          {!idMissionVerified ? (
            !emailVerified ? (
              <>
                <div className="flex flex-col items-center gap-3">
                  <h1 className="text-textPrimary text-start text-2xl font-semibold">Id Mission Verification</h1>
                  <p className="text-textPrimary mt-10 text-[18px] font-semibold">We need to Verify your email first</p>
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
                      className={`min-w-[130px] py-[8px] ${otpLoading && 'cursor-not-allowed opacity-25'}`}
                      label={'Send OTP'}
                    />
                  </div>
                  {otpSent && (
                    <div className="flex w-full items-center justify-center gap-4">
                      <TextField
                        type="text"
                        placeholder="Enter your OTP"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        className="max-w-[500px]"
                      />
                      <Button
                        onClick={verifyWithOtp}
                        disabled={emailLoading}
                        className={`min-w-[130px] py-[8px] ${emailLoading && 'cursor-not-allowed opacity-25'}`}
                        label={'SubmitOtp'}
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
                <h1 className="text-textPrimary text-start text-2xl font-semibold">Id Mission Verification</h1>
                <p className="text-textPrimary mt-10 text-[18px] font-semibold">We need to Verify your identity</p>
                {qrCode && webLink && (
                  <>
                    <div className="mt-4 flex w-full flex-col items-center gap-4">
                      <img className="h-[230px] w-[230px]" src={`data:image/jpeg;base64,${qrCode}`} alt="qr code " />
                    </div>
                    <div className="mt-4 flex w-full flex-col items-center gap-4">
                      <Button
                        className="max-w-[400px]"
                        label={'Open LInk in New Tab'}
                        onClick={async () => {
                          window.open(webLink, '_blank');
                        }}
                        rightIcon={MdVerifiedUser}
                      />
                    </div>
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
              <h3 className="text-textPrimary text-center text-2xl font-semibold">Id Mission Data</h3>
              <form className="flex flex-wrap gap-4">
                <TextField
                  onChange={() => {}}
                  required
                  value={idMissionVerifiedData?.name}
                  label="Name:*"
                  className={'max-w-[400px]!'}
                />
                <TextField
                  value={user?.email}
                  onChange={() => {}}
                  label="Email Address:*"
                  required
                  className={'max-w-[400px]!'}
                />
                <TextField
                  type="date"
                  value={idMissionVerifiedData?.dateOfBirth}
                  onChange={() => {}}
                  label="Date of Birth:*"
                  required
                  className={'max-w-[400px]!'}
                />
                <TextField
                  type="text"
                  value={idMissionVerifiedData?.idType}
                  onChange={() => {}}
                  label="Id Type:*"
                  required
                  className={'max-w-[400px]!'}
                />{' '}
                <TextField
                  type="text"
                  value={idMissionVerifiedData?.idIssuer}
                  onChange={() => {}}
                  label="Id Issuer:*"
                  required
                  className={'max-w-[400px]!'}
                />{' '}
                <TextField
                  type="date"
                  value={idMissionVerifiedData?.issueDate}
                  onChange={() => {}}
                  label="Issue Date:*"
                  required
                  className={'max-w-[400px]!'}
                />{' '}
                <TextField
                  required
                  onChange={() => {}}
                  value={idMissionVerifiedData?.idNumber}
                  label="Id Number:*"
                  className={'max-w-[400px]!'}
                />{' '}
                <Autocomplete
                  onLoad={onLoad}
                  className="w-full max-w-[400px]"
                  onPlaceChanged={onPlaceChanged}
                  options={{ fields: ['address_components', 'formatted_address', 'geometry', 'place_id'] }}
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
                  type="number"
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
                  label="Phone Number:*"
                  required
                  type="number"
                  className={'max-w-[400px]!'}
                />
                <div className="flex w-full flex-col">
                  <div className="my-4 flex w-full items-center justify-between gap-2">
                    {idMissionSection?.signDisplayText && (
                      <div className="flex items-end gap-3">
                        <div
                          // className="flex flex-1 items-end gap-3"
                          dangerouslySetInnerHTML={{
                            __html: idMissionSection?.signDisplayText,
                          }}
                        />
                      </div>
                    )}
                    <Button label="Customize Signature" onClick={() => setShowSignatureModal(true)} />
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
                  disabled={!isAllRequiredFieldsFilled}
                  label={!isAllRequiredFieldsFilled ? 'Some fields are missing' : 'Submit'}
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
    signFormatedDisplayText: section?.signDisplayText || '',
    signDisplayText: '',
    formatingAiInstruction: '',
  });

  const handleUpdateSectionForSignature = async () => {
    try {
      const res = await updateSection({
        _id: section?._id,
        data: {
          isSignature: signatureData.isSignature,
          isSignDisplayText: signatureData.isSignDisplayText,
          signDisplayText: signatureData.signFormatedDisplayText,
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
          <Button onClick={formateTextWithAi} disabled={isFormating} className="mt-8" label={'Fromat Text'} />
        </div>
        {signatureData?.signFormatedDisplayText && (
          <div
            className="h-full bg-amber-100 p-4"
            dangerouslySetInnerHTML={{ __html: signatureData?.signFormatedDisplayText ?? '' }}
          />
        )}
      </div>

      <div className="flex w-full">
        <Button
          onClick={handleUpdateSectionForSignature}
          disabled={isUpdatingSection}
          className="bg-primary mt-8 w-full text-white"
          label={' Update Signature Data'}
        />
      </div>
    </div>
  );
};
