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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Judul Halaman */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Hasil Verifikasi</h1>
        <p className="text-sm text-gray-500 mt-1">
          data mahasiswa - detail - surat bebas clearing
        </p>
      </div>

      {/* Kartu Utama */}
      <Card className="w-full shadow-md">
        <div className="flex flex-col items-center p-6">
          {/* 1. Ikon Centang Hijau Besar */}
          <div className="bg-green-500 rounded-full p-4 mb-4 text-white">
            <HiCheckCircle className="w-12 h-12" />
          </div>

          {/* 2. Judul Status */}
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Verifikasi Perpustakaan Berhasil
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Mahasiswa dinyatakan bebas pustaka
          </p>

          {/* 3. Tabel Data Mahasiswa (2 Kolom dengan Border) */}
          <div className="w-full border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="grid grid-cols-2 border-b border-gray-200">
              <div className="p-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">Nama</div>
              <div className="p-4 text-gray-800">{nama}</div>
            </div>
            <div className="grid grid-cols-2 border-b border-gray-200">
              <div className="p-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">NIM</div>
              <div className="p-4 text-gray-800">{nim}</div>
            </div>
            <div className="grid grid-cols-2 border-b border-gray-200">
              <div className="p-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">Tanggal</div>
              <div className="p-4 text-gray-800">{tanggal}</div>
            </div>
            <div className="grid grid-cols-2 border-b border-gray-200">
              <div className="p-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">Diverifikasi Oleh</div>
              <div className="p-4 text-gray-800">{diverifikasiOleh}</div>
            </div>
            <div className="grid grid-cols-2 border-b border-gray-200">
              <div className="p-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">Departemen</div>
              <div className="p-4 text-gray-800">{departemen}</div>
            </div>
            {/* 4. Baris Catatan (Dinamis dari input sebelumnya) */}
            <div className="grid grid-cols-2">
              <div className="p-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">Catatan</div>
              <div className="p-4 text-gray-800">{catatanPustakawan}</div>
            </div>
          </div>

          {/* 5. Tombol Kembali */}
          <Link to="/data-pengajuan">
            <Button color="light" className="border border-gray-300 text-blue-600 font-medium hover:bg-gray-50">
              <HiArrowLeft className="mr-2 h-5 w-5" />
              Kembali Ke Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}