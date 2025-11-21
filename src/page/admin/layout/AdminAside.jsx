import { AllRoles, AllUsers, Applicants, Applications } from '@/assets/svgs/icon';
import { useBranding } from '@/hooks/BrandingContext';
import { detectLogo } from '@/utils/detectLogo';
import { BrushIcon, CheckCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { HiOutlineLightBulb } from 'react-icons/hi';
import { PiStrategyBold } from 'react-icons/pi';
import { RiHistoryLine } from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';
import logoApply from '../../../assets/images/logo.png';
import ArrowBackIcon from '../../../assets/svgs/ArrowBackIcon';
import { useSelector } from 'react-redux';

const AdminAside = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useSelector(state => state.auth);
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
    { title: 'Application forms', link: '/application-forms', icon: <Applications /> },
    { title: 'Role Management', link: '/all-roles', icon: <AllRoles /> },
    { title: 'User Management', link: '/all-users', icon: <AllUsers /> },
    { title: 'Applications', link: '/applications', icon: <Applicants /> },
    { title: 'Branding Management', link: '/branding', icon: <BrushIcon /> },
    { title: 'Lookup management', link: '/strategies-key', icon: <HiOutlineLightBulb /> },
    { title: 'Verification', link: '/verification-test', icon: <CheckCircle /> },
    { title: 'Strategies', link: '/strategies', icon: <PiStrategyBold /> },
    {
      title: 'Pdf View',
      link: `singleform/pdf-view/69204e77ea277be77a9152b7/${user?._id}`,
      icon: <RiHistoryLine size={20} />,
    },
    {
      title: 'Email',
      link: `email`,
      icon: <RiHistoryLine size={20} />,
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div
        className={`fixed top-0 left-0 z-40 h-full rounded-md bg-white ${isNavOpen ? 'p-4' : 'p-8'} transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-[110%]'} lg:static lg:flex lg:translate-x-0 lg:flex-col lg:justify-between ${isNavOpen ? 'w-[250px]' : 'w-5'} `}
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
            <Link to="/application-forms" className="flex min-w-10 items-center justify-center">
              <img
                src={logo || logoApply}
                alt="logo"
                referrerPolicy="no-referrer"
                className={`object-contain ${
                  isNavOpen
                    ? 'h-[50px] max-w-40' // full logo when open
                    : 'h-10 w-10'
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
                  onClick={() => setSidebarOpen(false)}
                  className={`flex w-full min-w-fit items-center rounded-md p-2 ${isNavOpen ? 'size-12 gap-2' : 'size-12'} ${isActive ? 'bg-primary font-semibold text-white' : 'hover:text-primary text-[#526581] hover:bg-gray-100'} `}
                >
                  <div
                    className={`${isNavOpen ? 'p-6!' : 'bg-red-500!'}text-[20px] ${isActive ? 'text-white' : 'text-[#526581]'}`}
                  >
                    {React.cloneElement(page.icon, {
                      color: isActive ? '#ffffff' : '#526581',
                    })}
                  </div>
                  <p
                    className={`text-sm font-medium capitalize transition-all duration-300 md:text-base ${isActive ? 'font-bold! text-white' : 'text-[#526581]'} ${isNavOpen ? 'ml-2 w-auto opacity-100' : 'w-0 overflow-hidden opacity-0'} `}
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
