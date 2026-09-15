import { Card, Button } from "flowbite-react";
import { Link, useLocation } from "react-router-dom";
import { HiCheckCircle, HiArrowLeft } from "react-icons/hi";

export default function VerifikasiBerhasil() {
  // Ambil data yang dikirim dari halaman DetailVerifikasi
  const location = useLocation();
  const {
    nama = "-",
    nim = "-",
    tanggal = "-",
    departemen = "-",
    diverifikasiOleh = "-",
    catatanPustakawan = "-",
  } = location.state || {};

  const rows = [
    { label: "Nama", value: nama },
    { label: "NIM", value: nim },
    { label: "Tanggal", value: tanggal },
    { label: "Diverifikasi Oleh", value: diverifikasiOleh },
    { label: "Departemen", value: departemen },
    { label: "Catatan", value: catatanPustakawan },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      {/* Judul Halaman */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-800">Hasil Verifikasi</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          data mahasiswa - detail - surat bebas clearing
        </p>
      </div>

      {/* Kartu Utama */}
      <Card className="w-full shadow-md">
        <div className="flex flex-col items-center p-3 sm:p-6">
          {/* 1. Ikon Centang Hijau Besar */}
          <div className="bg-green-500 rounded-full p-3 sm:p-4 mb-4 text-white">
            <HiCheckCircle className="w-9 h-9 sm:w-12 sm:h-12" />
          </div>

          {/* 2. Judul Status */}
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center px-2">
            Verifikasi Perpustakaan Berhasil
          </h2>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-6 px-2">
            Mahasiswa dinyatakan bebas pustaka
          </p>

          {/* 3. Data Mahasiswa - stack di mobile, 2 kolom di layar >= sm */}
          <div className="w-full border border-gray-200 rounded-lg overflow-hidden mb-6">
            {rows.map((row, index) => (
              <div
                key={row.label}
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  index !== rows.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <div className="p-3 sm:p-4 bg-gray-50 font-bold text-gray-700 border-b sm:border-b-0 sm:border-r border-gray-200 text-sm sm:text-base">
                  {row.label}
                </div>
                <div className="p-3 sm:p-4 text-gray-800 text-sm sm:text-base break-words">
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          {/* 5. Tombol Kembali */}
          <Link to="/data-pengajuan" className="w-full sm:w-auto">
            <Button
              color="light"
              className="w-full sm:w-auto border border-gray-300 text-blue-600 font-medium hover:bg-gray-50"
            >
              <HiArrowLeft className="mr-2 h-5 w-5" />
              Kembali Ke Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}