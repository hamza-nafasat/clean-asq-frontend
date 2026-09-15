import { Outlet } from "react-router-dom";

import UserApplicationFormHeader from "@/components/layouts/ApplicationFormHeader";
import Footer from "@/components/layouts/Footer";

// the window is the only scroll container so the step buttons stay reachable
const UserApplicationForms = () => (
  <section className="flex min-h-screen w-screen flex-col bg-[#3582e715] px-6">
    <div className="flex w-full flex-1 flex-col">
      <UserApplicationFormHeader />
      <main className="mt-6 flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-between">
          <Outlet />
          <Footer />
        </div>
      </main>
    </div>
  </section>
);

export default UserApplicationForms;
