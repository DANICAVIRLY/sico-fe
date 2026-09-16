import { Outlet } from "react-router-dom";
import { HiMenu } from "react-icons/hi";
import AtasanSidebar from "../components/AtasanSidebar";
import { useState } from "react";

export default function AtasanLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f9fafb] flex">
      {/* AtasanSidebar sudah merender overlay/backdrop-nya sendiri saat isOpen,
          jadi TIDAK perlu backdrop tambahan di sini (dulu dobel). */}
      <AtasanSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 overflow-x-hidden">
        {/* Topbar mobile (sticky) - disamakan dengan pola di halaman lain */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#1e2678] text-white p-4 flex items-center justify-between shadow-md">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 focus:outline-none">
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