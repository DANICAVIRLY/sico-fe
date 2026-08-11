import { useState } from "react";
import SidebarAdminComp from "../components/SidebarAdminComp";
import { HiSearch, HiCalendar } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function DataMahasiswa() {
  const navigate = useNavigate();

  const mahasiswaData = [
    {
      id: 1,
      nama: "Raisa Maulana",
      nim: "1234567890",
      tanggal: "20 Mar 2026",
      departemen: "Hasil Hutan",
      status: "Menunggu Verifikasi",
    },
    {
      id: 2,
      nama: "Sadamairaka",
      nim: "2345678901",
      tanggal: "20 Apr 2026",
      departemen: "Hasil Hutan",
      status: "Selesai",
    },
    {
      id: 3,
      nama: "Marvelino Abraha",
      nim: "3456789012",
      tanggal: "20 Mei 2026",
      departemen: "Hasil Hutan",
      status: "Perlu Perbaikan",
    },
    {
      id: 4,
      nama: "Peter Kovinsky",
      nim: "2345678901",
      tanggal: "20 Apr 2026",
      departemen: "Hasil Hutan",
      status: "Selesai",
    },
    {
      id: 5,
      nama: "Gigi Hadid",
      nim: "3456789012",
      tanggal: "20 Mei 2026",
      departemen: "Hasil Hutan",
      status: "Perlu Perbaikan",
    },
    {
      id: 6,
      nama: "Justin Bieber",
      nim: "2345678901",
      tanggal: "20 Apr 2026",
      departemen: "Hasil Hutan",
      status: "Selesai",
    },
    {
      id: 7,
      nama: "Martin Edwards",
      nim: "3456789012",
      tanggal: "20 Mei 2026",
      departemen: "Hasil Hutan",
      status: "Perlu Perbaikan",
    },
    {
      id: 8,
      nama: "Ella Bright",
      nim: "3456789012",
      tanggal: "20 Mei 2026",
      departemen: "Hasil Hutan",
      status: "Perlu Perbaikan",
    },
  ];

  const [statusFilter, setStatusFilter] = useState("Semua status");
  const [search, setSearch] = useState("");
  const [tanggal, setTanggal] = useState("");

  const filteredData = mahasiswaData.filter((mahasiswa) => {
    const cocokStatus =
      statusFilter === "Semua status" ||
      mahasiswa.status === statusFilter;

    const cocokSearch =
      mahasiswa.nama.toLowerCase().includes(search.toLowerCase()) ||
      mahasiswa.nim.toLowerCase().includes(search.toLowerCase()) ||
      mahasiswa.departemen.toLowerCase().includes(search.toLowerCase());

    return cocokStatus && cocokSearch;
  });

    const getStatusStyle = (status) => {
        if (status === "Selesai") {
        return "bg-emerald-50 text-emerald-500 border border-emerald-200";
        }
        if (status === "Perlu Perbaikan") {
        return "bg-red-50 text-red-500 border border-red-200";
        }
        return "bg-orange-50 text-orange-500 border border-orange-200";
    };

  return (
    <div className="min-h-screen bg-gray-100">
      <SidebarAdminComp />
      <main className="ml-64 min-h-screen p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Data Mahasiswa
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Berikut adalah data-data mahasiswa yang mengajukan clearing.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">

          {/* STATUS */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 w-[120px] rounded-lg border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option>Semua status</option>
            <option>Menunggu Verifikasi</option>
            <option>Selesai</option>
            <option>Perlu Perbaikan</option>
          </select>

          {/* TANGGAL */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tanggal / Bulan"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="h-10 w-[120px] rounded-lg border border-gray-300 bg-white px-3 pr-8 text-xs text-gray-700 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            <HiCalendar className="absolute right-2.5 top-3 h-4 w-4 text-gray-500" />
          </div>

          {/* SEARCH */}
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Cari Nama, Nim, atau Departemen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 pr-10 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            <HiSearch className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
          </div>

        </div>

        <div className="rounded-xl border border-gray-300 bg-white overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs">

              {/* TABLE HEADER */}
              <thead className="bg-gray-50 text-gray-700">
                <tr className="border-b border-gray-300">

                  <th className="px-3 py-3 font-semibold w-10">
                    No
                  </th>

                  <th className="px-3 py-3 font-semibold">
                    Nama
                  </th>

                  <th className="px-3 py-3 font-semibold">
                    NIM
                  </th>

                  <th className="px-3 py-3 font-semibold">
                    Tanggal
                  </th>

                  <th className="px-3 py-3 font-semibold">
                    Departemen
                  </th>

                  <th className="px-3 py-3 font-semibold">
                    Status
                  </th>

                  <th className="px-3 py-3 font-semibold text-center">
                    Aksi
                  </th>

                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>

                {filteredData.length > 0 ? (
                  filteredData.map((mahasiswa, index) => (

                    <tr
                      key={mahasiswa.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >

                      <td className="px-3 py-3 text-gray-700">
                        {index + 1}.
                      </td>

                      <td className="px-3 py-3 font-medium text-gray-800">
                        {mahasiswa.nama}
                      </td>

                      <td className="px-3 py-3 text-gray-700">
                        {mahasiswa.nim}
                      </td>

                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                        {mahasiswa.tanggal}
                      </td>

                      <td className="px-3 py-3 text-gray-700">
                        {mahasiswa.departemen}
                      </td>

                      <td className="px-3 py-3">

                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium whitespace-nowrap ${getStatusStyle(
                            mahasiswa.status
                          )}`}
                        >
                          {mahasiswa.status}
                        </span>

                      </td>

                      <td className="px-3 py-3 text-center">

                        <button
                            onClick={() =>
                                navigate(`/verifikasi-mahasiswa/${mahasiswa.id}`)
                            }
                            className="rounded-full border border-indigo-300 bg-white px-3 py-1.5 text-[10px] font-medium text-indigo-600 hover:bg-indigo-50 transition whitespace-nowrap"
                            >
                            Lihat Detail
                        </button> 

                      </td>

                    </tr>

                  ))
                ) : (

                  <tr>
                    <td
                      colSpan="7"
                      className="py-10 text-center text-gray-500"
                    >
                      Data mahasiswa tidak ditemukan.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        <div className="flex items-center justify-center gap-5 mt-5 text-xs">

          <button
            className="text-gray-400 cursor-not-allowed"
            disabled
          >
            ← Previous
          </button>

          <button className="h-6 w-6 rounded bg-gray-800 text-white">
            1
          </button>

          <button className="text-gray-600 hover:text-indigo-600">
            2
          </button>

          <button className="text-gray-600 hover:text-indigo-600">
            3
          </button>

          <span className="text-gray-500">
            ...
          </span>

          <button className="text-gray-600 hover:text-indigo-600">
            67
          </button>

          <button className="text-gray-600 hover:text-indigo-600">
            68
          </button>

          <button className="text-gray-700 hover:text-indigo-600">
            Next
          </button>

        </div>

      </main>

    </div>
  );
}