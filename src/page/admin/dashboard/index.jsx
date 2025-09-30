import React, { useState } from 'react';
import AdminAside from '../layout/AdminAside';
import AdminHeader from '../layout/AdminHeader';
import { Outlet } from 'react-router-dom';
import Footer from '../layout/Footer';

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <section className="grid h-screen w-screen place-items-center overflow-hidden bg-[#3582e715]">
        <section className="flex h-[calc(100vh-16px)] w-[calc(100vw-16px)] flex-col items-start justify-center gap-5 md:flex-row">
          {/* Sidebar */}
          <AdminAside sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Content */}
          <div className="w-full flex-1 items-center justify-center">
            <AdminHeader setSidebarOpen={setSidebarOpen} />
            <main className="scroll-0 mt-[14px] h-[calc(100vh-80px)] overflow-x-hidden overflow-y-scroll xl:h-[calc(100vh-100px)]">
              <div className="flex h-full w-full flex-col justify-between gap-4 overflow-auto px-2">
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
