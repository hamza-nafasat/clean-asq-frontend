import Button from '@/components/shared/small/Button';
import React, { useState, useRef } from 'react';

const OTP = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (/^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < inputsRef.current.length - 1) inputsRef.current[index + 1].focus();
    } else if (value === '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputsRef.current[index - 1].focus();
  };

  const submitHandler = e => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    console.log('OTP Submitted:', enteredOtp);
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden py-12">
      <div className="relative mx-auto w-full max-w-lg rounded-2xl bg-white px-6 pt-10 pb-9 shadow-xl">
        <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="text-3xl font-semibold">
              <p>Email Verification</p>
            </div>
            <div className="flex flex-row text-sm font-medium text-gray-400">
              <p>We have sent a code to your email ba**@dipainhouse.com</p>
            </div>
          </div>

          <form onSubmit={submitHandler}>
            <div className="flex flex-col space-y-16">
              <div className="mx-auto flex w-full max-w-xs flex-row items-center justify-between">
                {otp.map((digit, index) => (
                  <div className="h-16 w-16" key={index}>
                    <input
                      ref={el => (inputsRef.current[index] = el)}
                      className="ring-light h-full w-full rounded-xl border border-gray-200 bg-white px-5 text-center text-lg outline-none focus:bg-gray-50 focus:ring-1"
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleChange(e.target.value, index)}
                      onKeyDown={e => handleKeyDown(e, index)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col space-y-5">
                <Button className="py-4" label={'  Verify Account'} />

                <div className="flex justify-center space-x-1 text-sm font-medium text-gray-500">
                  <p>Didn't receive code?</p>
                  <button type="button" className="cursor-pointer text-blue-600">
                    Resend
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTP;
