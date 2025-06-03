import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../../assets/images/logo.png';
import ArrowBackIcon from '../../../assets/svgs/ArrowBackIcon';
import { AiFillHome } from 'react-icons/ai';
import { PiNotepadBold, PiUsersThreeBold } from 'react-icons/pi';
import { FaUserCheck, FaWpforms } from 'react-icons/fa';

const ClientAside = () => {
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(true);
  const location = useLocation();

  const handleNavOpen = () => setIsNavOpen(!isNavOpen);

  const pages = [
    {
      title: 'All Users',
      icon: <PiUsersThreeBold />,
      link: '/client/client-applications',
    },
    {
      title: 'Application',
      link: '/client/client-application',
      icon: <FaWpforms />,
    },
    {
      title: 'Applicants',
      link: '/admin/admin-applicationss',
      icon: <FaUserCheck />, // or <MdPersonSearch />
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
          <ArrowBackIcon />
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
                } ${isActive ? 'bg-secondary rounded-md text-white' : ''}`}
              >
                <div className={`text-[20px] ${isActive ? 'text-white' : 'text-[#526581]'}`}>{page.icon}</div>
                <p
                  className={`navbar-title text-sm capitalize transition-opacity duration-500 md:text-base ${
                    isActive ? 'font-bold text-white' : 'text-[#526581]'
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

export default ClientAside;
