import { useState, useEffect } from 'react';
import { HiDocumentText, HiCheckCircle, HiClock, HiBell } from 'react-icons/hi';
import axios from 'axios';
import AtasanSidebar from '../components/AtasanSidebar';

const API_BASE_URL = 'http://172.18.160.93:8000';

export default function DashboardAtasan() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState({
    total: 0,
    sudahTtd: 0,
    belumTtd: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const extractArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return null;

    const commonKeys = ["data", "items", "result", "results", "bebas_pustaka", "pengajuan", "list"];

    for (const key of commonKeys) {
      if (Array.isArray(payload[key])) return payload[key];
    }

    for (const key of commonKeys) {
      if (payload[key] && typeof payload[key] === "object") {
        const nested = extractArray(payload[key]);
        if (Array.isArray(nested)) return nested;
      }
    }

    for (const value of Object.values(payload)) {
      if (Array.isArray(value)) return value;
    }

    return null;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_BASE_URL}/api/pengajuan-clearing?per_page=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const rawItems = extractArray(response.data) || [];

      // Debug: Cek status asli yang dikirim backend di Console Browser (F12)
      const uniqueStatuses = [...new Set(rawItems.map((item) => item.status))];
      console.log("LIST STATUS DARI BACKEND:", uniqueStatuses);

      let total = rawItems.length;
      let sudahTtd = 0;
      let belumTtd = 0;

      rawItems.forEach((item) => {
        const s = String(item.status || "").trim().toLowerCase();

        // Kriteria status yang dianggap sudah ditandatangani/selesai/disetujui
        if (
          s.includes("ttd") || 
          s.includes("selesai") || 
          s.includes("approved") ||
          s.includes("diverifikasi") ||
          s.includes("disetujui") ||
          s.includes("sudah") ||
          s.includes("signed")
        ) {
          sudahTtd++;
        } else {
          belumTtd++;
        }
      });

      setData({
        total,
        sudahTtd,
        belumTtd,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Atasan Component */}
      <AtasanSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onOpen={() => setSidebarOpen(true)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <main className="p-6 md:p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-500">Loading...</span>
            </div>
          ) : (
            <div className="w-full">
              {/* Header Title & Notification */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    Dashboard Kepala Bagian Tata Usaha
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Pantau kinerja dan data clearing online
                  </p>
                </div>
                
                {/* Lonceng Notifikasi */}
                <div className="relative">
                  <button className="p-2.5 bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm relative">
                    <HiBell className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      1
                    </span>
                  </button>
                </div>
              </div>

              {/* Grid 3 Kartu Stat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card 1: Total Pengajuan */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 border-t-4 border-t-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Pengajuan</p>
                      <h2 className="text-3xl font-bold text-gray-800 mt-2">{data.total}</h2>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                      <HiDocumentText className="w-7 h-7" />
                    </div>
                  </div>
                </div>

                {/* Card 2: Sudah Ditandatangani */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 border-t-4 border-t-emerald-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Sudah Ditandatangani</p>
                      <h2 className="text-3xl font-bold text-gray-800 mt-2">{data.sudahTtd}</h2>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                      <HiCheckCircle className="w-7 h-7" />
                    </div>
                  </div>
                </div>

                {/* Card 3: Belum Ditandatangani */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 border-t-4 border-t-amber-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Belum Ditandatangani</p>
                      <h2 className="text-3xl font-bold text-gray-800 mt-2">{data.belumTtd}</h2>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                      <HiClock className="w-7 h-7" />
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