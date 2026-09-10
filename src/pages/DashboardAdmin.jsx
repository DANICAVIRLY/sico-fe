import { useState, useEffect } from 'react';
import { HiDocumentText, HiCheckCircle, HiClock, HiPencilAlt, HiMenu, HiRefresh, HiExclamation } from 'react-icons/hi';
import axios from 'axios';
import SidebarAdminComp from '../components/SidebarAdminComp';

const API_BASE_URL = 'http://172.18.160.93:8000';

export default function DashboardAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState({
    total: 0,
    menungguVerifikasi: 0,
    sudahVerifikasi: 0,
    perluPerbaikan: 0,
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

      // Sudah Verifikasi
      diverifikasi_admin: "Sudah Verifikasi",
      diverifikasi: "Sudah Verifikasi",
      disetujui: "Sudah Verifikasi",
      approved: "Sudah Verifikasi",
      selesai: "Sudah Verifikasi",
      ttd_atasan: "Sudah Verifikasi",
      "sudah verifikasi": "Sudah Verifikasi",

      // Perlu Perbaikan / Revisi — termasuk kemungkinan varian per-tahap
      revisi_admin: "Perlu Perbaikan",
      revisi_dosen: "Perlu Perbaikan",
      revisi_ketua: "Perlu Perbaikan",
      revisi_atasan: "Perlu Perbaikan",
      revisi_perpus: "Perlu Perbaikan",
      revisi: "Perlu Perbaikan",
      perbaikan: "Perlu Perbaikan",
      revision: "Perlu Perbaikan",
      "perlu perbaikan": "Perlu Perbaikan",

      // Tidak ada status "Ditolak" terpisah di aplikasi ini — kalau backend
      // masih mengirim nilai ini, hitung sebagai "Perlu Perbaikan"
      ditolak: "Perlu Perbaikan",
      rejected: "Perlu Perbaikan",
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

      const response = await axios.get(`${API_BASE_URL}/api/pengajuan-clearing?per_page=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      // eslint-disable-next-line no-console
      console.log("RESPONSE DASHBOARD ADMIN:", response.data);

      const rawItems = extractArray(response.data) || [];

      // DEBUG: tampilkan semua nilai status mentah yang unik beserta jumlahnya.
      // Cek ini di console browser untuk memastikan tidak ada status yang salah kategori.
      const rawStatusCounts = rawItems.reduce((acc, item) => {
        const key = item.status === undefined || item.status === null ? '(kosong/null)' : String(item.status);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      // eslint-disable-next-line no-console
      console.log("DEBUG - Nilai status mentah dari backend & jumlahnya:", rawStatusCounts);

      const statuses = rawItems.map((item) => formatStatus(item.status));

      const total = statuses.length;
      const menungguVerifikasi = statuses.filter((s) => s === "Menunggu Verifikasi").length;
      const sudahVerifikasi = statuses.filter((s) => s === "Sudah Verifikasi").length;
      const perluPerbaikan = statuses.filter((s) => s === "Perlu Perbaikan").length;

      setData({
        total,
        menungguVerifikasi,
        sudahVerifikasi,
        perluPerbaikan,
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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <SidebarAdminComp isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
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
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Ringkasan pengajuan
                  </p>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                  title="Refresh data"
                >
                  <HiRefresh className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Pengajuan</p>
                      <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.total}</h2>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                      <HiDocumentText className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Menunggu Verifikasi</p>
                      <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.menungguVerifikasi}</h2>
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
                      <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.perluPerbaikan}</h2>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full text-red-600">
                      <HiPencilAlt className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Selesai</p>
                      <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.sudahVerifikasi}</h2>
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