import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiDocumentText, HiCheckCircle, HiClock, HiBell } from 'react-icons/hi';
import axios from 'axios';
import AtasanSidebar from '../components/AtasanSidebar';


const API_BASE_URL = 'http://172.18.160.202:8000';
const READ_NOTIF_KEY = 'atasan_read_notif_ids';

export default function DashboardAtasan() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState({
    total: 0,
    sudahTtd: 0,
    belumTtd: 0,
  });
  const [loading, setLoading] = useState(true);

  const [notifikasi, setNotifikasi] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem(READ_NOTIF_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const notifRef = useRef(null);
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      const uniqueStatuses = [...new Set(rawItems.map((item) => item.status))];
      console.log("LIST STATUS DARI BACKEND:", uniqueStatuses);
      let total = rawItems.length;
      let sudahTtd = 0;
      let belumTtd = 0;
      const belumTtdItems = [];

      rawItems.forEach((item) => {
        const s = String(item.status || "").trim().toLowerCase();
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
          belumTtdItems.push(item);
        }
      });

      setData({
        total,
        sudahTtd,
        belumTtd,
      });

      const sortedBelumTtd = [...belumTtdItems].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      setNotifikasi(sortedBelumTtd.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotifClick = (item) => {
    markAsRead([item.id]);
    setNotifOpen(false);
    navigate(`/atasan/pengajuan/${item.id}`, { state: { dataMahasiswa: item } });
  };

  const markAsRead = (ids) => {
    setReadIds((prev) => {
      const merged = Array.from(new Set([...prev, ...ids]));
      try {
        localStorage.setItem(READ_NOTIF_KEY, JSON.stringify(merged));
      } catch {

      }
      return merged;
    });
  };

  const handleTandaiSemua = () => {
    markAsRead(notifikasi.map((item) => item.id));
  };

  const unreadCount = notifikasi.filter((item) => !readIds.includes(item.id)).length;
  const badgeCount = unreadCount > 9 ? "9+" : unreadCount;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AtasanSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onOpen={() => setSidebarOpen(true)} 
      />

      <div className="flex-1 min-w-0">
        <main className="p-6 md:p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-500">Loading...</span>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    Dashboard Kepala Bagian Tata Usaha
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Pantau kinerja dan data clearing online
                  </p>
                </div>
                
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen((prev) => !prev)}
                    className="p-2.5 bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm relative"
                  >
                    <HiBell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                        {badgeCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                      <div className="px-4 pt-4 pb-2">
                        <p className="text-base font-bold text-gray-900">Notifikasi</p>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {notifikasi.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-gray-400">
                            Tidak ada notifikasi baru.
                          </div>
                        ) : (
                          notifikasi.map((item) => {
                            const isRead = readIds.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleNotifClick(item)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3"
                              >
                                <span
                                  className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                                    isRead ? "bg-gray-300" : "bg-amber-400"
                                  }`}
                                />
                                <span
                                  className={`text-sm leading-snug ${
                                    isRead
                                      ? "text-gray-400 font-normal"
                                      : "text-gray-800 font-medium"
                                  }`}
                                >
                                  Pengajuan Clearing Menunggu Persetujuan
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {notifikasi.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100">
                          <button
                            onClick={handleTandaiSemua}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Tandai semua telah dibaca
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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