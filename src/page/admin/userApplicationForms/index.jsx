import React from 'react';
import AdminAside from '../layout/AdminAside';
import AdminHeader from '../layout/AdminHeader';
import { Outlet } from 'react-router-dom';
import UserApplicationFormAside from './layout/UserApplicationFormAside';
import UserApplicationFormHeader from './layout/UserApplicationFormHeader';
import Footer from '../layout/Footer';

function UserApplicationForms() {
  return (
    <div>
      <section className="grid h-screen w-screen place-items-center overflow-hidden bg-[#3582e715] px-6">
        {/* <section className="flex h-[calc(100vh-16px)] w-[calc(100vw-16px)] gap-5"> */}
        {/* <UserApplicationFormAside /> */}
        <div className="w-full flex-1">
          <UserApplicationFormHeader />
          <main className="scroll-0 mt-6 h-[calc(100vh-65px)] overflow-x-hidden overflow-y-scroll xl:h-[calc(100vh-65px)]">
            <div className="flex h-[calc(100vh-130px)] flex-col justify-between overflow-auto">
              <Outlet />
              <Footer />
            </div>
          </main>
        </div>
        {/* </section> */}
      </section>
    </div>
  );
}

export default UserApplicationForms;
