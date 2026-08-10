import { Card, Dropdown } from "flowbite-react";
import { HiDocumentText, HiCheckCircle, HiXCircle, HiBell } from "react-icons/hi";
import { useState } from "react";

export default function AtasanDashboard() {
  const [hasNotif, setHasNotif] = useState(true);

  return (
    <div className="w-full relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Atasan</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau kinerja dan data clearing online</p>
        </div>

        <div>
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <button className="relative p-2 text-gray-600 bg-white rounded-full hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm">
                <HiBell className="w-6 h-6" />
                {hasNotif && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white transform translate-x-1/4 -translate-y-1/4"></span>
                )}
              </button>
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-medium text-gray-900">Notifikasi</span>
              <span className="block text-sm text-gray-500">Ada 3 notifikasi baru</span>
            </Dropdown.Header>
            
            <Dropdown.Item onClick={() => setHasNotif(false)}>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">Pengajuan Baru</span>
                <span className="text-xs text-gray-500">Mahasiswa atas nama Rizki Maulana mengajukan clearing.</span>
              </div>
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setHasNotif(false)}>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">Verifikasi Selesai</span>
                <span className="text-xs text-gray-500">Sodikmomoko telah diverifikasi oleh Pustakawan.</span>
              </div>
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setHasNotif(false)}>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">Dokumen Ditolak</span>
                <span className="text-xs text-gray-500">Pengajuan Mursalino Abroho perlu perbaikan.</span>
              </div>
            </Dropdown.Item>
            
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setHasNotif(false)} className="text-center text-blue-600 font-medium">
              Tandai semua telah dibaca
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm text-gray-500 font-medium">Total Pengajuan</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">50</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <HiDocumentText className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm text-gray-500 font-medium">Sudah Disetujui</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">30</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <HiCheckCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm text-gray-500 font-medium">Sudah Ditolak</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">20</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <HiXCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}