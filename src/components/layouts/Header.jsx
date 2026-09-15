import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import useBranding from "@/hooks/useBranding";
import CustomLoading from "@/components/shared/CustomLoading";
import HeaderBranded from "@/components/layouts/HeaderBranded";
import HeaderDashboard from "@/components/layouts/HeaderDashboard";
import { LAYOUT_ROUTES } from "@/constants";
import { isGuestOrSignedOut } from "@/utils/permissions";

const GUEST_LOADING_DELAY_MS = 500;

const AdminHeader = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { formHeaderText, formHeaderTextSize } = useSelector((state) => state.form);
  const { logo, headerAlignment, appHeaderPadding, appLogoMaxWidth, appLogoMaxHeight } = useBranding();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loadingTime, setLoadingTime] = useState(GUEST_LOADING_DELAY_MS);
  const profileRef = useRef(null);
  const isGuest = isGuestOrSignedOut(user);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingTime(0), loadingTime);
    return () => clearTimeout(timer);
  }, [loadingTime]);

  if (isGuest && loadingTime) return <CustomLoading />;

  const userMenuProps = {
    isGuest,
    isProfileOpen,
    setIsProfileOpen,
    profileRef,
    onToggleProfile: () => setIsProfileOpen((prev) => !prev),
  };

  if (!isGuest) {
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
        onClick: () => navigate(isGuest ? LAYOUT_ROUTES.MY_APPLICATIONS : LAYOUT_ROUTES.HOME),
      }}
    />
  );
};

export default AdminHeader;
