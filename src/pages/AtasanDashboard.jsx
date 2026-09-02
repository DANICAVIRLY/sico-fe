import { Dropdown } from "flowbite-react";
import {
  HiDocumentText,
  HiClock,
  HiCheckCircle,
  HiBell,
} from "react-icons/hi";
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://10.6.64.238:8000";

export default function AtasanDashboard() {
  const [hasNotif, setHasNotif] = useState(true);
  const [data, setData] = useState({
    total: 0,
    menungguTtd: 0,
    sudahDitandatangani: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchData();
    fetchNotifications();
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
  //
  // CATATAN: nama field statistik di bawah ini (menunggu_ttd /
  // sudah_ditandatangani, dst) masih tebakan berdasarkan pola penamaan
  // backend (snake_case, mirip total_pengajuan/sudah_disetujui/
  // sudah_ditolak). console.log di bawah dipasang supaya struktur
  // response asli bisa dicek di DevTools dan nama field disesuaikan
  // kalau ternyata beda.
  // =====================================================================
  const fetchData = () => {
    const token = localStorage.getItem("token");

    axios
      .get(`${API_BASE_URL}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        const statistik = response.data?.data?.statistik || {};

        console.log("DASHBOARD ATASAN - FULL RESPONSE:", response.data);
        console.log("DASHBOARD ATASAN - STATISTIK:", statistik);

        setData({
          total: statistik.total_pengajuan ?? 0,
          // "Menunggu Tanda Tangan": sudah direview admin, atasan belum ttd.
          menungguTtd:
            statistik.menunggu_ttd ??
            statistik.menunggu_tanda_tangan ??
            statistik.sudah_disetujui ??
            0,
          // "Sudah Ditandatangani": atasan sudah approve/ttd.
          sudahDitandatangani:
            statistik.sudah_ditandatangani ??
            statistik.selesai_ditandatangani ??
            statistik.sudah_disetujui_atasan ??
            0,
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
        setHasNotif(belumDibaca.length > 0);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
        setHasNotif(false);
      });
  };

  const markAllAsRead = () => {
    const token = localStorage.getItem("token");
    axios
      .post(
        `${API_BASE_URL}/api/notifikasi/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      )
      .then(() => {
        setHasNotif(false);
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

        <div>
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <button className="relative p-2 text-gray-600 bg-white rounded-full hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm">
                <HiBell className="w-6 h-6" />
                {hasNotif && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white transform translate-x-1/4 -translate-y-1/4"></span>
                )}
              </button>
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-medium text-gray-900">
                Notifikasi
              </span>
              <span className="block text-sm text-gray-500">
                {notifications.length > 0
                  ? `Ada ${notifications.length} notifikasi baru`
                  : "Tidak ada notifikasi baru"}
              </span>
            </Dropdown.Header>

            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <Dropdown.Item key={notif.id || index}>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {notif.judul || "Notifikasi"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {notif.pesan || "Tidak ada pesan"}
                    </span>
                  </div>
                </Dropdown.Item>
              ))
            ) : (
              <Dropdown.Item>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">
                    Belum ada notifikasi
                  </span>
                </div>
              </Dropdown.Item>
            )}

            <Dropdown.Divider />
            <Dropdown.Item
              onClick={markAllAsRead}
              className="text-center text-blue-600 font-medium"
            >
              Tandai semua telah dibaca
            </Dropdown.Item>
          </Dropdown>
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

        {/* Menunggu Tanda Tangan */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Menunggu Tanda Tangan
              </p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {data.menungguTtd}
              </h2>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
              <HiClock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Sudah Ditandatangani */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Sudah Ditandatangani
              </p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {data.sudahDitandatangani}
              </h2>
            </div>
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <HiCheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}