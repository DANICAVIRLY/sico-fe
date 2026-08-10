import { HiChartPie, HiDocumentText, HiLogout, HiX } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function PustakawanSidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      <div
        className={`h-screen w-64 bg-[#1e2678] flex flex-col fixed left-0 top-0 z-50
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 text-white p-1"
        >
          <HiX className="w-6 h-6" />
        </button>
      <div className="flex flex-col items-center justify-center pt-10 pb-10 text-white border-b border-[#2f3a96]">
          <img
            src="https://upload.wikimedia.org/wikipedia/id/0/0f/Logo_IPB.png"
            alt="Logo IPB"
            className="w-16 h-16 rounded-full border-2 border-white object-contain bg-white mb-2"
          />
          <div className="flex flex-col items-center mt-2">
            <span className="text-xl font-bold">Clearing</span>
            <span className="text-xl font-bold">Online</span>
          </div>
        </div>

    
<div className="flex flex-col gap-2 mt-6 px-6">
  <Link
    to="/pustakawan-dashboard"
    onClick={onClose}
    className="flex items-center gap-4 text-white text-lg font-medium py-3 hover:bg-[#2f3a96] px-4 rounded-lg transition-colors"
  >
    <HiChartPie className="w-6 h-6" />
    Dashboard
  </Link>


  <Link 
    to="/data-pengajuan" 
    onClick={onClose}
    className="flex items-center gap-4 text-white text-lg font-medium py-3 hover:bg-[#2f3a96] px-4 rounded-lg transition-colors"
  >
    <HiDocumentText className="w-6 h-6" />
    Data pengajuan  
  </Link>
</div>

      
        <div className="mt-auto pb-10 px-6">
          <Link
            to="/"
            className="flex items-center gap-4 text-white text-lg font-medium py-3 hover:bg-[#2f3a96] px-4 rounded-lg transition-colors"
          >
            <HiLogout className="w-6 h-6" />
            Logout
          </Link>
        </div>
      </div>
    </>
  );
}