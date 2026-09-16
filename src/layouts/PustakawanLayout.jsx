import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HiMenu } from 'react-icons/hi';
import PustakawanSidebar from '../components/PustakawanSidebar';

export default function PustakawanLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f9fafb] flex">
      <PustakawanSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Topbar mobile (sticky) - sama seperti di DataPengajuan.jsx */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#1e2678] text-white p-4 flex items-center justify-between shadow-md">
          <button onClick={() => setSidebarOpen(true)} className="p-1 focus:outline-none">
            <HiMenu className="w-6 h-6" />
          </button>
          <span className="font-bold">Clearing Online</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 md:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}