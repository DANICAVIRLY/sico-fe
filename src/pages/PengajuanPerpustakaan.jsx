import SidebarMahaComp from "../components/SidebarMahaComp";
import { Label, TextInput, Button } from "flowbite-react";

export default function BuatPengajuan() {
    const nama = localStorage.getItem("nama");
    const nim = localStorage.getItem("nim");

  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarMahaComp />
      <main className="ml-64 p-8">
            <h2 className="text-4xl font-bold mb-10">Buat Pengajuan</h2>
            <div className="grid grid-cols-2 gap-10">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="mb-5">
                    <Label htmlFor="nama" value="Nama" />
                    <TextInput value={nama} readOnly />
                    </div>
                    <div className="mb-8">
                    <Label htmlFor="nim" value="NIM" />
                    <TextInput value={nim} readOnly />
                    </div>
                    <div className="flex justify-end">
                    <Button className="bg-[#35279A] hover:bg-[#281d79]"> Kirim </Button>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-center font-medium mb-5">Tanda Tangan Pustakawan</h2>
                    <div className="rounded-lg h-64 flex items-center justify-center">
                        <span className="text-gray-400"> Belum ada tanda tangan </span>
                    </div>
                </div>
            </div>
      </main>
    </div>
  );
}