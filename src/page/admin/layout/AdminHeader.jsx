// import { Button } from '@/components/ui/button';
import { useLogoutMutation } from "@/redux/apis/authApis";
import { userNotExist } from "@/redux/slices/authSlice";
import { useEffect, useRef, useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import { IoChevronForwardOutline, IoLockClosedOutline, IoLogOutOutline, IoPersonOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom"; // or 'next/link' if using Next.js
import { toast } from "react-toastify";
import { Applications } from "@/assets/svgs/icon";

import CustomLoading from "@/components/shared/small/CustomLoading";
import { useBranding } from "@/hooks/BrandingContext";
import { HiMenu } from "react-icons/hi";
import { UseAIChat } from "@/context/AiChatContext";

function AdminHeader({ setSidebarOpen }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { formHeaderText, formHeaderTextSize } = useSelector((state) => state.form);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { logo, headerAlignment, appHeaderPadding, appLogoMaxWidth, appLogoMaxHeight } = useBranding();
  const [loadingTime, setLoadingTime] = useState(500);

  const profileOpenHandler = () => setIsProfileOpen((prev) => !prev);
  const isGuest = !user?._id || user?.role?.name == "guest";
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTime(0);
    }, loadingTime);
    return () => clearTimeout(timer);
  }, [loadingTime]);

  const handleLogoClick = () => {
    if (isGuest) {
      navigate("/submission");
    } else {
      navigate("/");
    }
  };
  if (isGuest && loadingTime) return <CustomLoading />;
  return isGuest ? (
    <GuestHeader
      formHeaderText={formHeaderText}
      headerAlignment={headerAlignment}
      user={user}
      profileOpenHandler={profileOpenHandler}
      profileRef={profileRef}
      isProfileOpen={isProfileOpen}
      setIsProfileOpen={setIsProfileOpen}
      isGuest={isGuest}
      handleLogoClick={handleLogoClick}
      logo={logo}
      appHeaderPadding={appHeaderPadding}
      formHeaderTextSize={formHeaderTextSize}
      appLogoMaxWidth={appLogoMaxWidth}
      appLogoMaxHeight={appLogoMaxHeight}
    />
  ) : (
    <UserHeader
      formHeaderText={formHeaderText}
      headerAlignment={headerAlignment}
      user={user}
      profileOpenHandler={profileOpenHandler}
      profileRef={profileRef}
      isProfileOpen={isProfileOpen}
      setIsProfileOpen={setIsProfileOpen}
      isGuest={isGuest}
      handleLogoClick={handleLogoClick}
      logo={logo}
      setSidebarOpen={setSidebarOpen}
      formHeaderTextSize={formHeaderTextSize}
    />
  );
}

export default AdminHeader;

const GuestHeader = ({
  formHeaderText,
  headerAlignment,
  user,
  profileOpenHandler,
  profileRef,
  isProfileOpen,
  isGuest,
  setIsProfileOpen,
  handleLogoClick,
  logo,
  appHeaderPadding,
  formHeaderTextSize,
  appLogoMaxWidth,
  appLogoMaxHeight,
}) => {
  return (
    <div
      className="bg-header flex min-h-20 items-center justify-between gap-8 rounded-md shadow"
      style={{ padding: `${appHeaderPadding ?? 8}px 8px` }}
    >
      {/* when not header target center  */}
      {headerAlignment !== "center" ? (
        <>
          {/* left side  */}
          {headerAlignment == "left" ? (
            <div className={`my-4 flex w-75 items-center`}>
              {logo && (
                <img
                  onClick={handleLogoClick}
                  src={logo || ""}
                  alt="Logo"
                  className="w-auto object-contain cursor-pointer"
                  style={{ maxWidth: `${appLogoMaxWidth ?? 300}px`, maxHeight: `${appLogoMaxHeight ?? 100}px` }}
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          ) : (
            <div className="flex w-75 items-center gap-4 px-6 py-2">
              {user && (
                <div className="relative flex items-center gap-2">
                  <div className="hidden items-center gap-2 md:flex">
                    <img
                      src={`https://placehold.co/600x400/white/18bc9c?text=${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                      alt="User avatar"
                      className="h-9 w-9 rounded-full border border-gray-700 object-cover"
                    />

                    <div>
                      <h6 className="text-sm font-semibold text-header-text">
                        {user?.firstName} {user?.middleName ? user?.middleName + " " : ""} {user?.lastName}
                      </h6>
                      <p className="text-xs opacity-75 text-header-text">{user?.email}</p>
                    </div>
                  </div>

                  <div
                    onClick={profileOpenHandler}
                    ref={profileRef}
                    className={`cursor-pointer transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
                  >
                    <HiChevronDown size={20} />
                  </div>

                  {/* Dropdown */}
                  <div
                    className={`custom-scroll absolute top-11.25 right-0 z-350 w-37.5 rounded-lg border bg-white shadow transition-all duration-300 ${isProfileOpen ? "opacity-100" : "invisible opacity-0"}`}
                  >
                    <Profile isGuest={isGuest} setIsProfileOpen={setIsProfileOpen} />
                  </div>
                </div>
              )}
            </div>
          )}
          {/* center side  */}
          {formHeaderText && (
            <h6
              className="text-header-text max-w-3xl font-semibold"
              style={{ fontSize: `${formHeaderTextSize || 24}px` }}
            >
              {formHeaderText}
            </h6>
          )}

          {/* right side  */}
          {headerAlignment == "left" ? (
            <div className="flex w-75 items-center gap-4 px-6 py-2">
              {user && (
                <div className="relative flex items-center gap-2">
                  <div className="hidden items-center gap-2 md:flex">
                    <img
                      src={`https://placehold.co/600x400/white/18bc9c?text=${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                      alt="User avatar"
                      className="h-9 w-9 rounded-full border border-gray-700 object-cover"
                    />

                    <div>
                      <h6 className="text-sm font-semibold text-header-text">
                        {user?.firstName} {user?.middleName ? user?.middleName + " " : ""} {user?.lastName}
                      </h6>
                      <p className="text-xs opacity-75 text-header-text">{user?.email}</p>
                    </div>
                  </div>

                  <div
                    onClick={profileOpenHandler}
                    ref={profileRef}
                    className={`cursor-pointer transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
                  >
                    <HiChevronDown size={20} />
                  </div>

                  {/* Dropdown */}
                  <div
                    className={`custom-scroll absolute top-11.25 right-0 z-350 w-37.5 rounded-lg border bg-white shadow transition-all duration-300 ${isProfileOpen ? "opacity-100" : "invisible opacity-0"}`}
                  >
                    <Profile isGuest={isGuest} setIsProfileOpen={setIsProfileOpen} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`my-4 flex w-75 items-center`}>
              {logo && (
                <img
                  onClick={handleLogoClick}
                  src={logo || ""}
                  alt="Logo"
                  className="w-auto object-contain cursor-pointer"
                  style={{ maxWidth: `${appLogoMaxWidth ?? 300}px`, maxHeight: `${appLogoMaxHeight ?? 100}px` }}
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          )}
        </>
      ) : (
        // when header target center
        <>
          {/* left side  */}
          <div className={`flex w-75 items-center gap-4 rounded-bl-[20px] px-6 py-2`}></div>
          {/* center side  */}
          <div className={`my-4 flex max-w-3xl flex-col items-center`}>
            {logo && (
              <img
                onClick={handleLogoClick}
                src={logo || ""}
                alt="Logo"
                className="w-auto object-contain cursor-pointer"
                style={{ maxWidth: `${appLogoMaxWidth ?? 300}px`, maxHeight: `${appLogoMaxHeight ?? 100}px` }}
                referrerPolicy="no-referrer"
              />
            )}
            <h6 className="font-semibold text-header-text" style={{ fontSize: `${formHeaderTextSize || 24}px` }}>
              {formHeaderText}
            </h6>
          </div>

          {/* right side  */}
          <div className="mx-6 flex w-75 items-center gap-4 p-2">
            {user && (
              <div className="relative flex items-center gap-2">
                <div className="hidden items-center gap-2 md:flex">
                  <img
                    src={`https://placehold.co/600x400/white/18bc9c?text=${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                    alt="User avatar"
                    className="h-9 w-9 rounded-full border border-gray-700 object-cover"
                  />

                  <div>
                    <h6 className="text-sm font-semibold text-header-text">
                      {user?.firstName} {user?.middleName ? user?.middleName + " " : ""} {user?.lastName}
                    </h6>
                    <p className="text-xs opacity-75 text-header-text">{user?.email}</p>
                  </div>
                </div>

                <div
                  onClick={profileOpenHandler}
                  ref={profileRef}
                  className={`cursor-pointer transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
                >
                  <HiChevronDown size={20} />
                </div>

                {/* Dropdown */}
                <div
                  className={`custom-scroll absolute top-11.25 right-0 z-350 w-37.5 rounded-lg border bg-white shadow transition-all duration-300 ${isProfileOpen ? "opacity-100" : "invisible opacity-0"}`}
                >
                  <Profile isGuest={isGuest} setIsProfileOpen={setIsProfileOpen} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const UserHeader = ({
  user,
  profileOpenHandler,
  profileRef,
  isProfileOpen,
  isGuest,
  setIsProfileOpen,
  setSidebarOpen,
  formHeaderText,
  formHeaderTextSize,
}) => {
  return (
    <div className="bg-header flex min-h-20 items-center justify-between gap-8 rounded-md p-2 shadow">
      {/* Hamburger Icon (mobile only) */}
      <div className="flex items-center gap-2">
        <button className="rounded-md p-2 hover:bg-gray-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
          <HiMenu className="text-header-text" size={24} />
        </button>
        <h1 className="text-header-text text-lg font-semibold">
          Welcome {user?.firstName} {user?.lastName}
        </h1>
      </div>

      <div className="flex">
        {formHeaderText && (
          <h6
            className="text-header-text max-w-3xl font-semibold"
            style={{ fontSize: `${formHeaderTextSize || 24}px` }}
          >
            {formHeaderText}
          </h6>
        )}
      </div>

      {user && (
        <div className="flex items-center gap-4 px-6 py-2">
          <div className="relative flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <img
                src={`https://placehold.co/600x400/white/18bc9c?text=${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                alt="User avatar"
                className="h-9 w-9 rounded-full border border-gray-700 object-cover"
              />

              <div>
                <h6 className="text-sm font-semibold text-header-text">
                  {user?.firstName} {user?.middleName ? user?.middleName + " " : ""} {user?.lastName}
                </h6>
                <p className="text-xs opacity-75 text-header-text">{user?.email}</p>
              </div>
            </div>

            <div
              onClick={profileOpenHandler}
              ref={profileRef}
              className={`cursor-pointer transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
            >
              <HiChevronDown size={20} />
            </div>

            {/* Dropdown */}
            <div
              className={`custom-scroll absolute top-11.25 right-0 z-350 w-37.5 rounded-lg border bg-white shadow transition-all duration-300 ${isProfileOpen ? "opacity-100" : "invisible opacity-0"}`}
            >
              {isProfileOpen && <Profile isGuest={isGuest} setIsProfileOpen={setIsProfileOpen} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Profile = ({ isGuest, setIsProfileOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logout, { isLoading }] = useLogoutMutation();
  const { setIsOpen } = UseAIChat();

  const logoutHandler = async () => {
    try {
      const res = await logout().unwrap();
      if (res.success) {
        setIsOpen(false);
        await dispatch(userNotExist());
        toast.success(res.message);
        return navigate("/login");
      }
      setIsProfileOpen(false);
    } catch (error) {
      console.log("error while logging out", error);
      toast.error(error?.data?.message || "Error while logging out");
    }
  };
  return (
    <div className="w-full">
      {isGuest && (
        <Link
          onClick={() => setIsProfileOpen?.(false)}
          to="/submission"
          className="flex items-center justify-between gap-4 rounded-t-md border bg-white px-2 py-2 hover:bg-[#b6feef]"
        >
          <h6 className="text-textPrimary text-xs font-medium">My Applications</h6>
          <Applications fontSize={18} className="text-primary" />
        </Link>
      )}

      {/* {!isGuest && (
        <Link
          data-testid="my-profile-button"
          to="/my-profile"
          onClick={() => setIsProfileOpen?.(false)}
          className="flex cursor-pointer items-center justify-between gap-4 rounded-t-md bg-white px-2 py-2 hover:bg-[#b6feef]"
        >
          <h6 className="text-[13px] font-medium">My Profile</h6>
          <IoPersonOutline fontSize={18} />
        </Link>
      )} */}

      <div
        data-testid="my-profile-button"
        onClick={() => {
          setIsProfileOpen?.(false);
          navigate("/my-profile");
        }}
        className={`flex cursor-pointer items-center justify-between gap-4 rounded-b-md bg-white px-2 py-2 hover:bg-[#b6feef] ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <h6 className="text-[13px] font-medium">My Profile</h6>
        <IoPersonOutline fontSize={18} />
      </div>

      <div
        data-testid="logout-button"
        onClick={logoutHandler}
        className={`flex cursor-pointer items-center justify-between gap-4 rounded-b-md bg-white px-2 py-2 hover:bg-[#b6feef] ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <h6 className="text-[13px] font-medium">Logout</h6>
        <IoLogOutOutline fontSize={18} />
      </div>
    </div>
  );
};
