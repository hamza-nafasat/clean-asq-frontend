import React from 'react';
import AdminAside from '../layout/AdminAside';
import AdminHeader from '../layout/AdminHeader';
import { Outlet } from 'react-router-dom';
import Footer from '../layout/Footer';

function AdminDashboard() {
  return (
    <div>
      <section className="grid h-screen w-screen place-items-center overflow-hidden bg-[#3582e715]">
        <section className="flex h-[calc(100vh-16px)] w-[calc(100vw-16px)] gap-5">
          <AdminAside />
          <div className="mr-5 w-full flex-1">
            <AdminHeader />
            <main className="scroll-0 mt-[14px] h-[calc(100vh-65px)] overflow-x-hidden overflow-y-scroll xl:h-[calc(100vh-100px)]">
              <div className="flex h-full flex-col justify-between overflow-auto">
                <Outlet />
                <Footer />
              </div>
            </main>
          </div>
        </section>
      </section>
    </div>
  );
}

export default AdminDashboard;
