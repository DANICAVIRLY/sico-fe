import { Link } from "react-router-dom";
import { HiSearch, HiCalendar, HiX, HiMenu } from "react-icons/hi";
import { useState, useEffect } from "react";
import axios from "axios";
import PustakawanSidebar from "../components/PustakawanSidebar";

export default function DataPengajuan() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allData, setAllData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua status");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get("http://172.18.160.133:8000/api/bebas-pustaka?per_page=1000", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const responseData = extractArray(response.data?.data);

      if (!Array.isArray(responseData)) {
        setAllData([]);
        return;
      }

      const data = responseData.map((item) => ({
        id: item.id,
        nama: item.nama || item.user?.nama || item.mahasiswa?.nama || "-",
        nim: item.nim || item.user?.nim || item.mahasiswa?.nim || "-",
        tanggalRaw: item.created_at ? item.created_at.substring(0, 10) : "",
        tanggal: item.created_at
          ? new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
        departemen: item.departemen || item.user?.departemen || item.mahasiswa?.departemen || "-",
        status: item.status || "menunggu",
      }));

      setAllData(data);
    } catch (error) {
      setAllData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      menunggu: "Menunggu Verifikasi",
      disetujui: "Diverifikasi",
      revisi: "Revisi",
    };
    return statusMap[status?.toLowerCase()] || "Menunggu Verifikasi";
  };

  const getStatusStyle = (status) => {
    const label = formatStatus(status);

    if (label === "Diverifikasi") {
      return "bg-green-100 text-green-700 border border-green-300";
    }
    if (label === "Revisi") {
      return "bg-red-100 text-red-700 border border-red-300";
    }
    return "bg-yellow-100 text-yellow-700 border border-yellow-300";
  };

  const filteredData = allData.filter((item) => {
    const cocokStatus =
      selectedStatus === "Semua status" || formatStatus(item.status) === selectedStatus;

    const cocokSearch =
      String(item.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.nim || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.departemen || "").toLowerCase().includes(searchTerm.toLowerCase());

    const cocokTanggal = !selectedDate || item.tanggalRaw === selectedDate;

    return cocokStatus && cocokSearch && cocokTanggal;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const hasActiveFilter = searchTerm || selectedDate || selectedStatus !== "Semua status";

  const getPageNumbers = () => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <PustakawanSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 overflow-x-hidden">
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
          ) : (
            <div className="w-full max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Data Pengajuan</h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Kelola data pengajuan mahasiswa untuk pembersihan clearing
                </p>
              </div>

              {/* Filter Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-11 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:w-48"
                  >
                    <option>Semua status</option>
                    <option>Menunggu Verifikasi</option>
                    <option>Diverifikasi</option>
                    <option>Revisi</option>
                  </select>

                  <div className="relative sm:w-44">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-11 w-full px-4 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <HiCalendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Cari Nama, NIM, atau Departemen..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-11 w-full px-4 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <HiSearch className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>

                  {hasActiveFilter && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedDate("");
                        setSelectedStatus("Semua status");
                        setCurrentPage(1);
                      }}
                      className="h-11 inline-flex items-center justify-center gap-1.5 px-4 rounded-lg border border-red-300 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 transition whitespace-nowrap"
                    >
                      <HiX className="h-4 w-4" />
                      Reset Filter
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {currentData.length > 0 ? (
                  currentData.map((data, index) => (
                    <div
                      key={data.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">#{startIndex + index + 1} • {data.tanggal}</p>
                          <p className="font-semibold text-gray-800 truncate">{data.nama}</p>
                          <p className="text-sm text-gray-500">{data.nim}</p>
                        </div>
                        <span
                          className={`shrink-0 inline-block px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusStyle(data.status)}`}
                        >
                          {formatStatus(data.status)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-sm text-gray-600 truncate">{data.departemen}</p>
                        <Link to={`/detail-verifikasi/${data.id}`} className="shrink-0">
                          <button className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-full hover:bg-indigo-50 whitespace-nowrap transition">
                            Lihat Detail
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-12 text-center text-gray-400">
                    Data pengajuan tidak ditemukan.
                  </div>
                )}
              </div>

              {/* Desktop Table View - markup disamakan dengan DataMahasiswa.jsx (tanpa inline display style) */}
              <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 w-12">No</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Nama</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">NIM</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Tanggal</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700">Departemen</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Status</th>
                        <th className="px-6 py-3 text-center font-semibold text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentData.length > 0 ? (
                        currentData.map((data, index) => (
                          <tr key={data.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-3 text-gray-500">{startIndex + index + 1}</td>
                            <td className="px-6 py-3 font-medium text-gray-800">{data.nama}</td>
                            <td className="px-6 py-3 text-gray-600">{data.nim}</td>
                            <td className="px-6 py-3 text-gray-600 whitespace-nowrap">{data.tanggal}</td>
                            <td className="px-6 py-3 text-gray-600">{data.departemen}</td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(data.status)}`}>
                                {formatStatus(data.status)}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-center whitespace-nowrap">
                              <Link to={`/detail-verifikasi/${data.id}`}>
                                <button className="px-4 py-1.5 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-full hover:bg-indigo-50 transition shadow-sm">
                                  Lihat Detail
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                            <div className="flex flex-col items-center">
                              <svg
                                className="w-12 h-12 text-gray-300 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span>Data pengajuan tidak ditemukan.</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {filteredData.length > 0 && (
                <div className="flex flex-col items-center gap-3 mt-4 sm:flex-row sm:justify-between">
                  <span className="text-sm text-gray-500 text-center sm:text-left">
                    Menampilkan <span className="font-medium">{startIndex + 1}</span> -{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredData.length)}
                    </span>{" "}
                    dari <span className="font-medium">{filteredData.length}</span> data
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    <button
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        currentPage === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ← <span className="hidden sm:inline">Previous</span>
                    </button>

                    {getPageNumbers().map((num) => (
                      <button
                        key={num}
                        onClick={() => setCurrentPage(num)}
                        className={`w-8 h-8 text-sm font-medium rounded-lg ${
                          currentPage === num
                            ? "bg-indigo-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        currentPage === totalPages || totalPages === 0
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <span className="hidden sm:inline">Next</span> →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}