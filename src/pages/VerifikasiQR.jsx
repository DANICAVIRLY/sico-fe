import { Card, Button } from "flowbite-react";
import { Link, useParams } from "react-router-dom";
import { HiCheckCircle, HiArrowLeft } from "react-icons/hi";

export default function VerifikasiQR() {
  // Ambil ID dari URL
  const { id } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e6f6e9] p-4">
      <div className="w-full max-w-4xl flex flex-col items-center">
        
        {/* Ikon Centang Hijau Besar */}
        <div className="bg-green-500 rounded-full p-4 mb-4 text-white shadow-lg">
          <HiCheckCircle className="w-16 h-16" />
        </div>

        {/* Judul */}
        <h1 className="text-3xl font-bold text-green-700 text-center mb-1">
          Dokumen Terverifikasi
        </h1>
        <p className="text-sm text-green-600 text-center mb-8">
          Dokumen telah diverifikasi dan terdaftarkan pada sistem
        </p>

        {/* Kartu Informasi Dokumen (Tabel) */}
        <Card className="w-full shadow-lg rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            
            {/* Kolom Kiri */}
            <div className="p-6 space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">Jenis clearing</span>
                <span className="text-gray-900 text-sm">Clearing perpustakaan</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">nama mahasiswa</span>
                <span className="text-gray-900 text-sm">Cheam Bulley</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">NIM</span>
                <span className="text-gray-900 text-sm">12445656778</span>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="p-6 space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">penandatangan</span>
                <span className="text-gray-900 text-sm">Naufal Azmi</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">jabatan</span>
                <span className="text-gray-900 text-sm">Rektor UI</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">tanggal terbit</span>
                <span className="text-gray-900 text-sm">30 juli 2026</span>
              </div>
            </div>
          </div>

          {/* Footer Kartu: Status Hijau & Tombol */}
          <div className="bg-[#e6f6e9] p-4 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-xl border-t border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <HiCheckCircle className="w-5 h-5" />
              <span>status</span>
              <span className="font-bold">Dokumen Sah</span>
            </div>
            <Button className="bg-[#2e1a7a] hover:bg-[#1e1260] w-full md:w-auto">
              Lihat dokumen
            </Button>
          </div>
        </Card>

        {/* Tombol Kembali */}
        <div className="mt-6">
          <Link to="/data-mahasiswa-atasan">
            <Button color="light" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}