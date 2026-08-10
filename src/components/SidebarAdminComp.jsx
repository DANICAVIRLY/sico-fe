import { HiLogout } from "react-icons/hi";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function SidebarAdminComp() {
  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-[#1E2F80] text-white flex flex-col z-50">
        <div className="flex items-center gap-3 px-6 py-6">
            <img src={logo} alt="Logo IPB" className="w-16 h-16 rounded-full border-1 border-white object-contain bg-white mb-2"/>
            <div className="font-bold text-lg leading-tight">
            <div>Clearing</div>
            <div>Online</div>
            </div>
        </div>
        <div className="flex flex-col gap-2 px-6 mt-6">
            <Link to="/dashboard-mahasiswa" className="flex items-center gap-3 p-3 rounded-lg font-medium hover:bg-[#2f3a96] transition-colors" >
            Dashboard
            </Link>
            <Link to="/bebas-pustaka" className="flex items-center gap-3 p-3 rounded-lg font-medium hover:bg-[#2f3a96] transition-colors" >
            Bebas Pustaka
            </Link>
            <Link to="/pengajuan-saya" className="flex items-center gap-3 p-3 rounded-lg font-medium hover:bg-[#2f3a96] transition-colors" >
            Pengajuan Saya
            </Link>
        </div>
        <div className="mt-auto pb-10 px-6">
            <Link to="/signup" className="flex items-center gap-3 p-3 rounded-lg font-medium hover:bg-[#2f3a96] transition-colors" >
                <HiLogout className="w-6 h-6" />
                Logout
            </Link>
        </div>
    </div>
  );
}