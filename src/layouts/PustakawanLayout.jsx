import { Outlet } from 'react-router-dom';
import PustakawanSidebar from '../components/PustakawanSidebar';
import { HiChartPie, HiDocumentText } from "react-icons/hi";

// Daftar menu khusus Pustakawan
const pustakawanMenus = [
  { label: "Dashboard", path: "/dashboard-pustakawan", icon: <HiChartPie className="w-6 h-6" /> },
  { label: "Data Pengajuan", path: "/data-pengajuan", icon: <HiDocumentText className="w-6 h-6" /> },
];

export default function PustakawanLayout() {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Kirim menuItems ke Sidebar */}
      <PustakawanSidebar menuItems={pustakawanMenus} />
      <div className="ml-64 p-8">
        <Outlet />
      </div>
    </div>
  );
}