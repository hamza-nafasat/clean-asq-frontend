import React, { useState } from 'react';
import { PiUsersThreeBold } from 'react-icons/pi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../../assets/images/logo.png';
import ArrowBackIcon from '../../../assets/svgs/ArrowBackIcon';
// import { PiUsersThreeBold } from 'react-icons/pi';
import { FaUserCheck, FaWpforms } from 'react-icons/fa';
import { FaUsersGear } from 'react-icons/fa6';
import { AllRoles, AllUsers, Applicants, Applications } from '@/assets/svgs/icon';
import { HiOutlineLightBulb } from 'react-icons/hi';

const AdminAside = () => {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(true);
  const location = useLocation();

  const handleNavOpen = () => setIsNavOpen(!isNavOpen);
  const pages = [
    {
      title: 'All Role',
      link: '/all-roles',
      icon: <AllRoles />,
    },
    {
      title: 'All Users',
      link: '/all-users',
      icon: <AllUsers />,
    },
    {
      title: 'Applications',
      link: '/admin-applications',
      icon: <Applications />,
    },
    {
      title: 'Applicants',
      link: '/admin-applicants',
      icon: <Applicants />,
    },
    {
      title: 'Branding',
      link: '/branding',
      icon: <HiOutlineLightBulb />,
    },
    {
      title: '1st application',
      link: '/user-application-forms/application-verification',
      icon: <HiOutlineLightBulb />,
    },
  ];

  return (
    <div
      className={`relative flex h-full flex-col justify-between rounded-t-md bg-white p-4 transition-all duration-500 ${
        isNavOpen ? 'w-[200px]' : 'w-[65px]'
      }`}
    >
      <div className="absolute top-[6%] right-[-11px] z-10 cursor-pointer" onClick={handleNavOpen}>
        <div className={`hidden transition-all duration-500 lg:block ${isNavOpen ? 'rotate-0' : 'rotate-180'}`}>
          <ArrowBackIcon color="var(--primary)" />
        </div>
      </div>

      <div className="py-4">
        <div className="mb-5 flex w-full items-center justify-center gap-1 xl:mb-12">
          <img
            src={logo}
            alt="logo"
            className={`block h-[31px] ${isNavOpen ? 'h-[50px] w-[160px]' : 'h-[31px] w-[31px]'} object-cover`}
          />
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
