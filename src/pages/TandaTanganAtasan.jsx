import { Card, Button } from "flowbite-react";
import { Link, useParams } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";

export default function TandaTanganAtasan() {
  const { id } = useParams();

  return (
    <div className="max-w-6xl mx-auto p-4">
      
      {/* Link Navigasi */}
      <div className="text-sm text-gray-500 mb-4 flex gap-2">
        <Link to="/dashboard-atasan" className="hover:underline">Dashboard</Link>
        <span>›</span>
        <Link to="/data-mahasiswa-atasan" className="hover:underline">Menunggu Tanda Tangan</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">Tanda Tangan</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">tanda_tangan_atasan</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BAGIAN KIRI: Preview Dokumen (Kotak Hijau) */}
        <div className="bg-[#e6f6e9] p-8 rounded-xl border border-green-200 min-h-[500px] flex flex-col items-center justify-center relative">
          <h3 className="text-lg font-bold text-gray-800 mb-6 w-full text-left">Preview Dokumen</h3>
          
          {/* Simulasi Kertas Dokumen */}
          <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md h-[400px] relative">
            {/* Garis-garis simulasi teks */}
            <div className="space-y-3 mt-8">
              <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-full mt-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
            {/* Tempat Tanda Tangan */}
            <div className="absolute bottom-8 right-8 w-24 h-12 bg-blue-100 rounded border border-blue-300 flex items-center justify-center text-blue-500 text-xs font-medium">
              Tanda Tangan
            </div>
          </div>
        </div>

        {/* BAGIAN KANAN: Informasi & Aksi */}
        <div className="space-y-6">
          
          {/* Kartu Informasi Dokumen */}
          <Card className="shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Informasi Dokumen</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Jenis Pengajuan</span>
                <span className="text-gray-900">Clearing</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Nama</span>
                <span className="text-gray-900">Cheam Bulley</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">NIM</span>
                <span className="text-gray-900">12445656778</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">Tanggal Pengajuan</span>
                <span className="text-gray-900">20 Mei 1845</span>
              </div>
            </div>
          </Card>

          {/* Kartu Tindakan / Tombol */}
          <Card className="shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Tindakan</h3>
            <p className="text-sm text-gray-500 mb-4">
              Dengan menandatangani dokumen ini, anda menyetujui dokumen tersebut.
            </p>
            
            <div className="flex flex-col gap-3">
           <Link to={`/verifikasi-qr/${id}`} className="w-full">
  <Button className="w-full bg-[#2e1a7a] hover:bg-[#1e1260] text-white font-bold py-2.5">
    Setujui & Tandatangani
  </Button>
</Link>
              <Button className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2.5">
                Tolak Dokumen
              </Button>
            </div>
          </Card>

          {/* Tombol Kembali ke Tabel */}
          <div className="pt-2">
            <Link to="/data-mahasiswa-atasan">
              <Button color="gray" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 w-full lg:w-auto">
                <HiArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}