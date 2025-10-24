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
  const [cookiesWorking, setCookiesWorking] = useState(true);
  const [showCookiePopup, setShowCookiePopup] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const testCookies = () => {
    try {
      document.cookie = 'cookie_test=1; SameSite=Lax';
      const canRead = document.cookie.includes('cookie_test=');
      // delete test cookie
      document.cookie = 'cookie_test=; Max-Age=0';
      return canRead;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const enabled = testCookies();
    if (!enabled) {
      setCookiesWorking(false);
      setShowCookiePopup(true);
    }
  }, []);

  const recheckCookies = () => {
    const enabled = testCookies();
    if (enabled) {
      setCookiesWorking(true);
      setShowCookiePopup(false);
      toast.success('Cookies are now enabled.');
    } else {
      toast.error('Cookies are still blocked or disabled. Please enable them manually in your browser.');
    }
  };

  const loginHandler = async e => {
    e.preventDefault();
    if (!cookiesWorking) {
      toast.error('Please enable cookies before logging in.');
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      if (res.success) {
        dispatch(userExist(res.data));
      }
    } catch (error) {
      console.log('error while logging in', error);
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
            <TextField type="email" label="Email address" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <TextField type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[90%] max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
            <h3 className="mb-3 text-lg font-semibold">Cookies are blocked or disabled</h3>
            <p className="mb-4 text-gray-600">
              Your browser is blocking cookies. Please enable them in settings to continue.
            </p>
            <Button
              label="Check Again"
              onClick={recheckCookies}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
