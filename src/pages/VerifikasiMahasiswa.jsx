import { HiEye, HiDownload, HiCheck } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import SidebarAdminComp from "../components/SidebarAdminComp";

export default function VerifikasiMahasiswa() {
    const navigate = useNavigate();

    const mahasiswa = {
        nama: "Marvelino Abraha",
        nim: "3456789012",
        departemen: "Hasil Hutan",
        tanggal: "20 Mei 2026",
    };

    const dokumen = [
        {
        nama: "SPP",
        file: "bukti-spp.pdf",
        },
        {
        nama: "Surat Bebas Tanggungan Keuangan",
        file: "surat-keuangan.pdf",
        },
        {
        nama: "Distribusi Skripsi",
        file: "distribusi-skripsi.pdf",
        },
        {
        nama: "KTM (Kartu Tanda Mahasiswa)",
        file: "ktm.pdf",
        },
    ];

    const handleRevisi = () => {
        alert("Pengajuan dikembalikan untuk diperbaiki.");
    };

    const handleSetujui = () => {
        alert("Pengajuan disetujui dan dikirim ke atasan.");
    };

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <SidebarAdminComp />
      <main className="ml-64 min-h-screen p-8">

        <div className="mb-7 flex items-start justify-between">

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Data Mahasiswa
            </h1>

            {/* BREADCRUMB */}
            <div className="mt-2 flex items-center gap-1 text-sm">

              <span
                onClick={() => navigate("/dashboard-admin")}
                className="cursor-pointer text-blue-600 hover:underline"
              >
                Dashboard
              </span>

              <span className="text-gray-400">
                ›
              </span>

              <span
                onClick={() => navigate("/data-mahasiswa")}
                className="cursor-pointer text-blue-600 hover:underline"
              >
                Pengajuan
              </span>

              <span className="text-gray-400">
                ›
              </span>

              <span className="text-gray-700">
                Verifikasi
              </span>

            </div>

          </div>


          {/* DATABASE KEUANGAN */}
          <button
            className="
              rounded-lg
              bg-[#20d6b2]
              px-6
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#17c7a4]
            "
          >
            Database Keuangan
          </button>

        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-7
            lg:grid-cols-[400px_minmax(0,1fr)]
            items-start
          "
        >

          <div
            className="
              w-full
              min-h-[350px]
              rounded-xl
              border
              border-gray-300
              bg-white
              p-7
              shadow-sm
            "
          >

            <div className="space-y-7">


              {/* NAMA */}
              <div>

                <p className="mb-2 text-base font-bold text-gray-900">
                  Nama
                </p>

                <p className="text-base text-gray-600">
                  {mahasiswa.nama}
                </p>

              </div>


              {/* NIM */}
              <div>

                <p className="mb-2 text-base font-bold text-gray-900">
                  NIM
                </p>

                <p className="text-base text-gray-600">
                  {mahasiswa.nim}
                </p>

              </div>


              {/* DEPARTEMEN */}
              <div>

                <p className="mb-2 text-base font-bold text-gray-900">
                  Departemen
                </p>

                <p className="text-base text-gray-600">
                  {mahasiswa.departemen}
                </p>

              </div>


              {/* TANGGAL PENGAJUAN */}
              <div>

                <p className="mb-2 text-base font-bold text-gray-900">
                  Tanggal Pengajuan
                </p>

                <p className="text-base text-gray-600">
                  {mahasiswa.tanggal}
                </p>

              </div>


            </div>

          </div>

          <div className="w-full">

            <div
              className="
                w-full
                overflow-hidden
                rounded-xl
                border
                border-gray-300
                bg-white
                shadow-sm
              "
            >


              {/* HEADER DOKUMEN */}

              <div
                className="
                  border-b
                  border-gray-200
                  px-6
                  py-4
                "
              >

                <h2 className="text-lg font-bold text-gray-900">
                  Dokumen Persyaratan
                </h2>

              </div>



              {/* LIST DOKUMEN */}

              <div>

                {dokumen.map((doc, index) => (

                  <div
                    key={index}
                    className="
                      flex
                      min-h-[54px]
                      items-center
                      justify-between
                      border-b
                      border-gray-100
                      px-6
                      py-3
                    "
                  >


                    {/* NAMA DOKUMEN */}

                    <span className="text-base text-gray-700">
                      {doc.nama}
                    </span>



                    {/* BUTTON AKSI */}

                    <div
                      className="
                        flex
                        items-center
                        gap-5
                      "
                    >

                      {/* PREVIEW */}

                      <button
                        title="Preview dokumen"
                        className="
                          text-indigo-600
                          transition
                          hover:text-indigo-900
                        "
                      >

                        <HiEye className="h-5 w-5" />

                      </button>



                      {/* DOWNLOAD */}

                      <button
                        title="Download dokumen"
                        className="
                          text-indigo-600
                          transition
                          hover:text-indigo-900
                        "
                      >

                        <HiDownload className="h-5 w-5" />

                      </button>

                    </div>

                  </div>

                ))}

                <div
                  className="
                    flex
                    min-h-[54px]
                    items-center
                    justify-between
                    px-6
                    py-3
                  "
                >

                  <span className="text-base text-gray-700">
                    Keterangan Bebas Pustaka
                  </span>


                  <span
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-semibold
                      text-green-500
                    "
                  >

                    <HiCheck className="h-5 w-5" />

                    Lengkap

                  </span>

                </div>
              </div>

            </div>

            <div className="mt-6">

              <label
                className="
                  mb-2
                  block
                  text-base
                  font-bold
                  text-gray-900
                "
              >
                Catatan (Optional)
              </label>


              <textarea
                rows="4"
                placeholder="Masukkan catatan..."
                className="
                  w-full
                  resize-none
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  p-4
                  text-base
                  text-gray-700
                  placeholder:text-gray-400
                  outline-none
                  transition
                  focus:border-indigo-500
                  focus:ring-1
                  focus:ring-indigo-500
                "
              />

            </div>


          </div>

        </div>

        <div
          className="
            mt-8
            flex
            justify-end
            gap-5
          "
        >

          <button
            onClick={handleRevisi}
            className="
              min-w-[120px]
              rounded-lg
              bg-red-500
              px-7
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-red-600
            "
          >
            Revisi
          </button>

          <button
            onClick={handleSetujui}
            className="
              min-w-[220px]
              rounded-lg
              bg-indigo-600
              px-7
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-indigo-700
            "
          >
            Setuju & kirim ke atasan
          </button>


        </div>


      </main>

    </div>
  );
}