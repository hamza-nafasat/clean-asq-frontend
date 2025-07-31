import { useNavigate, useParams } from 'react-router-dom';
import { useGetIdMissionSessionMutation, useSendOtpMutation, useVerifyEmailMutation } from '@/redux/apis/idMissionApis';
import { updateEmailVerified } from '@/redux/slices/formSlice';
import { useCallback, useEffect, useState } from 'react';
import { MdVerifiedUser } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import TextField from '@/components/shared/small/TextField';
import Button from '@/components/shared/small/Button';
import CustomLoading from '@/components/shared/small/CustomLoading';
import { socket } from '@/main';
import { userExist, userNotExist } from '@/redux/slices/authSlice';
import { useGetMyProfileFirstTimeMutation } from '@/redux/apis/authApis';

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
  const [getQrAndWebLinkLoading, setGetQrAndWebLinkLoading] = useState(false);

  const [getUserProfile] = useGetMyProfileFirstTimeMutation();
  const [getIdMissionSession] = useGetIdMissionSessionMutation();
  const [sendOtp, { isLoading: otpLoading }] = useSendOtpMutation();
  const [verifyEmail, { isLoading: emailLoading }] = useVerifyEmailMutation();

  useEffect(() => {
    // Setup listener ONCE when component mounts
    socket.on('idMission_processing_started', data => {
      console.log('you start id mission verification', data);
    });
    socket.on('idMission_verified', data => {
      console.log('You are verified successfully', data);
      return navigate(`/singleForm/stepper/${formId}`);
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

  return (
    <div className="mt-14 h-full overflow-auto text-center">
      {!emailVerified ? (
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
              isLoading={otpLoading}
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
                isLoading={emailLoading}
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
      )}
    </div>
  );
}
