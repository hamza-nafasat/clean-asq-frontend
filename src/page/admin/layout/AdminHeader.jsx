// import { Button } from '@/components/ui/button';
import { useLogoutMutation } from "@/redux/apis/authApis";
import { userNotExist } from "@/redux/slices/authSlice";
import { useEffect, useRef, useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import { IoChevronForwardOutline, IoLogOutOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom"; // or 'next/link' if using Next.js
import { toast } from "react-toastify";
import { Applications } from "@/assets/svgs/icon";

import CustomLoading from "@/components/shared/small/CustomLoading";
import { useBranding } from "@/hooks/BrandingContext";
import { HiMenu } from "react-icons/hi";
import { UseAIChat } from "@/context/AiChatContext";

// Returns black or white — whichever has higher WCAG contrast ratio against the given hex color.
const contrastColor = (hex = "#000000") => {
  const h = (hex || "").replace("#", "");
  if (h.length < 6) return "#000000";
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(parseInt(h.slice(0, 2), 16));
  const g = toLinear(parseInt(h.slice(2, 4), 16));
  const b = toLinear(parseInt(h.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? "#000000" : "#ffffff";
};

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
      isGuest={isGuest}
      handleLogoClick={handleLogoClick}
      logo={logo}
      setSidebarOpen={setSidebarOpen}
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
  const { headerBackground } = useBranding();
  const textOnHeader = contrastColor(headerBackground);
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
            <div className={`my-4 flex w-[300px] items-center`}>
              <img
                onClick={handleLogoClick}
                src={logo || ""}
                alt="Logo"
                className="w-auto object-contain cursor-pointer"
                style={{ maxWidth: `${appLogoMaxWidth ?? 300}px`, maxHeight: `${appLogoMaxHeight ?? 100}px` }}
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="flex w-[300px] items-center gap-4 px-6 py-2">
              {user && (
                <div className="relative flex items-center gap-2">
                  <div className="hidden items-center gap-2 md:flex">
                    <img
                      src={`https://placehold.co/600x400/white/18bc9c?text=${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                      alt="User avatar"
                      className="h-9 w-9 rounded-full border border-gray-700 object-cover"
                    />

                    <div>
                      <h6 className="text-sm font-semibold" style={{ color: textOnHeader }}>
                        {user?.firstName} {user?.middleName ? user?.middleName + " " : ""} {user?.lastName}
                      </h6>
                      <p className="text-xs opacity-75" style={{ color: textOnHeader }}>
                        {user?.email}
                      </p>
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
                    className={`custom-scroll absolute top-[45px] right-0 z-350 w-[150px] rounded-lg border bg-white shadow transition-all duration-300 ${isProfileOpen ? "opacity-100" : "invisible opacity-0"}`}
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
            <div className="flex w-[300px] items-center gap-4 px-6 py-2">
              {user && (
                <div className="relative flex items-center gap-2">
                  <div className="hidden items-center gap-2 md:flex">
                    <img
                      src={`https://placehold.co/600x400/white/18bc9c?text=${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                      alt="User avatar"
                      className="h-9 w-9 rounded-full border border-gray-700 object-cover"
                    />

                    <div>
                      <h6 className="text-sm font-semibold" style={{ color: textOnHeader }}>
                        {user?.firstName} {user?.middleName ? user?.middleName + " " : ""} {user?.lastName}
                      </h6>
                      <p className="text-xs opacity-75" style={{ color: textOnHeader }}>
                        {user?.email}
                      </p>
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
                    className={`custom-scroll absolute top-[45px] right-0 z-350 w-[150px] rounded-lg border bg-white shadow transition-all duration-300 ${isProfileOpen ? "opacity-100" : "invisible opacity-0"}`}
                  >
                    <Profile isGuest={isGuest} setIsProfileOpen={setIsProfileOpen} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`my-4 flex w-[300px] items-center`}>
              <img
                onClick={handleLogoClick}
                src={logo || ""}
                alt="Logo"
                className="w-auto object-contain cursor-pointer"
                style={{ maxWidth: `${appLogoMaxWidth ?? 300}px`, maxHeight: `${appLogoMaxHeight ?? 100}px` }}
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </>
      ) : (
        // when header target center
        <>
          {/* left side  */}
          <div className={`flex w-[300px] items-center gap-4 rounded-bl-[20px] px-6 py-2`}></div>
          {/* center side  */}
          <div className={`my-4 flex max-w-3xl flex-col items-center`}>
            <img
              onClick={handleLogoClick}
              src={logo || ""}
              alt="Logo"
              className="w-auto object-contain cursor-pointer"
              style={{ maxWidth: `${appLogoMaxWidth ?? 300}px`, maxHeight: `${appLogoMaxHeight ?? 100}px` }}
              referrerPolicy="no-referrer"
            />
            <h6 className="font-semibold text-header-text" style={{ fontSize: `${formHeaderTextSize || 24}px` }}>
              {formHeaderText}
            </h6>
          </div>

          {/* right side  */}
          <div className="mx-6 flex w-[300px] items-center gap-4 p-2">
            {user && (
              <div className="relative flex items-center gap-2">
                <div className="hidden items-center gap-2 md:flex">
                  <img
                    src={`https://placehold.co/600x400/white/18bc9c?text=${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                    alt="User avatar"
                    className="h-9 w-9 rounded-full border border-gray-700 object-cover"
                  />

                  <div>
                    <h6 className="text-sm font-semibold" style={{ color: textOnHeader }}>
                      {user?.firstName} {user?.middleName ? user?.middleName + " " : ""} {user?.lastName}
                    </h6>
                    <p className="text-xs opacity-75" style={{ color: textOnHeader }}>
                      {user?.email}
                    </p>
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
                  className={`custom-scroll absolute top-[45px] right-0 z-350 w-[150px] rounded-lg border bg-white shadow transition-all duration-300 ${isProfileOpen ? "opacity-100" : "invisible opacity-0"}`}
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
}) => {
  const { headerBackground } = useBranding();
  const textOnHeader = contrastColor(headerBackground);
  return (
    <div className="bg-header flex min-h-20 items-center justify-between rounded-md p-2 shadow">
      {/* Hamburger Icon (mobile only) */}
      <div className="flex w-full items-center gap-2">
        <button className="rounded-md p-2 hover:bg-gray-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
          <HiMenu size={24} style={{ color: textOnHeader }} />
        </button>
        <h1 className="text-header-text text-lg font-semibold">
          Welcome {user?.firstName} {user?.lastName}
        </h1>
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
                <h6 className="text-sm font-semibold" style={{ color: textOnHeader }}>
                  {user?.firstName} {user?.middleName ? user?.middleName + " " : ""} {user?.lastName}
                </h6>
                <p className="text-xs opacity-75" style={{ color: textOnHeader }}>
                  {user?.email}
                </p>
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
              className={`custom-scroll absolute top-[45px] right-0 z-350 w-[150px] rounded-lg border bg-white shadow transition-all duration-300 ${isProfileOpen ? "opacity-100" : "invisible opacity-0"}`}
            >
              <Profile isGuest={isGuest} setIsProfileOpen={setIsProfileOpen} />
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
  // const { setIsOpen } = UseAIChat();

  const logoutHandler = async () => {
    try {
      const res = await logout().unwrap();
      if (res.success) {
        // setIsOpen(false);
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
      {isGuest ? (
        <Link
          onClick={() => setIsProfileOpen(false)}
          to="/submission"
          className="flex items-center justify-between gap-4 rounded-t-md border-b bg-white px-2 py-2 hover:bg-[#b6feef]"
        >
          <h6 className="text-textPrimary text-xs font-medium">My Applications</h6>
          <Applications fontSize={18} className="text-primary" />
        </Link>
      ) : (
        <Link
          onClick={() => setIsProfileOpen(false)}
          to="/profile"
          className="flex items-center justify-between gap-4 rounded-t-md border-b bg-white px-2 py-2 hover:bg-[#b6feef]"
        >
          <h6 className="text-headerText text-xs font-medium">My Profile</h6>
          <IoChevronForwardOutline fontSize={18} />
        </Link>
      )}

      <div
        data-testid="logout-button"
        onClick={logoutHandler}
        className={`flex cursor-pointer items-center justify-between gap-4 rounded-b-md bg-white px-2 py-2 hover:bg-[#b6feef] ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <h6 className={`text-[13px] font-medium`}>Logout</h6>
        <IoLogOutOutline fontSize={18} />
      </div>
    </div>
  );
};
