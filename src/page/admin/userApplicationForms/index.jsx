import React from 'react';
import { Outlet } from 'react-router-dom';
import UserApplicationFormHeader from './layout/UserApplicationFormHeader';
import Footer from '../layout/Footer';

function UserApplicationForms() {
  return (
    // min-h-screen (not h-screen) with no overflow-hidden: the window is the single
    // scroll container, so a tall branding logo or a long owners list can never push
    // the Previous/Next buttons somewhere the user cannot reach. See QA 5.10/5.11/5.13.
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
}

export default UserApplicationForms;
