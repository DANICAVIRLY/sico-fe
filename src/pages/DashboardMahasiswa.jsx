import { useEffect, useState } from 'react';
import { Card, Button } from 'flowbite-react';
import SidebarMahaComp from '../components/SidebarMahaComp';
import TimelineProgress from '../components/TimelineProgress';

export default function DashboardMahasiswa() {
  const [nama, setNama] = useState("");

  useEffect(() => {
    // Data user login disimpan sebagai object JSON di key "user",
    // bukan sebagai string terpisah di key "nama".
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setNama(userData?.nama || "Mahasiswa");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarMahaComp />

      <main className="ml-64 p-8">
        <div className="w-full">

          {/* HEADER */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Halo!, {nama}
            </h1>

            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Berikut Ringkasan Crealing Anda
            </p>
          </div>

          {/* TIMELINE */}
          <TimelineProgress status="pengajuan_clearing" />

          {/* DOKUMEN SELESAI */}
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-4">
              Dokumen Selesai
            </h3>

            <Card className="rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">

                {/* BAGIAN KIRI */}
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Clearing Perpustakaan
                  </h3>

                  <p className="text-xs text-gray-500 mt-4">
                    Selesai pada 15 Mei 2026
                  </p>

                  <div className="flex gap-2 mt-6">
                    <Button size="xs" outline>
                      Lihat PDF
                    </Button>

                    <Button size="xs" outline>
                      Download
                    </Button>
                  </div>
                </div>

                {/* BAGIAN KANAN */}
                <div className="flex items-center gap-4">

                  {/* QR CODE */}
                  <div className="w-24 h-24 flex items-center justify-center">
                    <img
                      src="/qrcode.png"
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* TEKS */}
                  <div className="w-28">
                    <h3 className="text-xs font-bold text-gray-900 leading-tight">
                      Scan untuk verifikasi dokumen ini
                    </h3>
                  </div>

                </div>
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}