import { useState } from "react";
import SidebarAdminComp from "../components/SidebarAdminComp";
import { HiSearch, HiCalendar } from "react-icons/hi";

export default function Selesai() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua status");
  const [tanggal, setTanggal] = useState("");

  // Data dummy mahasiswa yang sudah selesai
  const mahasiswa = [
    {
      id: 1,
      nama: "Raisa Maulana",
      nim: "1234567890",
      tanggal: "20 Mar 2026",
      departemen: "Hasil Hutan",
      status: "Selesai",
    },
    {
      id: 2,
      nama: "Sadamariaka",
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
      status: "Selesai",
    },
    {
      id: 4,
      nama: "Peter Kavinsky",
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
      status: "Selesai",
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
      status: "Selesai",
    },
    {
      id: 8,
      nama: "Ella Bright",
      nim: "3456789012",
      tanggal: "20 Mei 2026",
      departemen: "Hasil Hutan",
      status: "Selesai",
    },
  ];

  // Filter data
  const filteredMahasiswa = mahasiswa.filter((item) => {
    const keyword = search.toLowerCase();

    const cocokSearch =
      item.nama.toLowerCase().includes(keyword) ||
      item.nim.toLowerCase().includes(keyword) ||
      item.departemen.toLowerCase().includes(keyword);

    const cocokStatus =
      status === "Semua status" || item.status === status;

    return cocokSearch && cocokStatus;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <SidebarAdminComp />
      <main className="ml-64 min-h-screen p-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">
            Selesai
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Daftar mahasiswa yang telah menyelesaikan proses clearing.
          </p>
        </div>
        <div className="flex items-center gap-3 mb-4">

          {/* Status */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="
                w-[150px]
                h-[38px]
                px-3
                pr-8
                text-sm
                text-gray-600
                bg-white
                border
                border-gray-300
                rounded-lg
                outline-none
                focus:border-indigo-500
                focus:ring-1
                focus:ring-indigo-500
              "
            >
              <option>Semua status</option>
              <option>Selesai</option>
            </select>
          </div>

          {/* Tanggal */}
          <div className="relative">
            <HiCalendar
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-gray-400
                w-4
                h-4
              "
            />

            <input
              type="text"
              placeholder="Tanggal / Bulan"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="
                w-[150px]
                h-[38px]
                pl-9
                pr-3
                text-sm
                text-gray-600
                bg-white
                border
                border-gray-300
                rounded-lg
                outline-none
                focus:border-indigo-500
                focus:ring-1
                focus:ring-indigo-500
              "
            />
          </div>

          {/* Search */}
          <div className="relative flex-1">

            <HiSearch
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-gray-500
                w-4
                h-4
              "
            />

            <input
              type="text"
              placeholder="Cari Nama, Nim, atau Departemen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                h-[38px]
                pl-3
                pr-10
                text-sm
                text-gray-600
                bg-white
                border
                border-gray-300
                rounded-lg
                outline-none
                focus:border-indigo-500
                focus:ring-1
                focus:ring-indigo-500
              "
            />

          </div>
        </div>
        <div className="
          bg-white
          border
          border-gray-300
          rounded-xl
          overflow-hidden
        ">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              {/* Table Header */}
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">

                  <th className="
                    px-4
                    py-3
                    text-left
                    font-semibold
                    text-gray-700
                    w-[50px]
                  ">
                    No
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-left
                    font-semibold
                    text-gray-700
                  ">
                    Nama
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-left
                    font-semibold
                    text-gray-700
                  ">
                    NIM
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-left
                    font-semibold
                    text-gray-700
                  ">
                    Tanggal
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-left
                    font-semibold
                    text-gray-700
                  ">
                    Departemen
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-left
                    font-semibold
                    text-gray-700
                  ">
                    Status
                  </th>

                  <th className="
                    px-4
                    py-3
                    text-center
                    font-semibold
                    text-gray-700
                    w-[120px]
                  ">
                    Aksi
                  </th>

                </tr>
              </thead>

              {/* Table Body */}
              <tbody>

                {filteredMahasiswa.length > 0 ? (
                  filteredMahasiswa.map((item, index) => (

                    <tr
                      key={item.id}
                      className="
                        border-b
                        border-gray-200
                        last:border-b-0
                        hover:bg-gray-50
                        transition
                      "
                    >

                      {/* No */}
                      <td className="
                        px-4
                        py-3
                        text-gray-600
                      ">
                        {index + 1}.
                      </td>

                      {/* Nama */}
                      <td className="
                        px-4
                        py-3
                        font-medium
                        text-gray-800
                      ">
                        {item.nama}
                      </td>

                      {/* NIM */}
                      <td className="
                        px-4
                        py-3
                        text-gray-600
                      ">
                        {item.nim}
                      </td>

                      {/* Tanggal */}
                      <td className="
                        px-4
                        py-3
                        text-gray-600
                      ">
                        {item.tanggal}
                      </td>

                      {/* Departemen */}
                      <td className="
                        px-4
                        py-3
                        text-gray-600
                      ">
                        {item.departemen}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">

                        <span className="
                          inline-flex
                          items-center
                          justify-center
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-medium
                          text-emerald-600
                          bg-emerald-50
                          border
                          border-emerald-200
                        ">
                          Selesai
                        </span>

                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3">

                        <div className="flex justify-center">

                          <button
                            onClick={() =>
                              console.log(
                                "Detail mahasiswa:",
                                item
                              )
                            }
                            className="
                              px-3
                              py-1.5
                              rounded-full
                              border
                              border-indigo-300
                              text-indigo-600
                              bg-white
                              text-xs
                              font-medium
                              hover:bg-indigo-50
                              transition
                              whitespace-nowrap
                            "
                          >
                            Lihat Detail
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))
                ) : (

                  <tr>
                    <td
                      colSpan="7"
                      className="
                        px-4
                        py-10
                        text-center
                        text-gray-500
                      "
                    >
                      Data mahasiswa tidak ditemukan.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>
        <div className="
          flex
          items-center
          justify-center
          gap-5
          mt-5
          text-sm
        ">

          <button
            disabled
            className="
              text-gray-400
              cursor-not-allowed
            "
          >
            ← Previous
          </button>

          <button
            className="
              w-7
              h-7
              rounded-md
              bg-gray-800
              text-white
              text-xs
              font-medium
            "
          >
            1
          </button>

          <button
            className="
              text-gray-600
              hover:text-indigo-600
            "
          >
            2
          </button>

          <button
            className="
              text-gray-600
              hover:text-indigo-600
            "
          >
            3
          </button>

          <span className="text-gray-500">
            ...
          </span>

          <button
            className="
              text-gray-600
              hover:text-indigo-600
            "
          >
            67
          </button>

          <button
            className="
              text-gray-600
              hover:text-indigo-600
            "
          >
            68
          </button>

          <button
            className="
              text-gray-700
              hover:text-indigo-600
            "
          >
            Next →
          </button>

        </div>

      </main>

    </div>
  );
}