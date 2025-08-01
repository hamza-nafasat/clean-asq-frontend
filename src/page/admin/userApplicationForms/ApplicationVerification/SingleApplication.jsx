import { useNavigate, useParams } from 'react-router-dom';
import { useGetIdMissionSessionMutation, useSendOtpMutation, useVerifyEmailMutation } from '@/redux/apis/idMissionApis';
import { updateEmailVerified, updateFormState } from '@/redux/slices/formSlice';
import { useCallback, useEffect, useState } from 'react';
import { MdOutlineVerifiedUser, MdVerifiedUser } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import TextField from '@/components/shared/small/TextField';
import Button from '@/components/shared/small/Button';
import CustomLoading from '@/components/shared/small/CustomLoading';
import { socket } from '@/main';
import { userExist, userNotExist } from '@/redux/slices/authSlice';
import { useGetMyProfileFirstTimeMutation } from '@/redux/apis/authApis';
import { LoadingWithTimer } from '@/components/shared/small/LoadingWithTimer';
import { Autocomplete } from '@react-google-maps/api';
import { unwrapResult } from '@reduxjs/toolkit';

export default function SingleApplication() {
  const navigate = useNavigate();
  const params = useParams();
  const formId = params.formId;
  const dispatch = useDispatch();
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

  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [getIdMissionSession] = useGetIdMissionSessionMutation();
  const [sendOtp, { isLoading: otpLoading }] = useSendOtpMutation();
  const [verifyEmail, { isLoading: emailLoading }] = useVerifyEmailMutation();
  const [isAllRequiredFieldsFilled, setIsAllRequiredFieldsFilled] = useState(false);
  const [idMissionVerifiedData, setIdMissionVerifiedData] = useState({
    name: 'sdfsd',
    idNumber: 'sdfsdf',
    address: '',
    phoneNumber: '',
    companyTitle: '',
    issueDate: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  console.log('idMissionVerifiedData', idMissionVerifiedData);

  const onLoad = useCallback(autoC => {
    autoC.setFields(['address_components', 'formatted_address', 'geometry', 'place_id']);
    setAutocomplete(autoC);
  }, []);

  const onPlaceChanged = () => {
    const place = autocomplete.getPlace();
    fillBasicComponents(place.address_components || [], place.formatted_address);
    if (!place.address_components.some(c => c.types.includes('postal_code'))) {
      const { lat, lng } = place.geometry.location;
      reverseGeocode(lat(), lng());
    }
  };
  function fillBasicComponents(components, formatted_address) {
    const getComp = type => {
      const c = components.find(c => c.types.includes(type));
      return c ? c.long_name : '';
    };
    setIdMissionVerifiedData(prev => ({
      ...prev,
      address: formatted_address || '',
      city: getComp('locality'),
      state: getComp('administrative_area_level_1'),
      country: getComp('country'),
      zipCode: getComp('postal_code'), // may be empty
    }));
  }

  function reverseGeocode(lat, lng) {
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
          zipCode: postal.short_name,
        }));
      }
    });
  }

  const submitIdMissionData = useCallback(
    async e => {
      e.preventDefault();
      const action = await dispatch(updateFormState({ data: idMissionVerifiedData, name: 'IdMission' }));
      unwrapResult(action);
      navigate(`/singleForm/stepper/${formId}`);
    },
    [dispatch, formId, idMissionVerifiedData, navigate]
  );

  const getQrAndWebLink = useCallback(async () => {
    try {
      const res = await getIdMissionSession().unwrap();
      console.log('session id is ', res);
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
        // await getQrAndWebLink();
        await dispatch(updateEmailVerified(true));
        await getUserProfile()
          .then(res => {
            if (res?.data?.success) dispatch(userExist(res.data.data));
            else dispatch(userNotExist());
          })
          .catch(() => dispatch(userNotExist()));
        toast.success(res.message);
      }
    } catch (error) {
      console.log('Error sending OTP:', error);
      toast.error(error?.data?.message || 'Failed to send OTP');
    }
  }, [dispatch, email, getUserProfile, otp, verifyEmail]);

  const getQrLinkOnEmailVerified = useCallback(() => {
    if (!qrCode && !webLink && emailVerified) {
      setGetQrAndWebLinkLoading(true);
      getQrAndWebLink().finally(() => setGetQrAndWebLinkLoading(false));
    }
  }, [emailVerified, getQrAndWebLink, qrCode, webLink]);

  useEffect(() => {
    getQrLinkOnEmailVerified();
  }, [getQrLinkOnEmailVerified]);

  useEffect(() => {
    getUserProfile()
      .then(res => {
        if (res?.data?.success) dispatch(userExist(res.data.data));
        else dispatch(userNotExist());
      })
      .catch(() => dispatch(userNotExist()));
  }, [getUserProfile, dispatch]);

  useEffect(() => {
    // Setup listener ONCE when component mounts
    socket.on('idMission_processing_started', data => {
      console.log('you start id mission verification', data);
      setIsIdMissionProcessing(true);
    });
    socket.on('idMission_verified', data => {
      const raw = data?.Form_Data?.Issue_Date;
      let isoDate = '';
      if (raw) {
        const [d, m, y] = raw.split('/');
        isoDate = `${y}-${m}-${d}`;
      }

      console.log('You are verified successfully', data);
      setIsIdMissionProcessing(false);
      setIdMissionVerifiedData({
        name: data?.Form_Data?.FullName || '',
        idNumber: data?.Form_Data?.ID_Number || '',
        address: data?.Form_Data?.Address || '',
        phoneNumber: data?.Form_Data?.PhoneNumber || '',
        issueDate: isoDate || '',
        companyTitle: '',
      });
      setIdMissionVerified(true);
      // return navigate(`/singleForm/stepper/${formId}`);
    });
    socket.on('idMission_failed', data => {
      console.log('you start id mission failed', data);
    });

    // Cleanup listener when component unmounts
    return () => {
      socket.off('idMission_processing_started');
      socket.off('idMission_verified');
      socket.off('idMission_failed');
    };
  }, [formId, navigate]);

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
                    onClick={() => {
                      window.open(webLink, '_blank');
                    }}
                    rightIcon={MdVerifiedUser}
                  />
                </div>
              </>
            )}
            {/* <div className="flex w-full items-center justify-end">
            <Button
              onClick={() => navigate(`/singleForm/stepper/${formId}`)}
              className="!text-base"
              label={'Continue Application'}
            />
          </div> */}
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
              label="Name"
              className={'max-w-[500px]!'}
            />
            <TextField
              required
              onChange={() => {}}
              value={idMissionVerifiedData?.idNumber}
              label="Id Number"
              className={'max-w-[500px]!'}
            />
            <TextField
              value={idMissionVerifiedData?.phoneNumber}
              onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, phoneNumber: e.target.value })}
              label="Phone Number"
              required
              className={'max-w-[500px]!'}
            />
            <TextField
              value={idMissionVerifiedData?.companyTitle}
              onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, companyTitle: e.target.value })}
              label="Company Title"
              required
              className={'max-w-[500px]!'}
            />
            <TextField
              type="date"
              value={idMissionVerifiedData?.issueDate}
              onChange={() => {}}
              label="Issue Date"
              required
              className={'max-w-[500px]!'}
            />
            <Autocomplete
              onLoad={onLoad}
              className="w-full max-w-[500px]"
              onPlaceChanged={onPlaceChanged}
              options={{ fields: ['address_components', 'formatted_address', 'geometry', 'place_id'] }}
            >
              <TextField
                type="text"
                required
                value={idMissionVerifiedData?.address}
                onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, address: e.target.value })}
                label="Address"
                className={'max-w-[500px]!'}
              />
            </Autocomplete>

            <TextField
              type="text"
              required
              value={idMissionVerifiedData?.city}
              onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, city: e.target.value })}
              label="City"
              className={'max-w-[500px]!'}
            />

            <TextField
              type="text"
              required
              value={idMissionVerifiedData?.country}
              onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, country: e.target.value })}
              label="Country"
              className={'max-w-[500px]!'}
            />

            <TextField
              type="text"
              required
              value={idMissionVerifiedData?.zipCode}
              onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, zipCode: e.target.value })}
              label="Zip Code"
              className={'max-w-[500px]!'}
            />

            <TextField
              type="text"
              required
              value={idMissionVerifiedData?.state}
              onChange={e => setIdMissionVerifiedData({ ...idMissionVerifiedData, state: e.target.value })}
              label="State"
              className={'max-w-[500px]!'}
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
