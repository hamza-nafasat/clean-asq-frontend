import { HiMenu } from "react-icons/hi";

import HeaderUserMenu from "@/components/layouts/HeaderUserMenu";

const DEFAULT_HEADER_TEXT_SIZE = 24;

const HeaderDashboard = ({ user, formHeaderText, formHeaderTextSize, setSidebarOpen, userMenuProps = {} }) => (
  <div className="bg-header flex min-h-20 items-center justify-between gap-8 rounded-md p-2 shadow">
    {/* Sidebar toggle, mobile only */}
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Open sidebar"
        className="rounded-md p-2 hover:bg-gray-100 lg:hidden"
        onClick={() => setSidebarOpen?.(true)}
      >
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
          style={{ fontSize: `${formHeaderTextSize || DEFAULT_HEADER_TEXT_SIZE}px` }}
        >
          {formHeaderText}
        </h6>
      )}
    </div>

    {user && (
      <div className="flex items-center gap-4 px-6 py-2">
        <HeaderUserMenu user={user} keepMenuMounted={false} {...userMenuProps} />
      </div>
    )}
  </div>
);

export default HeaderDashboard;
