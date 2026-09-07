import {
  HiDocumentText,
  HiCheckCircle,
  HiXCircle,
  HiBell,
} from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

// =====================================================================
// PENTING: samain base URL ke satu tempat (sama seperti file lain).
// Ganti kalau ternyata IP backend aktifnya beda.
// =====================================================================
const API_BASE_URL = "http://10.6.65.73:8000";

export default function AtasanDashboard() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [data, setData] = useState({
    total: 0,
    disetujui: 0,
    ditolak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  // =====================================================================
  // Klik di luar area popup notifikasi -> otomatis tertutup.
  // =====================================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =====================================================================
  // Sebelumnya component ini manggil GET /api/pengajuan-clearing lalu
  // hitung total/disetujui/ditolak manual di frontend. Itu salah endpoint
  // (base URL relatif, ga nyambung ke backend) dan salah baca struktur
  // response (bukan array, tapi object pagination).
  //
  // Sekarang manggil GET /api/dashboard, endpoint yang emang udah
  // disiapkan backend (DashboardService::atasanDashboard) buat ngitung
  // statistik ini di sisi server.
  // =====================================================================
  const fetchData = () => {
    const token = localStorage.getItem("token");

    axios
      .get(`${API_BASE_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
      .then((response) => {
        const statistik = response.data?.data?.statistik || {};

        setData({
          total: statistik.total_pengajuan ?? 0,
          disetujui: statistik.sudah_disetujui ?? 0,
          ditolak: statistik.sudah_ditolak ?? 0,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error.response?.data || error);
        setLoading(false);
      });
  };

  // =====================================================================
  // Endpoint asli backend ada di prefix "/notifikasi" (bukan
  // "/notifications"), lewat NotifikasiController + NotifikasiResource.
  // GET /api/notifikasi mengembalikan SEMUA notifikasi (paginated,
  // format Laravel Resource Collection: { data: [...], links, meta }),
  // bukan cuma yang belum dibaca. Jadi filter "belum dibaca" dilakukan
  // di sisi frontend di sini.
  // =====================================================================
  const fetchNotifications = () => {
    const token = localStorage.getItem("token");

    axios
      .get(`${API_BASE_URL}/api/notifikasi`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const allNotif = response.data?.data || [];
        const belumDibaca = allNotif.filter((n) => !n.dibaca);
        setNotifications(belumDibaca);
        setUnreadCount(belumDibaca.length);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
        setUnreadCount(0);
      });
  };

  const markAllAsRead = () => {
    const token = localStorage.getItem("token");
    axios
      .post(
        `${API_BASE_URL}/api/notifikasi/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .then(() => {
        setUnreadCount(0);
        setNotifications([]);
      })
      .catch((error) => {
        console.error("Error marking notifications:", error);
      });
  };

  if (loading) {
    return (
      <div className="w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Atasan
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Pantau kinerja dan data clearing online
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Atasan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau kinerja dan data clearing online
          </p>
        </div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative p-2 text-gray-600 bg-white rounded-full hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
          >
            <HiBell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-[1.25rem] px-1 rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="block text-sm font-semibold text-gray-900">
                  Notifikasi
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                    >
                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-500">
                        <HiBell className="w-4 h-4" />
                      </span>
                      <span className="text-sm text-gray-800">
                        {notif.judul || "Notifikasi"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center">
                    <span className="text-sm text-gray-500">
                      Belum ada notifikasi
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={markAllAsRead}
                className="w-full text-center text-blue-600 font-medium text-sm py-3 border-t border-gray-100 hover:bg-gray-50 transition-colors"
              >
                Tandai semua telah dibaca
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card dengan border di ATAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Pengajuan */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Pengajuan
              </p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {data.total}
              </h2>
            </div>
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <HiDocumentText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Sudah Disetujui */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Sudah Disetujui
              </p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {data.disetujui}
              </h2>
            </div>
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <HiCheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Sudah Ditolak */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Sudah Ditolak</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {data.ditolak}
              </h2>
            </div>
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <HiXCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}