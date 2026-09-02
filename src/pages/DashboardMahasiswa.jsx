import { useEffect, useState } from 'react';
import { Card, Button, Badge } from 'flowbite-react';
import SidebarMahaComp from '../components/SidebarMahaComp';
import { HiCheckCircle, HiCheck, HiClock, HiQrcode, HiDeviceMobile } from 'react-icons/hi';
import axios from 'axios';

// =====================================================================
// PENTING: samain base URL ke satu tempat.
// Ganti ke '10.6.65.141' kalau ternyata itu yg jadi server aktif.
// =====================================================================
const API_BASE_URL = 'http://10.6.65.93:8000';

const STEPPER_ITEMS = [
  { label: 'Surat Bebas Pustaka' },
  { label: 'Pengajuan Clearing' },
  { label: 'Verifikasi Admin' },
  { label: 'Verifikasi Atasan' },
];

export default function DashboardMahasiswa() {
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(true);
  const [pengajuan, setPengajuan] = useState(null);
  const [tahapan, setTahapan] = useState(0);
  const [qrImageSrc, setQrImageSrc] = useState(null);
  const totalTahapan = 4;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setNama(userData?.nama || "Mahasiswa");
    fetchData();
  }, []);

  // =====================================================================
  // Endpoint asli backend: GET /api/pengajuan-clearing (index)
  // Endpoint lama "/pengajuan-clearing/{id}/surat" TIDAK ADA di backend,
  // jadi dihapus. Semua data (termasuk nomor_surat / qr_token, kalau ada)
  // diasumsikan sudah ikut di object item dari endpoint index/show ini.
  // Kalau field qr_token / nomor_surat belum ada di response,
  // itu perlu ditambahin di backend (controller reviewAtasan) saat
  // atasan approve dokumen.
  // =====================================================================
  const fetchData = () => {
    const token = localStorage.getItem("token");

    axios
      .get(`${API_BASE_URL}/api/pengajuan-clearing`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        // Backend mengembalikan hasil paginate Laravel:
        // response.data.data = { current_page, data: [...], last_page, ... }
        // jadi array asli ada di response.data.data.data
        const items = response.data?.data?.data || [];
        const item = items[0] || null;

        if (item) {
          setPengajuan(item);

          // Hitung tahapan berdasarkan status
          // Status asli dari backend: menunggu_ttd, disetujui, ditolak, dll.
          let step = 0;
          if (item.status === 'menunggu_ttd') step = 2;
          else if (item.status === 'disetujui') step = 4;
          else if (item.status === 'ditolak') step = 0;
          else step = 1; // fallback: sudah diajukan tapi belum diproses admin/atasan
          setTahapan(step);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const isSelesai = pengajuan && pengajuan.status === 'disetujui';

  // =====================================================================
  // Preview & Download pakai endpoint asli backend:
  // GET /pengajuan-clearing/{id}/preview-surat
  // GET /pengajuan-clearing/{id}/download-surat
  // Dipanggil pakai axios (bukan window.open + ?token=) karena endpoint-nya
  // butuh Authorization header, bukan query param.
  // =====================================================================
  const handlePreviewSurat = async () => {
    if (!pengajuan?.id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/pengajuan-clearing/${pengajuan.id}/preview-surat`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Gagal preview surat:", error.response?.data || error);
      alert("Gagal memuat preview surat.");
    }
  };

  const handleDownloadSurat = async () => {
    if (!pengajuan?.id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/pengajuan-clearing/${pengajuan.id}/download-surat`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `surat-clearing-${pengajuan?.nim || pengajuan.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal download surat:", error.response?.data || error);
      alert("Gagal mendownload surat.");
    }
  };

  // =====================================================================
  // QR pakai route asli backend (perhatikan path-nya dobel "pengajuan-clearing",
  // ini kemungkinan bug di routes/api.php, tapi dipakai apa adanya dulu
  // sesuai Opsi A). Kalau backend diperbaiki nanti, tinggal ganti path ini.
  //
  // PENTING: route ini kemungkinan besar dilindungi middleware auth,
  // sedangkan tag <img src="..."> TIDAK bisa mengirim header Authorization.
  // Makanya di-fetch pakai axios (blob) dulu, baru dikonversi ke object URL
  // dan dipasang ke <img>, sama seperti pola preview/download PDF.
  // =====================================================================
  useEffect(() => {
    if (!pengajuan?.id) return;

    let objectUrl = null;
    const token = localStorage.getItem("token");

    axios
      .get(`${API_BASE_URL}/api/pengajuan-clearing/pengajuan-clearing/${pengajuan.id}/qr`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      })
      .then((response) => {
        objectUrl = URL.createObjectURL(response.data);
        setQrImageSrc(objectUrl);
      })
      .catch((error) => {
        console.error("Gagal memuat QR code:", error.response?.data || error);
        setQrImageSrc(null);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pengajuan?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SidebarMahaComp />
        <div className="lg:ml-64 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-500">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarMahaComp />

      <main className="lg:ml-64 p-6 md:p-8">
        <div className="w-full">
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Halo!, {nama}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Berikut Ringkasan Clearing Anda
            </p>
          </div>

          <div className="mb-6">
            <Card className="border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-indigo-700">Tahapan Proses Clearing</h3>
                <span className="text-sm font-semibold text-indigo-600 whitespace-nowrap">
                  {tahapan}/{totalTahapan}
                </span>
              </div>

              <div className="flex items-start justify-between mt-4 px-2">
                {STEPPER_ITEMS.map((step, index) => {
                  const stepNumber = index + 1;
                  const isDone = tahapan >= totalTahapan ? true : stepNumber < tahapan;
                  const isActive = tahapan < totalTahapan && stepNumber === tahapan;
                  const isLineFilled = tahapan >= totalTahapan ? true : stepNumber <= tahapan;

                  return (
                    <div key={step.label} className="flex-1 flex flex-col items-center relative">
                      {index !== 0 && (
                        <div
                          className={`absolute top-4 right-1/2 w-full h-0.5 ${
                            isLineFilled ? "bg-indigo-600" : "bg-gray-200"
                          }`}
                        />
                      )}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          isDone
                            ? "bg-indigo-600 text-white"
                            : isActive
                            ? "bg-white border-2 border-indigo-600 text-indigo-600"
                            : "bg-gray-100 border border-gray-300 text-gray-400"
                        }`}
                      >
                        {isDone ? <HiCheck className="w-4 h-4" /> : <HiDeviceMobile className="w-4 h-4" />}
                      </div>
                      <p className="text-xs font-semibold text-gray-800 mt-2 text-center">{step.label}</p>
                      <p className={`text-[11px] mt-0.5 ${isDone || isActive ? "text-indigo-600" : "text-gray-400"}`}>
                        {isDone ? "Selesai" : isActive ? "Sedang diproses" : "Belum"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {isSelesai ? (
            <div>
              <h3 className="text-xl font-bold mb-4">Dokumen Selesai</h3>
              <Card className="rounded-lg shadow-sm border border-green-200 bg-green-50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                  {/* KIRI - Info Dokumen */}
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">Clearing Perpustakaan</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Selesai pada{" "}
                      {pengajuan.disetujui_atasan_at
                        ? new Date(pengajuan.disetujui_atasan_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : new Date().toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Nomor Surat: {pengajuan.nomor_surat || "-"}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="xs" outline onClick={handlePreviewSurat}>
                        Lihat PDF
                      </Button>
                      <Button size="xs" outline onClick={handleDownloadSurat}>
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* KANAN - QR CODE */}
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 flex items-center justify-center bg-white rounded-lg border border-gray-200 p-1">
                      {qrImageSrc ? (
                        <img
                          src={qrImageSrc}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-mono bg-gray-50 rounded">
                          QR
                        </div>
                      )}
                    </div>
                    <div className="w-28">
                      <p className="text-xs font-bold text-gray-900 leading-tight">
                        Scan untuk verifikasi dokumen ini
                      </p>
                    </div>
                  </div>

                </div>
              </Card>
            </div>
          ) : pengajuan && pengajuan.status !== "ditolak" ? (
            <div>
              <h3 className="text-xl font-bold mb-4">Dokumen Selesai</h3>
              <Card className="rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    <HiClock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-yellow-700">Menunggu Verifikasi</h3>
                    <p className="text-sm text-gray-600">
                      Dokumen Anda sedang dalam proses verifikasi oleh Admin dan Atasan.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

        </div>
      </main>
    </div>
  );
}