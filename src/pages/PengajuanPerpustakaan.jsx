import { useState, useEffect } from "react";
import SidebarMahaComp from "../components/SidebarMahaComp";
import { Label, TextInput, Button } from "flowbite-react";
import axios from "axios";

const API_BASE = "http://10.6.65.93:8000/api/bebas-pustaka";

export default function BuatPengajuan() {
  const userData = JSON.parse(localStorage.getItem("user") || "null");
  const nama = userData?.nama || "";
  const nim = userData?.nim || "";

  const [loading, setLoading] = useState(false);
  // status: null | "pending" | "verified" | "revisi"
  const [status, setStatus] = useState(null);
  const [catatanRevisi, setCatatanRevisi] = useState("");
  const [pengajuanId, setPengajuanId] = useState(null);

  const cekStatusPengajuan = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API_BASE, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const listData = response.data?.data?.data || response.data?.data || [];

      const semuaPengajuanSaya = Array.isArray(listData)
        ? listData.filter(
            (item) =>
              String(item.nim) === String(nim) ||
              String(item.user_id) === String(userData?.id) ||
              item.nama?.toLowerCase() === nama.toLowerCase()
          )
        : [];

      if (semuaPengajuanSaya.length === 0) {
        setStatus(null);
        setCatatanRevisi("");
        setPengajuanId(null);
        return;
      }

      // Ambil yang id-nya paling besar (paling baru)
      const pengajuanSaya = semuaPengajuanSaya.reduce((terbaru, item) =>
        item.id > terbaru.id ? item : terbaru
      );

      console.log("DATA PENGAJUAN SAYA (dipakai):", pengajuanSaya);

      setPengajuanId(pengajuanSaya.id);

      // Enum backend: 'menunggu' | 'disetujui' | 'revisi'
      const rawStatus = String(pengajuanSaya.status ?? "").toLowerCase();

      if (rawStatus === "revisi") {
        setStatus("revisi");
        setCatatanRevisi(pengajuanSaya.catatan_revisi || "");
      } else if (rawStatus === "disetujui") {
        setStatus("verified");
        setCatatanRevisi("");
      } else {
        // "menunggu" atau status lain -> anggap pending
        setStatus("pending");
        setCatatanRevisi("");
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

  const isVerified = status === "verified";
  const isPending = status === "pending";
  const isRevisi = status === "revisi";

  const tombolDisabled = loading || isVerified || isPending;

  const handleKirim = async () => {
    if (tombolDisabled) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      if (isRevisi && pengajuanId) {
        await axios.post(`${API_BASE}/${pengajuanId}/ajukan-ulang`, {}, { headers });
        alert("Pengajuan ulang berhasil dikirim!");
      } else {
        await axios.post(API_BASE, {}, { headers });
        alert("Pengajuan berhasil dikirim!");
      }

      cekStatusPengajuan();
    } catch (error) {
      alert(error.response?.data?.message || "Pengajuan gagal dikirim.");
    } finally {
      setLoading(false);
    }
  };

  const labelTombol = () => {
    if (loading) return "Mengirim...";
    if (isVerified) return "Sudah Diverifikasi";
    if (isPending) return "Menunggu Verifikasi";
    if (isRevisi) return "Ajukan Ulang";
    return "Kirim";
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
            <div className="mb-5">
              <Label htmlFor="nim" value="NIM">NIM</Label>
              <TextInput id="nim" value={nim || ""} readOnly />
            </div>

            {isRevisi && (
              <div className="mb-5 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                <p className="font-semibold mb-1">Pengajuan perlu direvisi</p>
                <p>{catatanRevisi || "Pustakawan tidak menyertakan catatan."}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleKirim}
                disabled={tombolDisabled}
                className="bg-[#35279A] hover:bg-[#281d79] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {labelTombol()}
              </Button>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-center font-medium mb-5"> Tanda Tangan Pustakawan </h2>
            <div className="rounded-lg h-64 flex flex-col items-center justify-center">
              {isVerified ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-green-600 font-semibold text-lg">Verifikasi Selesai</span>
                </div>
              ) : isRevisi ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.14A1 1 0 003 19h18a1 1 0 00.89-1.45L13.71 3.86a1 1 0 00-1.72 0z" />
                    </svg>
                  </div>
                  <span className="text-yellow-600 font-semibold text-lg">Perlu Revisi</span>
                </div>
              ) : isPending ? (
                <span className="text-gray-400">Menunggu verifikasi pustakawan</span>
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