import { useState, useEffect } from "react";
import SidebarAdminComp from "../components/SidebarAdminComp";
import { HiSearch, HiCalendar } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Selesai() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua status");
  const [tanggal, setTanggal] = useState("");
  const [mahasiswa, setMahasiswa] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const token = localStorage.getItem('token');
    
    axios.get('/api/pengajuan-clearing', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      const selesaiData = response.data
        .filter(item => 
          item.status === 'diverifikasi' || 
          item.status === 'approved' || 
          item.status === 'selesai'
        )
        .map(item => ({
          id: item.id,
          nama: item.nama || '-',
          nim: item.nim || '-',
          tanggal: item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : '-',
          tanggalAsli: item.created_at || '',
          departemen: item.departemen || '-',
          status: 'Selesai'
        }));
      
      setMahasiswa(selesaiData);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });
  };

  // Filter data
  const filteredMahasiswa = mahasiswa.filter((item) => {
    const keyword = search.toLowerCase();

    const cocokSearch =
      item.nama.toLowerCase().includes(keyword) ||
      item.nim.toLowerCase().includes(keyword) ||
      item.departemen.toLowerCase().includes(keyword);

    const cocokStatus =
      status === "Semua status" || item.status === status;

    // Filter tanggal
    let cocokTanggal = true;
    if (tanggal) {
      const tanggalInput = new Date(tanggal);
      const tanggalData = new Date(item.tanggalAsli);
      
      cocokTanggal = 
        tanggalInput.getFullYear() === tanggalData.getFullYear() &&
        tanggalInput.getMonth() === tanggalData.getMonth() &&
        tanggalInput.getDate() === tanggalData.getDate();
    }

    return cocokSearch && cocokStatus && cocokTanggal;
  });

  const totalPages = Math.ceil(filteredMahasiswa.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredMahasiswa.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <SidebarAdminComp />
        <main className="ml-64 min-h-screen p-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-500">Loading...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <SidebarAdminComp />
      <main className="ml-64 min-h-screen p-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">Selesai</h1>
          <p className="mt-1 text-sm text-gray-500">
            Daftar mahasiswa yang telah menyelesaikan proses clearing.
          </p>
        </div>

        {/* FILTER */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option>Semua status</option>
            <option>Selesai</option>
          </select>

          <div className="relative">
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="h-10 px-4 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <HiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Cari Nama, Nim, atau Departemen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full px-4 pr-10 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Tombol Reset Filter */}
          {(search || tanggal || status !== "Semua status") && (
            <button
              onClick={() => {
                setSearch("");
                setTanggal("");
                setStatus("Semua status");
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
                  currentData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500">{startIndex + index + 1}</td>
                      <td className="px-6 py-3 font-medium text-gray-800">{item.nama}</td>
                      <td className="px-6 py-3 text-gray-600">{item.nim}</td>
                      <td className="px-6 py-3 text-gray-600">{item.tanggal}</td>
                      <td className="px-6 py-3 text-gray-600">{item.departemen}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full text-emerald-600 bg-emerald-50 border border-emerald-200">
                          Selesai
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => navigate(`/verifikasi-mahasiswa/${item.id}`)}
                          className="px-4 py-1.5 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-full hover:bg-indigo-50 transition"
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

        {/* PAGINATION */}
        {filteredMahasiswa.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <span className="text-sm text-gray-500">
              Menampilkan <span className="font-medium">{startIndex + 1}</span> -{' '}
              <span className="font-medium">{Math.min(endIndex, filteredMahasiswa.length)}</span> dari{' '}
              <span className="font-medium">{filteredMahasiswa.length}</span> data
            </span>
            <div className="flex items-center gap-1">
              <button
                className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                  currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
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
                    currentPage === num ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
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
                  currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next →
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}