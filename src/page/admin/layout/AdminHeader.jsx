// import { Button } from '@/components/ui/button';
import { useLogoutMutation } from '@/redux/apis/authApis';
import { userNotExist } from '@/redux/slices/authSlice';
import { LogInIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import { IoChevronForwardOutline, IoLogOutOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom'; // or 'next/link' if using Next.js
import { toast } from 'react-toastify';
import logoApply from '../../../assets/images/logo.png';

import Button from '@/components/shared/small/Button';
import CustomLoading from '@/components/shared/small/CustomLoading';
import { useBranding } from '@/hooks/BrandingContext';
import { HiMenu } from 'react-icons/hi';

function AdminHeader({ setSidebarOpen }) {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { logo } = useBranding();
  const [loadingTime, setLoadingTime] = useState(500);

  const profileOpenHandler = () => setIsProfileOpen(prev => !prev);
  const isGuest = !user?._id || user?.role?.name == 'guest';

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTime(0);
    }, loadingTime);
    return () => clearTimeout(timer);
  }, [loadingTime]);

  if (isGuest && loadingTime) return <CustomLoading />;
  return (
    <div className="flex min-h-20 items-center justify-between rounded-md bg-white p-2 shadow">
      {/* Hamburger Icon (mobile only) */}
      <div className="flex items-center gap-2">
        <button className="rounded-md p-2 hover:bg-gray-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
          <HiMenu size={24} className="text-gray-800" />
        </button>
        {!isGuest ? (
          <h1 className="text-lg font-semibold text-gray-800">
            Welcome {user?.firstName} {user?.lastName}
          </h1>
        ) : (
          <div className="my-4 flex items-center gap-8">
            <img
              src={logo || logoApply}
              alt="Logo"
              className={`object-contain ${'h-[100px] max-h-[200px] w-auto'} }`}
              referrerPolicy="no-referrer"
            />
            {user ? <Button label={'Submission & Draft'} onClick={() => navigate('/submission')} /> : null}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 rounded-bl-[20px] bg-white px-6 py-2">
        {user ? (
          <div className="relative flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <img
                src="https://placehold.co/600x400/white/18bc9c?text=AZ"
                alt="User avatar"
                className="h-9 w-9 rounded-full border border-gray-700 object-cover"
              />
              <div>
                <h6 className="text-sm font-semibold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </h6>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div
              onClick={profileOpenHandler}
              ref={profileRef}
              className={`cursor-pointer transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
            >
              <HiChevronDown size={20} />
            </div>

            {/* Dropdown */}
            <div
              className={`custom-scroll absolute top-[45px] right-0 z-10 w-[150px] rounded-lg border bg-white shadow transition-all duration-300 ${isProfileOpen ? 'opacity-100' : 'invisible opacity-0'}`}
            >
              <Profile />
            </div>
          </div>
        ) : (
          !isGuest && (
            // <Button onClick={() => navigate('/login')} className="bg-primary cursor-pointer text-white">
            //   Login
            //   <LogInIcon />
            // </Button>
            <Button onClick={() => navigate('/login')} rightIcon={LogInIcon} />
          )
        )}
      </div>
    </div>
  );
}

export default AdminHeader;

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logout, { isLoading }] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      const res = await logout().unwrap();
      if (res.success) {
        await dispatch(userNotExist());
        toast.success(res.message);
        return navigate('/login');
      }
    } catch (error) {
      console.log('error while logging out', error);
      toast.error(error?.data?.message || 'Error while logging out');
    }
  };
  return (
    <div className="w-full">
      <Link
        to="/profile"
        className="flex items-center justify-between gap-4 rounded-t-md border-b bg-white px-2 py-2 hover:bg-[#b6feef]"
      >
        <h6 className="text-textPrimary text-xs font-medium">My Profile</h6>
        <IoChevronForwardOutline fontSize={18} className="text-primary" />
      </Link>
      <div
        onClick={logoutHandler}
        className={`flex cursor-pointer items-center justify-between gap-4 rounded-b-md bg-white px-2 py-2 hover:bg-[#b6feef] ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <h6 className={`text-[13px] font-medium`}>Logout</h6>
        <IoLogOutOutline fontSize={18} />
      </div>
    </div>
  );
};
