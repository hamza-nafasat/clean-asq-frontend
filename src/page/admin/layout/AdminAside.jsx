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

const AdminAside = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const location = useLocation();
  const { logo } = useBranding();
  const [isLight, setIsLight] = useState(false);

  // console.log('logo', logo);
  useEffect(() => {
    if (logo) {
      detectLogo(logo).then(res => {
        console.log('res', res);
        setIsLight(res);
      });
    }
  }, [logo]);

  const handleNavOpen = () => setIsNavOpen(!isNavOpen);
  const pages = [
    {
      title: 'Role Management',
      link: '/all-roles',
      icon: <AllRoles />,
    },
    {
      title: 'User Management',
      link: '/all-users',
      icon: <AllUsers />,
    },
    {
      title: 'Application forms',
      link: '/application-forms',
      icon: <Applications />,
    },
    {
      title: 'Applications',
      link: '/applications',
      icon: <Applicants />,
    },
    {
      title: 'Branding Management',
      link: '/branding',
      icon: <BrushIcon />,
    },
    // {
    //   title: '1st application',
    //   link: '/user-application-forms/application-verification',
    //   icon: <HiOutlineLightBulb />,
    // },
    {
      title: 'Lookup management',
      link: '/strategies-key',
      icon: <HiOutlineLightBulb />,
    },
    // {
    //   title: 'Extraction Context',
    //   link: '/extraction-context',
    //   icon: <Layers2 />,
    // },
    {
      title: 'Verification',
      link: '/verification',
      icon: <CheckCircle />,
    },
    {
      title: 'Strategies',
      link: '/strategies',
      icon: <CheckCircle />,
    },
  ];

  return (
    <div
      className={`relative flex h-full flex-col justify-between rounded-t-md bg-white p-4 transition-all duration-500 ${
        isNavOpen ? 'w-[250px]' : 'w-[65px]'
      }`}
    >
      <div className="absolute top-[6%] right-[-11px] z-10 cursor-pointer" onClick={handleNavOpen}>
        <div className={`hidden transition-all duration-500 lg:block ${isNavOpen ? 'rotate-0' : 'rotate-180'}`}>
          <ArrowBackIcon color="var(--primary)" />
        </div>
      </div>

      <div className="py-4">
        <div className={`mb-5 flex w-full items-center justify-center gap-1 xl:mb-12`}>
          <Link to="/application-forms">
            <img
              src={logo || logoApply}
              alt="logo"
              className={`block h-[31px] w-full ${isNavOpen ? 'h-[50px] max-w-[160px]' : 'h-[31px] max-w-[31px]'} object-contain ${isLight ? 'rounded-sm bg-gray-700' : ''}`}
              referrerPolicy="no-referrer"
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
                className={`flex w-full min-w-fit cursor-pointer items-center p-2 text-nowrap transition-all duration-400 ${
                  isNavOpen ? 'gap-2' : 'gap-[0]'
                } ${isActive ? 'rounded-md text-white' : ''}`}
              >
                <div className={`text-[20px] ${isActive ? 'text-white' : 'text-[#526581]'}`}>
                  {React.cloneElement(page.icon, {
                    color: isActive ? '#066969' : '#000000',
                  })}
                </div>

                <p
                  className={`navbar-title text-sm font-medium capitalize transition-opacity duration-500 md:text-base ${
                    isActive ? 'text-primary !font-bold' : 'text-[#526581]'
                  } ${isNavOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}
                >
                  {page.title}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminAside;
