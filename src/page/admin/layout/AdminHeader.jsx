import { useLogoutMutation } from '@/redux/apis/authApis';
import { userNotExist } from '@/redux/slices/authSlice';
import { useRef, useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import { IoChevronForwardOutline, IoLogOutOutline } from 'react-icons/io5';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'; // or 'next/link' if using Next.js
import { toast } from 'react-toastify';

function AdminHeader() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const profileOpenHandler = () => {
    setIsProfileOpen(prev => !prev);
  };
  return (
    <div className="flex h-16 items-center justify-between bg-white p-2 shadow">
      <h1 className="text-2xl font-semibold text-gray-800">Welcome Wahid</h1>
      <div className="flex items-center gap-4 rounded-bl-[20px] bg-white px-6 py-2">
        <div className="relative flex items-center gap-2">
          <img
            src="https://placehold.co/600x400/white/18bc9c?text=AZ"
            alt="User avatar"
            className="h-9 w-9 rounded-full border border-gray-700 object-cover"
          />
          <div>
            <h6 className="text-sm font-semibold text-gray-800">Wahid</h6>
            <p className="text-xs text-gray-600">Example@gamail.com</p>
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
            className={`custom-scroll absolute top-[45px] right-0 z-10 w-[150px] rounded-lg border bg-white shadow transition-all duration-300 ${
              isProfileOpen ? 'opacity-100' : 'invisible opacity-0'
            }`}
          >
            <Profile />
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminHeader;

const Profile = () => {
  const dispatch = useDispatch();
  const [logout, { isLoading }] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      const res = await logout().unwrap();
      if (res.success) {
        dispatch(userNotExist());
        toast.success(res.message);
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
      <div className="flex cursor-pointer items-center justify-between gap-4 rounded-b-md bg-white px-2 py-2 hover:bg-[#b6feef]">
        <h6
          className={`text-[13px] font-medium ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
          onClick={logoutHandler}
        >
          Logout
        </h6>
        <IoLogOutOutline fontSize={18} />
      </div>
    </div>
  );
};
