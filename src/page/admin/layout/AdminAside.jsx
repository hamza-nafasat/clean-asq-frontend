import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ArrowBackIcon from '../../../assets/svgs/ArrowBackIcon';
import { AllRoles, AllUsers, Applicants, Applications } from '@/assets/svgs/icon';
import { HiOutlineLightBulb } from 'react-icons/hi';
import { useBranding } from '@/hooks/BrandingContext';
import logoApply from '../../../assets/images/logo.png';
import { MdOutlineBrandingWatermark } from 'react-icons/md';
import { BrushIcon, CheckCircle, Layers2 } from 'lucide-react';
import { detectLogo } from '@/utils/detectLogo';
import { PiStrategyBold } from 'react-icons/pi';

const AdminAside = ({ sidebarOpen, setSidebarOpen }) => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const location = useLocation();
  const { logo } = useBranding();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (logo) {
      detectLogo(logo).then(res => setIsLight(res));
    }
  }, [logo]);

  const handleNavOpen = () => setIsNavOpen(!isNavOpen);

  const pages = [
    { title: 'Role Management', link: '/all-roles', icon: <AllRoles /> },
    { title: 'User Management', link: '/all-users', icon: <AllUsers /> },
    { title: 'Application forms', link: '/application-forms', icon: <Applications /> },
    { title: 'Applications', link: '/applications', icon: <Applicants /> },
    { title: 'Branding Management', link: '/branding', icon: <BrushIcon /> },
    { title: 'Lookup management', link: '/strategies-key', icon: <HiOutlineLightBulb /> },
    { title: 'Verification', link: '/verification-test', icon: <CheckCircle /> },
    { title: 'Strategies', link: '/strategies', icon: <PiStrategyBold /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div
        className={`fixed top-0 left-0 z-40 h-full rounded-md bg-white ${isNavOpen ? 'p-4' : 'p-8'} transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-[110%]'} lg:static lg:flex lg:translate-x-0 lg:flex-col lg:justify-between ${isNavOpen ? 'w-[250px]' : 'w-[20px]'} `}
      >
        {/* Toggle Button (desktop only) */}
        <div className="absolute top-[6%] right-[-11px] z-10 hidden cursor-pointer lg:block" onClick={handleNavOpen}>
          <div className={`transition-all duration-500 ${isNavOpen ? 'rotate-0' : 'rotate-180'}`}>
            <ArrowBackIcon color="var(--primary)" />
          </div>
        </div>

        {/* Logo + Nav */}
        <div className="py-4">
          <div className="mb-5 flex w-full items-center justify-center xl:mb-12">
            <Link to="/application-forms" className="flex min-w-[40px] items-center justify-center">
              <img
                src={logo || logoApply}
                alt="logo"
                className={`object-contain ${
                  isNavOpen
                    ? 'h-[50px] max-w-[160px]' // full logo when open
                    : 'h-[40px] w-[40px]'
                } // compact logo when closed ${isLight ? 'rounded-sm bg-gray-700' : ''} `}
              />
            </Link>
          </div>

          <div className={`flex flex-col justify-center gap-2 ${isNavOpen ? 'items-start' : 'items-center'}`}>
            {pages.map((page, i) => {
              const isActive = location.pathname === page.link;
              return (
                <Link
                  key={i}
                  to={page.link}
                  onClick={() => setSidebarOpen(false)} // ✅ close sidebar on mobile click
                  className={`flex w-full min-w-fit items-center rounded-md p-2 ${isNavOpen ? 'gap-2' : ''} ${isActive ? 'bg-primary font-semibold text-white' : 'hover:text-primary text-[#526581] hover:bg-gray-100'} `}
                >
                  <div className={`text-[20px] ${isActive ? 'text-white' : 'text-[#526581]'}`}>
                    {React.cloneElement(page.icon, {
                      color: isActive ? '#ffffff' : '#526581',
                    })}
                  </div>
                  <p
                    className={`text-sm font-medium capitalize transition-all duration-300 md:text-base ${isActive ? '!font-bold text-white' : 'text-[#526581]'} ${isNavOpen ? 'ml-2 w-auto opacity-100' : 'w-0 overflow-hidden opacity-0'} `}
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
