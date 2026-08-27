import { Dropdown } from "flowbite-react";
import {
  HiDocumentText,
  HiCheckCircle,
  HiXCircle,
  HiBell,
} from "react-icons/hi";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AtasanDashboard() {
  const [hasNotif, setHasNotif] = useState(true);
  const [data, setData] = useState({
    total: 0,
    disetujui: 0,
    ditolak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  const fetchData = () => {
    const token = localStorage.getItem("token");

    axios
      .get("/api/pengajuan-clearing", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const items = Array.isArray(response.data) ? response.data : [];

        setData({
          total: items.length,
          disetujui: items.filter(
            (item) =>
              item.status === "diverifikasi" ||
              item.status === "approved" ||
              item.status === "selesai",
          ).length,
          ditolak: items.filter(
            (item) => item.status === "ditolak" || item.status === "rejected",
          ).length,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const fetchNotifications = () => {
    const token = localStorage.getItem("token");

    axios
      .get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const notifData = Array.isArray(response.data) ? response.data : [];
        setNotifications(notifData);
        setHasNotif(notifData.length > 0);
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
        "/api/notifications/read-all",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
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
                <Dropdown.Item key={index}>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {notif.title || "Notifikasi"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {notif.message || "Tidak ada pesan"}
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
