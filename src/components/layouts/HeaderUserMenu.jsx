import { HiChevronDown } from "react-icons/hi";

import HeaderProfileMenu from "@/components/layouts/HeaderProfileMenu";

const AVATAR_BASE_URL = "https://placehold.co/600x400/white/18bc9c?text=";

const HeaderUserMenu = ({
  user = {},
  isProfileOpen = false,
  setIsProfileOpen,
  profileRef,
  onToggleProfile,
  keepMenuMounted = true,
}) => (
  <div className="relative flex items-center gap-2">
    <button
      type="button"
      ref={profileRef}
      onClick={onToggleProfile}
      aria-haspopup="menu"
      aria-expanded={isProfileOpen}
      className="flex cursor-pointer items-center gap-2 text-left"
    >
      <span className="hidden items-center gap-2 md:flex">
        <img
          src={`${AVATAR_BASE_URL}${user?.firstName?.[0]}${user?.lastName?.[0]}`}
          alt=""
          className="h-9 w-9 rounded-full border border-gray-700 object-cover"
        />
        <span>
          <span className="block text-sm font-semibold text-header-text">
            {user?.firstName} {user?.middleName ? user?.middleName + " " : ""} {user?.lastName}
          </span>
          <span className="block text-xs opacity-75 text-header-text">{user?.email}</span>
        </span>
      </span>
      <HiChevronDown
        size={20}
        className={`shrink-0 text-header-text transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
      />
    </button>

    {/* Dropdown */}
    <div
      className={`custom-scroll absolute top-11.25 right-0 z-350 w-37.5 rounded-lg border bg-white shadow transition-all duration-300 ${isProfileOpen ? "opacity-100" : "invisible opacity-0"}`}
    >
      {(keepMenuMounted || isProfileOpen) && <HeaderProfileMenu setIsProfileOpen={setIsProfileOpen} />}
    </div>
  </div>
);

export default HeaderUserMenu;
