import { useState } from "react";
import { TextInput, Select, Badge } from "flowbite-react";
import { HiSearch, HiCalendar, HiX, HiMenu } from "react-icons/hi";
import AtasanSidebar from "../components/AtasanSidebar";

export default function DataPengajuanAtasan() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data dummy — nanti tinggal diganti fetch dari API seperti halaman admin/pustakawan
  const dataDummy = [
    { id: 1, nama: "Rizki Maulana", nim: "1234567890", tanggal: "20 Mei 2026", tanggalRaw: "2026-05-20", departemen: "Hasil Hutan", status: "Menunggu Verifikasi" },
    { id: 2, nama: "Sodikmomoko", nim: "2345678901", tanggal: "20 Apr 2026", tanggalRaw: "2026-04-20", departemen: "Hasil Hutan", status: "Selesai" },
    { id: 3, nama: "Mursalino Abroho", nim: "3456789012", tanggal: "20 Mei 2026", tanggalRaw: "2026-05-20", departemen: "Hasil Hutan", status: "Perlu Perbaikan" },
    { id: 4, nama: "Peter Kounaloy", nim: "4567890123", tanggal: "20 Apr 2026", tanggalRaw: "2026-04-20", departemen: "Hasil Hutan", status: "Selesai" },
  ];

  const [statusFilter, setStatusFilter] = useState("Semua status");
  const [tanggal, setTanggal] = useState("");
  const [search, setSearch] = useState("");

  const getStatusColor = (status) => {
    if (status === "Menunggu Verifikasi") return "warning";
    if (status === "Selesai") return "success";
    if (status === "Perlu Perbaikan") return "failure";
    return "gray";
  };

  const getStatusStyle = (status) => {
    if (status === "Selesai") {
      return "bg-green-100 text-green-700 border border-green-300";
    }
    if (status === "Perlu Perbaikan") {
      return "bg-red-100 text-red-700 border border-red-300";
    }
    return "bg-yellow-100 text-yellow-700 border border-yellow-300";
  };

  const filteredData = dataDummy.filter((data) => {
    const cocokStatus = statusFilter === "Semua status" || data.status === statusFilter;

    const cocokSearch =
      data.nama.toLowerCase().includes(search.toLowerCase()) ||
      data.nim.toLowerCase().includes(search.toLowerCase()) ||
      data.departemen.toLowerCase().includes(search.toLowerCase());

    const cocokTanggal = !tanggal || data.tanggalRaw === tanggal;

    return cocokStatus && cocokSearch && cocokTanggal;
  });

  const hasActiveFilter = search || tanggal || statusFilter !== "Semua status";

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AtasanSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 overflow-x-hidden">
        <div className="lg:hidden sticky top-0 z-30 bg-[#1e2678] text-white p-4 flex items-center justify-between shadow-md">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 focus:outline-none">
            <HiMenu className="w-6 h-6" />
          </button>
          <span className="font-bold">Clearing Online</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 md:p-8 flex-1">
          <div className="w-full">
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Data Pengajuan</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Pantau data pengajuan mahasiswa</p>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="sm:w-48">
                  <Select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>Semua status</option>
                    <option>Menunggu Verifikasi</option>
                    <option>Selesai</option>
                    <option>Perlu Perbaikan</option>
                  </Select>
                </div>

                <div className="sm:w-44">
                  <TextInput
                    id="tanggal"
                    type="date"
                    icon={HiCalendar}
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                  />
                </div>

                <div className="flex-1">
                  <TextInput
                    id="search"
                    type="text"
                    placeholder="Cari Nama, NIM, atau Departemen..."
                    icon={HiSearch}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {hasActiveFilter && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setTanggal("");
                      setStatusFilter("Semua status");
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
              {filteredData.length > 0 ? (
                filteredData.map((data, index) => (
                  <div
                    key={data.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">#{index + 1} • {data.tanggal}</p>
                        <p className="font-semibold text-gray-800 truncate">{data.nama}</p>
                        <p className="text-sm text-gray-500">{data.nim}</p>
                      </div>
                      <span
                        className={`shrink-0 inline-block px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusStyle(data.status)}`}
                      >
                        {data.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-600 truncate">{data.departemen}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-12 text-center text-gray-400">
                  Data pengajuan tidak ditemukan.
                </div>
              )}
            </div>

            {/* Desktop Table View */}
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.length > 0 ? (
                      filteredData.map((data, index) => (
                        <tr key={data.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-gray-500">{index + 1}</td>
                          <td className="px-6 py-3 font-medium text-gray-900">{data.nama}</td>
                          <td className="px-6 py-3 text-gray-600">{data.nim}</td>
                          <td className="px-6 py-3 text-gray-600 whitespace-nowrap">{data.tanggal}</td>
                          <td className="px-6 py-3 text-gray-600">{data.departemen}</td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <Badge color={getStatusColor(data.status)}>{data.status}</Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                          Data pengajuan tidak ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}