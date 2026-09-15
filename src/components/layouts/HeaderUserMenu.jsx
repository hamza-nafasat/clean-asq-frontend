import { HiChevronDown } from "react-icons/hi";

import HeaderProfileMenu from "@/components/layouts/HeaderProfileMenu";

const AVATAR_BASE_URL = "https://placehold.co/600x400/white/18bc9c?text=";

const HeaderUserMenu = ({
  user = {},
  isGuest = false,
  isProfileOpen = false,
  setIsProfileOpen,
  profileRef,
  onToggleProfile,
  keepMenuMounted = true,
}) => (
  <div className="relative flex items-center gap-2">
    <div className="hidden items-center gap-2 md:flex">
      <img
        src={`${AVATAR_BASE_URL}${user?.firstName?.[0]}${user?.lastName?.[0]}`}
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
      onClick={onToggleProfile}
      ref={profileRef}
      className={`cursor-pointer transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
    >
      <HiChevronDown size={20} />
    </div>

    {/* Dropdown */}
    <div
      className={`custom-scroll absolute top-11.25 right-0 z-350 w-37.5 rounded-lg border bg-white shadow transition-all duration-300 ${isProfileOpen ? "opacity-100" : "invisible opacity-0"}`}
    >
      {(keepMenuMounted || isProfileOpen) && <HeaderProfileMenu isGuest={isGuest} setIsProfileOpen={setIsProfileOpen} />}
    </div>
  </div>
);

export default HeaderUserMenu;
