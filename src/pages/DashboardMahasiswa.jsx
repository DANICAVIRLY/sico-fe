import { Card, Button } from 'flowbite-react';
import { HiDocumentText, HiCheckCircle, HiClock, HiXCircle } from 'react-icons/hi';
import SidebarMahaComp from '../components/SidebarMahaComp';
import { FcDocument } from "react-icons/fc";

export default function DashboardMahasiswa() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarMahaComp />
        <main className="ml-64 p-8">
          <div className="w-full">
            <div className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Halo!, Arlin Nurliani</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Berikut Ringkasan Crealing Anda</p>
            </div>
            <Card className="mt-8 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-blue-800">Tahapan Proses Clearing</h3>
                <span className="text-sm font-semibold text-blue-800">2/4</span>
              </div>
              <div className="relative flex justify-between items-start">
                <div className="absolute top-5 left-12 right-12 h-1 bg-gray-300"></div>
                <div className="relative flex flex-col items-center w-1/4">
                    <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-blue-600">
                        <FcDocument className="text-blue-700" />
                    </div>
                    <p className="mt-3 text-center font-medium">
                      Surat Bebas Pustaka
                    </p>
                </div>
                <div className="relative flex flex-col items-center w-1/4">
                    <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-blue-600">
                      <FcDocument className="text-blue-700" />
                    </div>
                    <p className="mt-3 text-center font-medium">
                      Pengajuan Clearing
                    </p>
                </div>
                <div className="relative flex flex-col items-center w-1/4">
                    <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-300">
                      <FcDocument className="text-blue-700" />
                    </div>
                    <p className="mt-3 text-center font-medium">
                      Verifikasi Admin
                    </p>
                </div>
                <div className="relative flex flex-col items-center w-1/4">
                    <div className="z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-300">
                      <FcDocument className="text-blue-700" />
                    </div>
                    <p className="mt-3 text-center font-medium">
                      Verifikasi Kabag TU
                    </p>
                </div>
              </div>
            </Card>

            <div className="mt-10">
              <h3 className="text-xl font-bold mb-4">
                Dokumen Selesai
              </h3>
              <Card className="rounded-xl shadow-sm">
                <div className="grid grid-cols-3 items-center gap-8">
                  <div>
                    <h3 className="text-2xl font-bold">Clearing Perpustakaan</h3>
                    <p className="text-gray-500 mt-6">Selesai pada 15 Mei 2026</p>
                    <div className="flex gap-3 mt-8">
                      <Button color="light" outline> Lihat PDF</Button>
                      <Button color="light" outline> Download </Button>
                    </div>
                  </div>
                  {/* <div className="flex justify-center">
                    <img src={qr}  alt="QR Code"  className="w-40 h-40" />
                  </div> */}
                  <div>
                    <h3 className="text-xl font-semibold">Scan untuk verifikasi dokumen ini</h3>
                    <p className="text-gray-500 mt-3">QR Code ini digunakan untuk memverifikasi keaslian surat clearing.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
     </div>
    
  );
}