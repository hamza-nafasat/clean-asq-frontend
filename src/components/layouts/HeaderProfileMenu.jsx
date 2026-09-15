import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { IoLogOutOutline, IoPersonOutline } from "react-icons/io5";
import { toast } from "react-toastify";

import { useLogoutMutation } from "@/redux/apis/auth.apis";
import { userNotExist } from "@/redux/slices/auth.slice";
import useAiChat from "@/hooks/useAiChat";
import { Applications } from "@/assets/svgs/icon";
import { LAYOUT_ROUTES } from "@/constants";

const HeaderProfileMenu = ({ isGuest = false, setIsProfileOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logout, { isLoading }] = useLogoutMutation();
  const { setIsOpen } = useAiChat();
  const loadingClasses = isLoading ? "cursor-not-allowed opacity-50" : "";

  const handleLogout = async () => {
    try {
      const res = await logout().unwrap();
      if (res.success) {
        setIsOpen(false);
        await dispatch(userNotExist());
        toast.success(res.message);
        return navigate(LAYOUT_ROUTES.LOGIN);
      }
      setIsProfileOpen?.(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error?.data?.message || "Error while logging out");
    }
  };

  return (
    <div className="w-full">
      {isGuest && (
        <Link
          onClick={() => setIsProfileOpen?.(false)}
          to={LAYOUT_ROUTES.MY_APPLICATIONS}
          className="flex items-center justify-between gap-4 rounded-t-md border bg-white px-2 py-2 hover:bg-[#b6feef]"
        >
          <h6 className="text-textPrimary text-xs font-medium">My Applications</h6>
          <Applications fontSize={18} className="text-primary" />
        </Link>
      )}

      <div
        data-testid="my-profile-button"
        onClick={() => {
          setIsProfileOpen?.(false);
          navigate(LAYOUT_ROUTES.MY_PROFILE);
        }}
        className={`flex cursor-pointer items-center justify-between gap-4 rounded-b-md bg-white px-2 py-2 hover:bg-[#b6feef] ${loadingClasses}`}
      >
        <h6 className="text-[13px] font-medium">My Profile</h6>
        <IoPersonOutline fontSize={18} />
      </div>

      <div
        data-testid="logout-button"
        onClick={handleLogout}
        className={`flex cursor-pointer items-center justify-between gap-4 rounded-b-md bg-white px-2 py-2 hover:bg-[#b6feef] ${loadingClasses}`}
      >
        <h6 className="text-[13px] font-medium">Logout</h6>
        <IoLogOutOutline fontSize={18} />
      </div>
    </div>
  );
};

export default HeaderProfileMenu;
