import { useState, useEffect } from "react";
import SidebarMahaComp from "../components/SidebarMahaComp";
import { Label, TextInput, Button } from "flowbite-react";
import axios from "axios";

export default function BuatPengajuan() {
  const userData = JSON.parse(localStorage.getItem("user") || "null");
  const nama = userData?.nama || "";
  const nim = userData?.nim || "";

  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const cekStatusPengajuan = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://10.6.64.238:8000/api/bebas-pustaka", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Ambil array daftar data dari pagination Laravel
      const listData = response.data?.data?.data || response.data?.data || [];

      // Cari data pengajuan milik mahasiswa yang sedang login (cocokkan NIM atau Nama)
      const pengajuanSaya = Array.isArray(listData)
        ? listData.find(
            (item) =>
              String(item.nim) === String(nim) ||
              String(item.user_id) === String(userData?.id) ||
              item.nama?.toLowerCase() === nama.toLowerCase()
          )
        : null;

      console.log("DATA PENGAJUAN SAYA:", pengajuanSaya);

      // Cek apakah statusnya sudah diverifikasi
      if (
        pengajuanSaya &&
        (pengajuanSaya.status === "verified" ||
          pengajuanSaya.status === "disetujui" ||
          pengajuanSaya.status === "selesai" ||
          pengajuanSaya.status === 1 ||
          pengajuanSaya.is_verified === true)
      ) {
        setIsVerified(true);
      }
    } catch (error) {
      console.log("Error mengambil status:", error);
    }
  };

  useEffect(() => {
    if (nim || userData) {
      cekStatusPengajuan();
    }
  }, [nim]);

  const handleKirim = async () => {
    if (loading || isVerified) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://10.6.64.238:8000/api/bebas-pustaka",
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Pengajuan berhasil dikirim!");
      cekStatusPengajuan();
    } catch (error) {
      alert(error.response?.data?.message || "Pengajuan gagal dikirim.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarMahaComp />
      <main className="ml-64 p-8">
        <h2 className="text-4xl font-bold mb-10"> Buat Pengajuan </h2>
        <div className="grid grid-cols-2 gap-10">
          
          {/* Kolom Kiri */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-5">
              <Label htmlFor="nama" value="Nama Lengkap"> Nama Lengkap</Label>
              <TextInput id="nama" value={nama || ""} readOnly />
            </div>
            <div className="mb-8">
              <Label htmlFor="nim" value="NIM">NIM</Label>
              <TextInput id="nim" value={nim || ""} readOnly />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleKirim}
                disabled={loading || isVerified}
                className="bg-[#35279A] hover:bg-[#281d79] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Mengirim..." : isVerified ? "Sudah Diverifikasi" : "Kirim"}
              </Button>
            </div>
          </div>

          {/* Kolom Kanan: Checklist Tanda Tangan */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-center font-medium mb-5"> Tanda Tangan Pustakawan </h2>
            <div className="rounded-lg h-64 flex flex-col items-center justify-center">
              {isVerified ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                    <svg
                      className="w-12 h-12 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-green-600 font-semibold text-lg">
                    Verifikasi Selesai
                  </span>
                </div>
              ) : (
                <span className="text-gray-400"> Belum ada tanda tangan </span>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}