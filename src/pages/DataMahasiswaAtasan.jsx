import { useState, useEffect } from "react";
import AtasanSidebar from "../components/AtasanSidebar";
import { HiSearch, HiCalendar } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function DataMahasiswaAtasan() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [mahasiswaData, setMahasiswaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Semua status");
  const [search, setSearch] = useState("");
  const [tanggal, setTanggal] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const formatStatus = (status) => {
    const statusMap = {
      menunggu: "Belum Ditandatangani",
      diajukan: "Belum Ditandatangani",
      pending: "Belum Ditandatangani",
      diverifikasi_admin: "Belum Ditandatangani",
      diverifikasi: "Belum Ditandatangani",
      disetujui: "Selesai Ditandatangani",
      approved: "Selesai Ditandatangani",
      selesai: "Selesai Ditandatangani",
      ttd_atasan: "Selesai Ditandatangani",
      ditolak: "Ditolak",
      rejected: "Ditolak",
      revisi_admin: "Perlu Perbaikan",
      perbaikan: "Perlu Perbaikan",
      revision: "Perlu Perbaikan",
    };
    return statusMap[status?.toLowerCase()] || status || "Belum Ditandatangani";
  };

  const fetchData = () => {
    const token = localStorage.getItem("token");

    axios
      .get("http://10.6.64.238:8000/api/pengajuan-clearing", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        const rawItems = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.data?.data || [];

        const data = rawItems.map((item) => ({
          ...item,
          id: item.id,
          nama: item.user?.nama || item.nama || "-",
          nim: item.user?.nim || item.nim || "-",
          tanggal: item.created_at
            ? new Date(item.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
          tanggalAsli: item.created_at || "",
          departemen: item.departemen || item.user?.departemen || "-",
          status: formatStatus(item.status),
        }));

        setMahasiswaData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const filteredData = mahasiswaData.filter((mahasiswa) => {
    const cocokStatus =
      statusFilter === "Semua status" || mahasiswa.status === statusFilter;

    const cocokSearch =
      mahasiswa.nama.toLowerCase().includes(search.toLowerCase()) ||
      mahasiswa.nim.toLowerCase().includes(search.toLowerCase()) ||
      mahasiswa.departemen.toLowerCase().includes(search.toLowerCase());

    let cocokTanggal = true;
    if (tanggal) {
      const tanggalInput = new Date(tanggal);
      const tanggalData = new Date(mahasiswa.tanggalAsli);

      cocokTanggal =
        tanggalInput.getFullYear() === tanggalData.getFullYear() &&
        tanggalInput.getMonth() === tanggalData.getMonth() &&
        tanggalInput.getDate() === tanggalData.getDate();
    }

    return cocokStatus && cocokSearch && cocokTanggal;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const getStatusStyle = (status) => {
    if (status === "Selesai Ditandatangani") {
      return "bg-green-100 text-green-700 border border-green-300";
    }
    if (status === "Perlu Perbaikan") {
      return "bg-red-100 text-red-700 border border-red-300";
    }
    if (status === "Ditolak") {
      return "bg-red-100 text-red-700 border border-red-300";
    }
    return "bg-yellow-100 text-yellow-700 border border-yellow-300";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <AtasanSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-500">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <AtasanSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content - FULL WIDTH */}
      <div className="flex-1 p-6 md:p-8">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden bg-[#1e2678] text-white p-2 rounded-lg mb-4"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Data Mahasiswa</h1>
          <p className="text-base text-gray-500 mt-1">
            Berikut adalah data mahasiswa yang mengajukan untuk meminta tanda tangan
          </p>
        </div>

        {/* Filter - Full Width */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-11 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option>Semua status</option>
            <option>Belum Ditandatangani</option>
            <option>Selesai Ditandatangani</option>
            <option>Perlu Perbaikan</option>
            <option>Ditolak</option>
          </select>

          <div className="relative">
            <input
              type="date"
              value={tanggal}
              onChange={(e) => {
                setTanggal(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 px-4 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <HiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Cari Nama, NIM, atau Departemen..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 w-full px-4 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          {/* Tombol Reset Filter */}
          {(search || tanggal || statusFilter !== "Semua status") && (
            <button
              onClick={() => {
                setSearch("");
                setTanggal("");
                setStatusFilter("Semua status");
                setCurrentPage(1);
              }}
              className="h-11 px-4 rounded-lg border border-red-300 bg-red-50 text-sm text-red-600 hover:bg-red-100 transition"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Table - Full Width */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">No</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Nama</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">NIM</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Tanggal</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Departemen</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500">{startIndex + index + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{item.nama}</td>
                      <td className="px-6 py-4 text-gray-600">{item.nim}</td>
                      <td className="px-6 py-4 text-gray-600">{item.tanggal}</td>
                      <td className="px-6 py-4 text-gray-600">{item.departemen}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            navigate(`/tanda-tangan/${item.id}`, {
                              state: { dataMahasiswa: item },
                            })
                          }
                          className="px-4 py-1.5 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-full hover:bg-indigo-50"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Data mahasiswa tidak ditemukan.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination - Full Width */}
        {filteredData.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <span className="text-sm text-gray-500">
              Menampilkan <span className="font-medium">{startIndex + 1}</span> -{" "}
              <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> dari{" "}
              <span className="font-medium">{filteredData.length}</span> data
            </span>
            <div className="flex items-center gap-1">
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                  currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 text-sm font-medium rounded-lg ${
                    currentPage === num ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
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
    </div>
  );
}