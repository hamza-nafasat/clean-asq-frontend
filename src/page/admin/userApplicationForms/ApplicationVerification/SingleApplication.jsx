import Button from '@/components/shared/small/Button';
import CustomLoading from '@/components/shared/small/CustomLoading';
import { LoadingWithTimer } from '@/components/shared/small/LoadingWithTimer';
import TextField from '@/components/shared/small/TextField';
import { useBranding } from '@/hooks/BrandingContext';
import { socket } from '@/main';
import { useGetMyProfileFirstTimeMutation, useUpdateMyProfileMutation } from '@/redux/apis/authApis';
import { useGetSavedFormMutation, useGetSingleFormQueryQuery, useSaveFormInDraftMutation } from '@/redux/apis/formApis';
import { useGetIdMissionSessionMutation, useSendOtpMutation, useVerifyEmailMutation } from '@/redux/apis/idMissionApis';
import { userExist, userNotExist } from '@/redux/slices/authSlice';
import { addSavedFormData, updateEmailVerified, updateFormState } from '@/redux/slices/formSlice';
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
  const { data: form } = useGetSingleFormQueryQuery({ _id: formId });
  const [getSavedFormData] = useGetSavedFormMutation();
  const { formData } = useSelector(state => state?.form);
  const [saveFormInDraft] = useSaveFormInDraftMutation();

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
  });

  // console.log('idMissionVerifiedData', idMissionVerifiedData);

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
        const formDataInRedux = { ...formData, [name]: data };
        // console.log('save in progress', formDataInRedux);
        const res = await saveFormInDraft({ formId: form?.data?._id, formData: formDataInRedux }).unwrap();
        if (res.success) toast.success(res.message);
      } catch (error) {
        console.log('error while saving form in draft', error);
        toast.error(error?.data?.message || 'Error while saving form in draft');
      }
    },
    [form?.data?._id, formData, saveFormInDraft]
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

    console.log('all components are', components);
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

  // navigate(`/singleform/stepper/${formId}`);
  // navigate(`/verification?formId=${formId}`);

  const submitIdMissionData = useCallback(
    async e => {
      e.preventDefault();
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
          navigate(`/verification?formId=${formId}`);
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
        return navigate(`/singleform/stepper/${formId}`);
      }
      setGetQrAndWebLinkLoading(true);
      getQrAndWebLink().finally(() => setGetQrAndWebLinkLoading(false));
    }
  }, [emailVerified, formData, formId, getQrAndWebLink, navigate, qrCode, webLink]);

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
      setIdMissionVerifiedData({
        name: formDataOfIdMission?.FullName || ''?.concat(' ', formDataOfIdMission?.Last_Name || ''),
        idNumber: formDataOfIdMission?.ID_Number || '',
        idIssuer: formDataOfIdMission?.ID_State + formDataOfIdMission?.Issuing_Country || '',
        idType: formDataOfIdMission?.DocumentType || '',
        idExpiryDate: formDataOfIdMission?.Expiration_Date ? formatData(formDataOfIdMission?.Expiration_Date) : '',
        streetAddress: formDataOfIdMission?.ParsedAddressStreetName || '',
        phoneNumber: formDataOfIdMission?.PhoneNumber || '',
        zipCode: formDataOfIdMission?.PostalCode_Extracted?.split('-')?.[0] || '',
        dateOfBirth: formDataOfIdMission?.Date_of_Birth ? formatData(formDataOfIdMission?.Date_of_Birth) : '',
        country: formDataOfIdMission?.Issuing_Country || '',
        issueDate: formDataOfIdMission?.Issue_Date ? formatData(formDataOfIdMission?.Issue_Date) : '',
        companyTitle: '',
      });

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
  }, [dispatch, formId, formatData, getUserProfile, updateMyProfile, user?._id]);

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
    getSavedFormData({ formId: form?.data?._id }).then(res => {
      const data = res?.data?.data?.savedData;
      if (data) dispatch(addSavedFormData(data));
    });
  }, [dispatch, form, getSavedFormData]);

  const {
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setTextColor,
    setLinkColor,
    setBackgroundColor,
    setFrameColor,
    setFontFamily,
  } = useBranding();

  const DEFAULT_COLORS = {
    primaryColor: '#066969',
    secondaryColor: '#21ccb0',
    accentColor: '#72ffe7',
    textColor: '#1b1b1b',
    linkColor: '#1025e3',
    backgroundColor: '#f9f9f9',
    frameColor: '#db1313',
    fontFamily: 'Inter',
  };

  useEffect(() => {
    // console.log('form?.data?.branding', form?.data?.branding);
    if (form?.data?.branding?.colors) {
      const firstFormBranding = form?.data?.branding;
      if (firstFormBranding?.colors) {
        setPrimaryColor(firstFormBranding.colors.primary);
        setSecondaryColor(firstFormBranding.colors.secondary);
        setAccentColor(firstFormBranding.colors.accent);
        setTextColor(firstFormBranding.colors.text);
        setLinkColor(firstFormBranding.colors.link);
        setBackgroundColor(firstFormBranding.colors.background);
        setFrameColor(firstFormBranding.colors.frame);
        setFontFamily(firstFormBranding.fontFamily);
        // setLogo(firstFormBranding?.logos?.[0]?.url);
      }
    }

    return () => {
      setPrimaryColor(DEFAULT_COLORS.primaryColor);
      setSecondaryColor(DEFAULT_COLORS.secondaryColor);
      setAccentColor(DEFAULT_COLORS.accentColor);
      setTextColor(DEFAULT_COLORS.textColor);
      setLinkColor(DEFAULT_COLORS.linkColor);
      setBackgroundColor(DEFAULT_COLORS.backgroundColor);
      setFrameColor(DEFAULT_COLORS.frameColor);
      setFontFamily(DEFAULT_COLORS.fontFamily);
    };
  }, [
    DEFAULT_COLORS.accentColor,
    DEFAULT_COLORS.backgroundColor,
    DEFAULT_COLORS.fontFamily,
    DEFAULT_COLORS.frameColor,
    DEFAULT_COLORS.linkColor,
    DEFAULT_COLORS.primaryColor,
    DEFAULT_COLORS.secondaryColor,
    DEFAULT_COLORS.textColor,
    form?.data?.branding,
    setAccentColor,
    setBackgroundColor,
    setFontFamily,
    setFrameColor,
    setLinkColor,
    setPrimaryColor,
    setSecondaryColor,
    setTextColor,
  ]);

  return isIdMissionProcessing ? (
    <LoadingWithTimer setIsProcessing={setIsIdMissionProcessing} />
  ) : (
    <div className="mt-14 h-full overflow-auto text-center">
      {!idMissionVerified ? (
        !emailVerified ? (
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
          </div>
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
                      // navigate(`/singleform/stepper/${formId}`);
                    }}
                    rightIcon={MdVerifiedUser}
                  />
                </div>
              </>
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
              value={idMissionVerifiedData?.phoneNumber}
              onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, phoneNumber: e.target.value })}
              label="Phone Number:*"
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
            <TextField
              value={idMissionVerifiedData?.companyTitle}
              onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, companyTitle: e.target.value })}
              label="Company Title:*"
              required
              className={'max-w-[400px]!'}
            />
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
                onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, streetAddress: e.target.value })}
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
              value={idMissionVerifiedData?.country}
              onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, country: e.target.value })}
              label="Country:*"
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
          </form>
          <div className="flex w-full items-center justify-end">
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
  );
}
