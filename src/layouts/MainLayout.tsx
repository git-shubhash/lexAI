import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import UserOnboarding from '../components/UserOnboarding';

const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      <UserOnboarding />
      <Sidebar />
      <div className="flex-1 flex flex-col transition-all duration-300 md:ml-[260px]">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
