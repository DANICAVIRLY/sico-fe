import { useNavigate } from "react-router-dom";
import { HiDownload } from "react-icons/hi";
import SidebarAdminComp from "../components/SidebarAdminComp";

export default function DetailSelesai() {
  const navigate = useNavigate();

  // Data sementara
  const mahasiswa = {
    nama: "Arlin Nurliani",
    nim: "12340056",
    departemen: "Hasil Hutan",
    tanggal: "20 Mei 2026",
  };

  const handleDownload = () => {
    alert("Dokumen Word sedang diproses...");
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex">

      {/* SIDEBAR */}
      <SidebarAdminComp />

      {/* CONTENT */}
      <main className="flex-1 min-w-0 p-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <h1 className="text-3xl font-bold text-gray-900">
            Data Mahasiswa
          </h1>

          <span
            className="
              px-5
              py-2
              rounded-md
              bg-emerald-100
              text-emerald-700
              text-sm
              font-semibold
            "
          >
            Selesai
          </span>

        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">

          <div
            className="
              bg-white
              border-2
              border-indigo-500
              rounded-xl
              p-6
              min-h-[300px]
              shadow-sm
            "
          >

            <div className="space-y-6">

              {/* Nama */}
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Nama
                </p>

                <p className="mt-1 text-base text-gray-600">
                  {mahasiswa.nama}
                </p>
              </div>

              {/* NIM */}
              <div>
                <p className="text-sm font-bold text-gray-900">
                  NIM
                </p>

                <p className="mt-1 text-base text-gray-600">
                  {mahasiswa.nim}
                </p>
              </div>

              {/* Departemen */}
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Departemen
                </p>

                <p className="mt-1 text-base text-gray-600">
                  {mahasiswa.departemen}
                </p>
              </div>

              {/* Tanggal */}
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Tanggal Pengajuan
                </p>

                <p className="mt-1 text-base text-gray-600">
                  {mahasiswa.tanggal}
                </p>
              </div>

            </div>

          </div>
          <div
            className="
              bg-white
              border
              border-gray-300
              rounded-xl
              p-6
              min-h-[300px]
              shadow-sm
              flex
              flex-col
            "
          >

            <div className="flex justify-between items-start">

              {/* Bagian kiri */}
              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Clearing
                </h2>

                <button
                  onClick={handleDownload}
                  className="
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    bg-indigo-600
                    hover:bg-indigo-700
                    text-white
                    rounded-md
                    text-sm
                    font-medium
                    transition
                  "
                >
                  <HiDownload className="w-4 h-4" />
                  Download As Word
                </button>

              </div>
              <div className="text-center">

                <p className="text-xs font-semibold text-gray-700 max-w-[120px]">
                  Scan untuk verifikasi dokumen ini
                </p>

                <div className="mt-3 flex justify-center">

                  {/* QR sementara */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Clearing-12340056"
                    alt="QR Code Verifikasi"
                    className="w-28 h-28"
                  />

                </div>

              </div>

            </div>

          </div>

        </div>
        <div className="flex justify-end mt-5">

          <button
            onClick={() => navigate("/selesai")}
            className="
              px-5
              py-2
              bg-indigo-600
              hover:bg-indigo-700
              text-white
              rounded-md
              text-sm
              font-medium
              transition
            "
          >
            Kembali
          </button>

        </div>

      </main>

    </div>
  );
}