import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import useBranding from "@/hooks/useBranding";
import usePermission from "@/hooks/usePermission";
import CustomLoading from "@/components/shared/CustomLoading";
import HeaderBranded from "@/components/layouts/HeaderBranded";
import HeaderDashboard from "@/components/layouts/HeaderDashboard";
import { AUTH_ROUTES } from "@/constants";
import { PERMISSIONS, getHomePath } from "@/utils/permissions";

const BRANDED_LOADING_DELAY_MS = 500;

const AdminHeader = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { formHeaderText, formHeaderTextSize } = useSelector((state) => state.form);
  const { logo, headerAlignment, appHeaderPadding, appLogoMaxWidth, appLogoMaxHeight } = useBranding();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loadingTime, setLoadingTime] = useState(BRANDED_LOADING_DELAY_MS);
  const profileRef = useRef(null);
  const hasSidebar = usePermission(PERMISSIONS.ACCESS_SIDEBAR);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingTime(0), loadingTime);
    return () => clearTimeout(timer);
  }, [loadingTime]);

  if (!hasSidebar && loadingTime) return <CustomLoading />;

  const userMenuProps = {
    isProfileOpen,
    setIsProfileOpen,
    profileRef,
    onToggleProfile: () => setIsProfileOpen((prev) => !prev),
  };

  if (hasSidebar) {
    return (
      <HeaderDashboard
        user={user}
        formHeaderText={formHeaderText}
        formHeaderTextSize={formHeaderTextSize}
        setSidebarOpen={setSidebarOpen}
        userMenuProps={userMenuProps}
      />
    );
  }

  return (
    <HeaderBranded
      headerAlignment={headerAlignment}
      formHeaderText={formHeaderText}
      formHeaderTextSize={formHeaderTextSize}
      appHeaderPadding={appHeaderPadding}
      user={user}
      userMenuProps={userMenuProps}
      logoProps={{
        logo,
        maxWidth: appLogoMaxWidth,
        maxHeight: appLogoMaxHeight,
        onClick: () => navigate(user?._id ? getHomePath(user) : AUTH_ROUTES.LOGIN),
      }}
    />
  );
};

export default AdminHeader;
