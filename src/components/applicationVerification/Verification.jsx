import { useGetIdMissionSessionMutation, useSendOtpMutation, useVerifyEmailMutation } from '@/redux/apis/idMissionApis';
import { updateEmailVerified } from '@/redux/slices/formSlice';
import { useCallback, useState } from 'react';
import { MdVerifiedUser } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Button from '../shared/small/Button';
import TextField from '../shared/small/TextField';

function Verification({ name, handleNext, handlePrevious, currentStep, totalSteps, handleSubmit }) {
  const dispatch = useDispatch();
  const { emailVerified } = useSelector(state => state.form);
  const [webLink, setWebLink] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [getIdMissionSession] = useGetIdMissionSessionMutation();
  const [sendOtp, { isLoading: otpLoading }] = useSendOtpMutation();
  const [verifyEmail, { isLoading: emailLoading }] = useVerifyEmailMutation();

  const getSessionId = useCallback(async () => {
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
        await getSessionId();
        dispatch(updateEmailVerified(true));
        toast.success(res.message);
      }
    } catch (error) {
      console.log('Error sending OTP:', error);
      toast.error(error?.data?.message || 'Failed to send OTP');
    }
  }, [dispatch, email, getSessionId, otp, verifyEmail]);

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

          {/* {!qrCode && !webLink && ( */}
          {/* <div className="mt-8">
            <Button
              onClick={getSessionId}
              disabled={isLoading}
              label={'Verify ID'}
              cnRight={'text-white'}
              rightIcon={PiUserFocusFill}
            />
          </div> */}
          {/* )} */}
        </div>
      )}

      {/* <div className="flex justify-end gap-4 p-4">
        <div className="mt-8 flex justify-end gap-5">
          {currentStep > 0 && <Button variant="secondary" label={'Previous'} onClick={handlePrevious} />}
          {currentStep < totalSteps - 1 ? (
            <Button label={'Next'} onClick={handleNext} />
          ) : (
            <Button label={'Submit'} onClick={handleSubmit} />
          )}
        </div>
      </div> */}
    </div>
  );
}

export default Verification;
