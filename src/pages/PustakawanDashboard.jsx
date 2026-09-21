import { HiDocumentText, HiCheckCircle, HiClock, HiPencil, HiMenu, HiRefresh, HiExclamation } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import axios from 'axios';
import PustakawanSidebar from '../components/PustakawanSidebar'; // Pastikan path ini sesuai dengan project Anda

const API_BASE_URL = 'http://172.18.160.182:8000';

export default function PustakawanDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState({
    total: 0,
    diverifikasi: 0,
    menunggu: 0,
    revisi: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper untuk mengekstrak array data secara fleksibel dari berbagai bentuk response API
  const extractArray = (payload, depth = 0) => {
    if (depth > 5) return null;
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return null;

    const commonKeys = ["data", "items", "result", "results", "bebas_pustaka", "pengajuan", "list", "rows"];

    for (const key of commonKeys) {
      if (Array.isArray(payload[key])) return payload[key];
    }

    for (const key of commonKeys) {
      if (payload[key] && typeof payload[key] === "object") {
        const nested = extractArray(payload[key], depth + 1);
        if (Array.isArray(nested)) return nested;
      }
    }

    for (const value of Object.values(payload)) {
      if (Array.isArray(value)) return value;
    }

    for (const value of Object.values(payload)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const nested = extractArray(value, depth + 1);
        if (Array.isArray(nested)) return nested;
      }
    }

    return null;
  };

  const formatStatus = (status) => {
    if (!status) return "Menunggu Verifikasi";

    const s = String(status).trim().toLowerCase();

    const statusMap = {
      // Menunggu
      menunggu: "Menunggu Verifikasi",
      diajukan: "Menunggu Verifikasi",
      pending: "Menunggu Verifikasi",
      "menunggu verifikasi": "Menunggu Verifikasi",

      // Diverifikasi
      disetujui: "Diverifikasi",
      diverifikasi: "Diverifikasi",
      approved: "Diverifikasi",
      selesai: "Diverifikasi",
      "sudah verifikasi": "Diverifikasi",

      // Revisi
      revisi: "Revisi",
      perbaikan: "Revisi",
      revision: "Revisi",
      "perlu perbaikan": "Revisi",
      ditolak: "Revisi",
      rejected: "Revisi",
    };

    const mapped = statusMap[s];

    if (!mapped) {
      // eslint-disable-next-line no-console
      console.warn(`[formatStatus] Nilai status tidak dikenali: "${status}" — dianggap "Menunggu Verifikasi". Tambahkan ke statusMap jika ini seharusnya kategori lain.`);
      return "Menunggu Verifikasi";
    }

    return mapped;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/bebas-pustaka?per_page=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      // eslint-disable-next-line no-console
      console.log("RESPONSE DASHBOARD PUSTAKAWAN:", response.data);

      const rawItems = extractArray(response.data) || [];

      // DEBUG: tampilkan semua nilai status mentah yang unik beserta jumlahnya.
      const rawStatusCounts = rawItems.reduce((acc, item) => {
        const key = item.status === undefined || item.status === null ? '(kosong/null)' : String(item.status);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      // eslint-disable-next-line no-console
      console.log("DEBUG - Nilai status mentah dari backend & jumlahnya:", rawStatusCounts);

      const statuses = rawItems.map((item) => formatStatus(item.status));

      const total = statuses.length;
      const menunggu = statuses.filter((s) => s === "Menunggu Verifikasi").length;
      const diverifikasi = statuses.filter((s) => s === "Diverifikasi").length;
      const revisi = statuses.filter((s) => s === "Revisi").length;

      setData({
        total,
        diverifikasi,
        menunggu,
        revisi,
      });
    } catch (err) {
      let message = 'Gagal memuat data dashboard.';

      if (err.response) {
        message = `Error ${err.response.status}: ${
          err.response.data?.message || err.response.statusText || 'Terjadi kesalahan pada server.'
        }`;
        if (err.response.status === 401) {
          message += ' Token mungkin sudah expired, coba login ulang.';
        }
      } else if (err.request) {
        message = `Tidak bisa terhubung ke server (${API_BASE_URL}). Pastikan backend menyala dan bisa diakses dari jaringan ini.`;
      } else {
        message = `Error: ${err.message}`;
      }

      // eslint-disable-next-line no-console
      console.error('Error fetching dashboard data:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <PustakawanSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* lg:ml-64 WAJIB ada karena PustakawanSidebar posisinya "fixed"
          (keluar dari flow normal), jadi konten harus digeser manual
          selebar sidebar (256px) di layar >= lg. Tanpa ini, konten akan
          ketutup sidebar di desktop. */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 overflow-x-hidden">
        {/* Topbar Mobile (Sticky) */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#1e2678] text-white p-4 flex items-center justify-between shadow-md">
          <button onClick={() => setSidebarOpen(true)} className="p-1 focus:outline-none">
            <HiMenu className="w-6 h-6" />
          </button>
          <span className="font-bold">Clearing Online</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 md:p-8 flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-500">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <HiExclamation className="w-10 h-10 text-red-500 mb-3" />
              <p className="text-gray-700 font-medium mb-1">Gagal memuat data</p>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                <HiRefresh className="w-4 h-4" />
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="w-full">
              <div className="mb-6 flex flex-row items-center justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">Dashboard Pustakawan</h1>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Kelola dan verifikasi bebas pustaka mahasiswa
                  </p>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="shrink-0 p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                  title="Refresh data"
                >
                  <HiRefresh className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-6">
                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border-t-4 border-indigo-500">
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

                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border-t-4 border-yellow-500">
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

                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border-t-4 border-red-500">
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

                <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border-t-4 border-green-500">
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