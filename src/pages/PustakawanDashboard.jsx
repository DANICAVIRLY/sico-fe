import { HiDocumentText, HiCheckCircle, HiClock, HiPencil, HiMenu } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import axios from 'axios';
import PustakawanSidebar from '../components/PustakawanSidebar'; // Pastikan path ini sesuai dengan project Anda

const API_BASE_URL = 'http://172.18.160.93:8000';

export default function PustakawanDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState({
    total: 0,
    diverifikasi: 0,
    menunggu: 0,
    revisi: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_BASE_URL}/api/bebas-pustaka?per_page=1000`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const items = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.data?.data || [];

        if (!Array.isArray(items)) {
          setData({ total: 0, diverifikasi: 0, menunggu: 0, revisi: 0 });
          return;
        }

        const getKategori = (status) => {
          const s = status?.toLowerCase();
          if (s === "disetujui") return "diverifikasi";
          if (s === "revisi") return "revisi";
          return "menunggu";
        };

        setData({
          total: items.length,
          diverifikasi: items.filter((item) => getKategori(item.status) === "diverifikasi").length,
          menunggu: items.filter((item) => getKategori(item.status) === "menunggu").length,
          revisi: items.filter((item) => getKategori(item.status) === "revisi").length,
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <PustakawanSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Topbar Mobile (Sticky) */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#1e2678] text-white p-4 flex items-center justify-between shadow-md">
          <button onClick={() => setSidebarOpen(true)} className="p-1 focus:outline-none">
            <HiMenu className="w-6 h-6" />
          </button>
          <span className="font-bold">Clearing Online</span>
          <div className="w-6" />
        </div>

        <main className="p-6 md:p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-500">Loading...</span>
            </div>
          ) : (
            <div className="w-full">
              <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Pustakawan</h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Kelola dan verifikasi bebas pustaka mahasiswa
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-indigo-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Pengajuan</p>
                      <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.total}</h2>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                      <HiDocumentText className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Menunggu Verifikasi</p>
                      <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.menunggu}</h2>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                      <HiClock className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Revisi</p>
                      <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.revisi}</h2>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full text-red-600">
                      <HiPencil className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Diverifikasi</p>
                      <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.diverifikasi}</h2>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                      <HiCheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}