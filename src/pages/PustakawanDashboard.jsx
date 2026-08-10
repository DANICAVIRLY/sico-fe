import { Card } from 'flowbite-react';
import { HiDocumentText, HiCheckCircle, HiClock, HiXCircle } from 'react-icons/hi';

export default function PustakawanDashboard() {
  return (
    <div className="w-full">
      
      {/* Judul Halaman */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Pustakawan</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">Kelola dan verifikasi bebas pustaka mahasiswa</p>
      </div>

      {/* Grid Kartu - Responsif: 1 kolom di HP, 2 di tablet, 4 di laptop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Kartu 1 */}
        <Card className="border-t-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <HiDocumentText className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-end">
              <p className="text-xs md:text-sm text-gray-500 font-medium">Total Pengajuan</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">200</p>
            </div>
          </div>
        </Card>

        {/* Kartu 2 */}
        <Card className="border-t-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <HiCheckCircle className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-end">
              <p className="text-xs md:text-sm text-gray-500 font-medium">Sudah Diverifikasi</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">200</p>
            </div>
          </div>
        </Card>

        {/* Kartu 3 */}
        <Card className="border-t-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
              <HiClock className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-end">
              <p className="text-xs md:text-sm text-gray-500 font-medium">Menunggu Verifikasi</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">200</p>
            </div>
          </div>
        </Card>

        {/* Kartu 4 */}
        <Card className="border-t-4 border-red-500">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <HiXCircle className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-end">
              <p className="text-xs md:text-sm text-gray-500 font-medium">Ditolak</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">200</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}