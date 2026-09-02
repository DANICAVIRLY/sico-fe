import { Link } from "react-router-dom";
import { HiSearch, HiCalendar } from "react-icons/hi";
import { useState, useEffect } from "react";
import axios from "axios";

export default function DataPengajuan() {
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

      const response = await axios.get("http://10.6.65.93:8000/api/bebas-pustaka", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("RESPONSE DATA PENGAJUAN:", response.data);

      const responseData = extractArray(response.data?.data);

      if (!Array.isArray(responseData)) {
        console.error("Data pengajuan bukan array:", response.data);
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
        // Value asli dari App\Enums\BebasPustakaStatus: 'menunggu' | 'disetujui' | 'revisi'
        status: item.status || "menunggu",
      }));

      setAllData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response) {
        console.error("STATUS:", error.response.status);
        console.error("RESPONSE:", error.response.data);
      }
      setAllData([]);
    } finally {
      setLoading(false);
    }
  };

  // Label tampilan, sama pola dengan DataMahasiswa.jsx
  const formatStatus = (status) => {
    const statusMap = {
      menunggu: "Menunggu Verifikasi",
      disetujui: "Diverifikasi",
      revisi: "Revisi",
    };
    return statusMap[status?.toLowerCase()] || "Menunggu Verifikasi";
  };

  // Style badge, sama pola dengan getStatusStyle di DataMahasiswa.jsx
  const getStatusStyle = (status) => {
    const label = formatStatus(status);

    if (label === "Diverifikasi") {
      return "bg-green-100 text-green-700 border border-green-300";
    }
    if (label === "Revisi") {
      return "bg-red-100 text-red-700 border border-red-300";
    }
    return "bg-yellow-100 text-yellow-700 border border-yellow-300"; // Menunggu Verifikasi
  };

  // Filter data
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

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Data Pengajuan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data pengajuan mahasiswa untuk pembersihan clearing
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Pengajuan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola data pengajuan mahasiswa untuk pembersihan clearing
        </p>
      </div>

      {/* FILTER */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option>Semua status</option>
          <option>Menunggu Verifikasi</option>
          <option>Diverifikasi</option>
          <option>Revisi</option>
        </select>

        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-4 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <HiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Cari Nama, NIM, atau Departemen..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 w-full px-4 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {(searchTerm || selectedDate || selectedStatus !== "Semua status") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedDate("");
              setSelectedStatus("Semua status");
              setCurrentPage(1);
            }}
            className="h-10 px-4 rounded-lg border border-red-300 bg-red-50 text-sm text-red-600 hover:bg-red-100 transition"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700 w-12">No</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Nama</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">NIM</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Tanggal</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Departemen</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.length > 0 ? (
                currentData.map((data, index) => (
                  <tr key={data.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-500">{startIndex + index + 1}</td>
                    <td className="px-6 py-3 font-medium text-gray-800">{data.nama}</td>
                    <td className="px-6 py-3 text-gray-600">{data.nim}</td>
                    <td className="px-6 py-3 text-gray-600">{data.tanggal}</td>
                    <td className="px-6 py-3 text-gray-600">{data.departemen}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(data.status)}`}
                      >
                        {formatStatus(data.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <Link to={`/detail-verifikasi/${data.id}`}>
                        <button className="px-4 py-1.5 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-full hover:bg-indigo-50 transition">
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

      {/* PAGINATION */}
      {filteredData.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <span className="text-sm text-gray-500">
            Menampilkan <span className="font-medium">{startIndex + 1}</span>{" "}
            -{" "}
            <span className="font-medium">
              {Math.min(endIndex, filteredData.length)}
            </span>{" "}
            dari <span className="font-medium">{filteredData.length}</span>{" "}
            data
          </span>
          <div className="flex items-center gap-1">
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>

            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1
            ).map((num) => (
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

            {totalPages > 5 && (
              <>
                <span className="text-gray-400">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                currentPage === totalPages || totalPages === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}