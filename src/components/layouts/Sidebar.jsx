import { AllRoles, AllUsers, Applicants, Applications } from "@/assets/svgs/icon";
import useBranding from "@/hooks/useBranding";
import { SIDEBAR_ITEMS, hasPermission } from "@/utils/permissions";
import { BrushIcon } from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineLightBulb } from "react-icons/hi";
import { PiStrategyBold } from "react-icons/pi";
import { RiHistoryLine } from "react-icons/ri";
import { Link, useLocation } from "react-router-dom";
import ArrowBackIcon from "@/assets/svgs/ArrowBackIcon";
import { LAYOUT_ROUTES } from "@/constants";

// icon for each sidebar item, keyed by its path
const SIDEBAR_ICONS = {
  [LAYOUT_ROUTES.APPLICATION_FORMS]: <Applications />,
  [LAYOUT_ROUTES.ROLE_MANAGEMENT]: <AllRoles />,
  [LAYOUT_ROUTES.USER_MANAGEMENT]: <AllUsers />,
  [LAYOUT_ROUTES.APPLICATIONS]: <Applicants />,
  [LAYOUT_ROUTES.BRANDING]: <BrushIcon />,
  [LAYOUT_ROUTES.LOOKUP_MANAGEMENT]: <HiOutlineLightBulb />,
  [LAYOUT_ROUTES.STRATEGIES]: <PiStrategyBold />,
  [LAYOUT_ROUTES.EMAIL]: <RiHistoryLine size={20} />,
};

const AdminAside = ({ sidebarOpen, setSidebarOpen }) => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const location = useLocation();
  const { logo, headerBackground, appLogoMaxWidth, appLogoMaxHeight } = useBranding();
  const user = useSelector((state) => state.auth.user);
  const handleNavOpen = () => setIsNavOpen(!isNavOpen);

  const pages = SIDEBAR_ITEMS.filter((item) => hasPermission(user, item.permission));

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div
        data-testid="sidebar"
        className={`bg-backgroundColor fixed top-0 left-0 z-40 h-full rounded-md ${isNavOpen ? "p-4" : "p-8"} transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-[-110%]"} lg:static lg:flex lg:translate-x-0 lg:flex-col lg:justify-between ${isNavOpen ? "w-62.5" : "w-5"} shadow-lg`}
      >
        {/* Toggle Button (desktop only) */}
        <div className="absolute top-[6%] -right-2.75 z-10 hidden cursor-pointer lg:block" onClick={handleNavOpen}>
          <div className={`transition-all duration-500 ${isNavOpen ? "rotate-0" : "rotate-180"}`}>
            <ArrowBackIcon color="var(--primary)" />
          </div>
        </div>

        {/* Logo + Nav */}
        <div className="py-4">
          <div className={`mb-5 flex w-full items-center justify-center xl:mb-12`}>
            {" "}
            <Link to="/application-forms" className="flex min-w-10 items-center justify-center">
              <img
                src={logo || ""}
                alt="logo"
                referrerPolicy="no-referrer"
                className={`rounded-sm object-contain ${isNavOpen ? "h-full w-full" : "h-10 w-10"}`}
                style={{
                  background: headerBackground || "",
                  maxHeight: isNavOpen ? `${appLogoMaxHeight}px` : undefined,
                  maxWidth: isNavOpen ? `${appLogoMaxWidth}px` : undefined,
                }}
              />
            </Link>
          </div>

          <div className={`flex flex-col justify-center gap-2 ${isNavOpen ? "items-start" : "items-center"}`}>
            {pages.map((page) => {
              const isActive = location.pathname === page.path;
              return (
                <Link
                  key={page.path}
                  to={page.path}
                  data-testid={`nav-${page.title.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex w-full min-w-fit items-center rounded-md p-2 ${isNavOpen ? "size-12 gap-2" : "size-12"} ${isActive ? "bg-primary font-semibold text-white" : "hover:text-primary text-[#526581] hover:bg-gray-100"} `}
                >
                  <div
                    className={`${isNavOpen ? "p-6!" : "bg-red-500!"}text-[20px] ${isActive ? "text-white" : "text-[#526581]"}`}
                  >
                    {React.cloneElement(SIDEBAR_ICONS[page.path], {
                      color: isActive ? "#ffffff" : "#526581",
                    })}
                  </div>
                  <p
                    className={`text-sm font-medium capitalize transition-all duration-300 md:text-base ${isActive ? "font-bold! text-white" : "text-[#526581]"} ${isNavOpen ? "ml-2 w-auto opacity-100" : "w-0 overflow-hidden opacity-0"} `}
                  >
                    {page.title}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAside;
