import { Outlet } from "react-router-dom";
import AtasanSidebar from "../components/AtasanSidebar"; 
import { useState } from "react";

export default function AtasanLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col md:flex-row relative">
      <AtasanSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="lg:ml-64 flex-1 p-8 w-full overflow-x-hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 mb-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none"
        >
          <span className="text-xl">☰</span>
        </button>
        <Outlet />
      </div>
    </div>
  );
}
