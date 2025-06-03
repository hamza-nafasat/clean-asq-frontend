import { useState } from 'react';
import TextField from '../../components/shared/small/TextField';
import logo from '../../assets/images/logo.png';
import Button from '@/components/shared/small/Button';

// const features = [
//   'Monitor campaign performance',
//   'Access detailed analytics',
//   'Manage your subscribers',
//   'Launch new giveaways',
// ];

const Login = () => {
  return (
    <div className="montserrat-font flex h-screen w-full flex-col items-center justify-center gap-4 bg-white md:flex-row">
      {/* Left Side */}
      <div className="mt-20 hidden h-full flex-col justify-center md:mt-1 md:flex">
        <h1 className="mb-8 text-4xl font-bold">
          Welcome <span className="text-secondary">Back</span>
        </h1>
        <p className="mb-8 max-w-md text-lg font-semibold text-gray-500">
          Sign in to your account to manage your giveaways, view analytics, and grow your email list.
        </p>
        {/* <ul className="space-y-4">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center font-semibold text-gray-700 text-base">
              <span className="text-blue-600 mr-3">✓</span>
              {feature}
            </li>
          ))}
        </ul> */}
      </div>

      {/* Right Side */}
      <div className="flex w-full max-w-md flex-col justify-center rounded-xl bg-white p-10 shadow-2xl md:w-1/2">
        <h2 className="mb-2 text-2xl font-bold">Sign in to your account</h2>
        <p className="text-md mb-6 font-semibold">
          Or{' '}
          <a href="#" className="text-secondary hover:underline">
            create a new account
          </a>
        </p>
        <form className="space-y-6" action="#" method="POST">
          <div>
            <TextField
              type="email"
              label={'Email address'}
              // containerClassName="bg-blue-50 !border-gray-300"
              // className="!text-gray-500"
            />
          </div>
          <div>
            <TextField
              type="password"
              label={'Password'}
              // containerClassName="bg-blue-50 !border-gray-300"
              // className="!text-gray-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm font-semibold text-gray-500">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
            <a href="#" className="text-secondary text-sm font-semibold hover:underline">
              Forgot password?
            </a>
          </div>
          <Button
            label="Sign in"
            className="hover:!bg-secondary text-secondary !border-secondary w-full !rounded-[20px] !border bg-blue-600 hover:!text-white"
          />
        </form>
        {/* <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-4 text-gray-400">OR</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        <button className="flex items-center justify-center w-full border border-gray-300 rounded-lg py-2 hover:bg-gray-50">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 mr-2" />
          <span>Se connecter avec Google</span>
        </button> */}
        <p className="mt-6 text-center text-sm font-semibold text-gray-600">
          Don't have an account yet?{' '}
          <a href="#" className="text-secondary font-semibold hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
