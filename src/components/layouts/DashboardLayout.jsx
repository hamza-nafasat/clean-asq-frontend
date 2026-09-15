import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import AdminHeader from "@/components/layouts/Header";
import AdminAside from "@/components/layouts/Sidebar";
import Footer from "@/components/layouts/Footer";
import { PERMISSIONS, hasPermission } from "@/utils/permissions";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const showSidebar = hasPermission(user, PERMISSIONS.ACCESS_SIDEBAR);

  return (
    <div>
      <section className="bg-backgroundColor grid h-screen w-screen place-items-center overflow-hidden">
        <section className="flex h-[calc(100vh-16px)] w-[calc(100vw-16px)] flex-col items-start justify-center gap-5 md:flex-row">
          {showSidebar && <AdminAside sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

          <div className="w-full flex-1 items-center justify-center">
            <AdminHeader setSidebarOpen={setSidebarOpen} />
            <main
              className={`scroll-0 mt-3.5 ${showSidebar ? "h-[calc(100vh-110px)] xl:h-[calc(100vh-110px)]" : "h-[calc(100vh-180px)] xl:h-[calc(100vh-180px)]"} overflow-x-hidden overflow-y-scroll xl:h-[calc(100vh-100px)]`}
            >
              <div className="flex h-full w-full flex-col justify-between gap-4 overflow-auto">
                <Outlet />
                <Footer />
              </div>
            </main>
          </div>
        </section>
      </section>
    </div>
  );
};

export default AdminDashboard;
