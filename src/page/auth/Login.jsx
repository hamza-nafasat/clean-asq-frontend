import Button from '@/components/shared/small/Button';
import { useLoginMutation } from '@/redux/apis/authApis';
import { userExist } from '@/redux/slices/authSlice';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import TextField from '../../components/shared/small/TextField';

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cookiesEnabled, setCookiesEnabled] = useState(true);
  const [showCookiePopup, setShowCookiePopup] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (navigator.cookieEnabled) {
      console.log(' enabled');
    } else {
      console.log('not enabled');
      setCookiesEnabled(false);
      setShowCookiePopup(true);
    }
  }, []);

  const checkCookiesManually = () => {
    document.cookie = 'testcookie=1';
    const enabled = document.cookie.indexOf('testcookie=') !== -1;
    if (enabled) {
      setCookiesEnabled(true);
      setShowCookiePopup(false);
      toast.success('Cookies are now enabled.');
    } else {
      toast.error('Please enable cookies manually in your browser settings.');
    }
  };

  console.log('cookies enabled', cookiesEnabled);
  const loginHandler = async e => {
    e.preventDefault();
    if (!cookiesEnabled) {
      toast.error('Please enable cookies before logging in.');
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      if (res.success) {
        dispatch(userExist(res.data));
      }
    } catch (error) {
      console.log('error while login', error);
      toast.error(error?.data?.message || 'Error while login');
    }
  };

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
      </div>

      {/* Right Side */}
      <div className="flex w-full max-w-md flex-col justify-center rounded-xl bg-white p-10 shadow-2xl md:w-1/2">
        <h2 className="mb-2 text-2xl font-bold">Sign in to your account</h2>

        <form className="space-y-6" action="#" method="POST">
          <div>
            <TextField type="email" label={'Email address'} value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <TextField
              type="password"
              label={'Password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <Button
            disabled={isLoading}
            onClick={loginHandler}
            type="submit"
            label="Sign in"
            className="hover:!bg-secondary text-secondary !border-secondary w-full !rounded-[20px] !border bg-blue-600 hover:!text-white"
          />
        </form>
      </div>

      {/* Cookie Popup */}
      {showCookiePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[90%] max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
            <h3 className="mb-3 text-lg font-semibold">Cookies are disabled</h3>
            <p className="mb-4 text-gray-600">
              To log in and use this app properly, please enable cookies in your browser settings.
            </p>
            <Button
              label="Enable Cookies"
              onClick={checkCookiesManually}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
