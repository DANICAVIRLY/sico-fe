import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from 'flowbite-react';
import SidebarMahaComp from '../components/SidebarMahaComp';
import { HiCheckCircle, HiCheck, HiClock, HiQrcode, HiDeviceMobile, HiExclamationCircle } from 'react-icons/hi';
import axios from 'axios';

// =====================================================================
// PENTING: samain base URL ke satu tempat.
// IP ini beberapa kali berubah di project ini — pastikan ini IP
// backend yang aktif sekarang.
// =====================================================================
const API_BASE_URL = 'http://10.6.65.93:8000';

const STEPPER_ITEMS = [
  { label: 'Surat Bebas Pustaka' },
  { label: 'Pengajuan Clearing' },
  { label: 'Verifikasi Admin' },
  { label: 'Verifikasi Atasan' },
];

export default function DashboardMahasiswa() {
  const navigate = useNavigate();
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(true);
  const [pengajuan, setPengajuan] = useState(null);
  const [bebasPustakaSelesai, setBebasPustakaSelesai] = useState(false);
  const [tahapan, setTahapan] = useState(0);
  const [qrImageSrc, setQrImageSrc] = useState(null);
  const totalTahapan = 4;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setNama(userData?.nama || "Mahasiswa");
    fetchData();
  }, []);

  // =====================================================================
  // Cek status Bebas Pustaka DULU, baru status Pengajuan Clearing.
  // Endpoint index (baik bebas-pustaka maupun pengajuan-clearing)
  // dibungkus pagination Laravel: response.data.data.data adalah array
  // aslinya (dengan fallback ke response.data.data kalau backend
  // suatu saat berubah gak dipaginate).
  //
  // ASUMSI (perlu dicek ke app/Enums/PengajuanClearingStatus.php):
  // value status di-assume snake_case sesuai nama case enumnya
  // (diajukan, revisi_admin, diverifikasi_admin, ditolak, disetujui).
  // Kalau ternyata beda, tinggal sesuaikan string-nya di bawah.
  // =====================================================================
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
    const userData = JSON.parse(localStorage.getItem("user") || "null");

    try {
      // 1. Cek status Bebas Pustaka
      const bebasPustakaRes = await axios.get(
        `${API_BASE_URL}/api/bebas-pustaka`,
        { headers }
      );
      const bebasPustakaList =
        bebasPustakaRes.data?.data?.data || bebasPustakaRes.data?.data || [];

      const semuaBebasPustakaSaya = Array.isArray(bebasPustakaList)
        ? bebasPustakaList.filter(
            (item) => String(item.user_id) === String(userData?.id)
          )
        : [];

      const bebasPustakaSaya =
        semuaBebasPustakaSaya.length > 0
          ? semuaBebasPustakaSaya.reduce((terbaru, item) =>
              item.id > terbaru.id ? item : terbaru
            )
          : null;

      const bpSelesai =
        String(bebasPustakaSaya?.status ?? "").toLowerCase() === "disetujui";
      setBebasPustakaSelesai(bpSelesai);

      // 2. Cek status Pengajuan Clearing
      const clearingRes = await axios.get(
        `${API_BASE_URL}/api/pengajuan-clearing`,
        { headers }
      );
      const clearingItems =
        clearingRes.data?.data?.data || clearingRes.data?.data || [];
      const item = Array.isArray(clearingItems) ? clearingItems[0] || null : null;

      if (item) setPengajuan(item);

      // 3. Hitung tahapan gabungan
      let step = 0;
      if (bpSelesai) step = 1;

      if (item) {
        const statusClearing = String(item.status ?? "").toLowerCase();

        if (statusClearing === "ditolak") {
          // Ditolak atasan/admin: tetap di step 1 (bebas pustaka beres),
          // clearing perlu diajukan ulang.
          step = bpSelesai ? 1 : 0;
        } else if (statusClearing === "revisi_admin") {
          // Perlu revisi: masih di tahap Pengajuan Clearing, belum lolos
          // verifikasi admin.
          step = bpSelesai ? 1 : 0;
        } else if (statusClearing === "disetujui") {
          step = 4;
        } else if (statusClearing === "diverifikasi_admin") {
          // Sudah lolos admin, tinggal nunggu tanda tangan atasan.
          step = 3;
        } else {
          // Status lain (misal 'diajukan') dianggap baru masuk step 2.
          step = 2;
        }
      }

      setTahapan(step);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSelesai = pengajuan && String(pengajuan.status ?? "").toLowerCase() === 'disetujui';
  const statusPengajuan = String(pengajuan?.status ?? "").toLowerCase();
  const perluDirevisi = statusPengajuan === "revisi_admin";

  // =====================================================================
  // Preview & Download pakai endpoint asli backend:
  // GET /pengajuan-clearing/{id}/preview-surat
  // GET /pengajuan-clearing/{id}/download-surat
  // Dipanggil pakai axios (bukan window.open + ?token=) karena endpoint-nya
  // butuh Authorization header, bukan query param. Endpoint "/surat" dan
  // "/surat/download" TIDAK ADA di backend — sudah dikonfirmasi sebelumnya.
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
  // QR pakai route asli backend (path-nya dobel "pengajuan-clearing",
  // sesuai routes/api.php yang sudah dikonfirmasi). Endpoint teman
  // "/surat/qr/{token}" TIDAK ADA di backend, jadi tidak dipakai.
  //
  // Route ini dilindungi middleware auth, sedangkan <img src="..."> TIDAK
  // bisa mengirim header Authorization. Makanya di-fetch pakai axios
  // (blob) dulu, baru dikonversi ke object URL dan dipasang ke <img>.
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
                  const isDone = stepNumber <= tahapan;
                  const isActive = stepNumber === tahapan + 1;
                  const isLineFilled = stepNumber <= tahapan;

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
          ) : !bebasPustakaSelesai ? (
            <div>
              <h3 className="text-xl font-bold mb-4">Langkah Selanjutnya</h3>
              <Card className="rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    <HiClock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-yellow-700">Selesaikan Bebas Pustaka</h3>
                    <p className="text-sm text-gray-600">
                      Ajukan dan tunggu verifikasi bebas pustaka sebelum melanjutkan ke pengajuan clearing.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : !pengajuan ? (
            <div>
              <h3 className="text-xl font-bold mb-4">Langkah Selanjutnya</h3>
              <Card className="rounded-lg shadow-sm border border-indigo-200 bg-indigo-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <HiCheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-700">Bebas Pustaka Selesai!</h3>
                    <p className="text-sm text-gray-600">
                      Sekarang Anda bisa mengajukan Pengajuan Clearing.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : perluDirevisi ? (
            <div>
              <h3 className="text-xl font-bold mb-4">Status Pengajuan Clearing</h3>
              <Card className="rounded-lg shadow-sm border border-red-200 bg-red-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
                    <HiExclamationCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-700">Pengajuan Perlu Direvisi</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Admin meminta Anda memperbaiki pengajuan clearing Anda sebelum bisa dilanjutkan.
                    </p>

                    {pengajuan.catatan_revisi && (
                      <div className="mt-3 rounded border border-red-200 bg-white p-3 text-sm text-red-800">
                        <strong>Catatan dari admin:</strong>
                        <p className="mt-1">{pengajuan.catatan_revisi}</p>
                      </div>
                    )}

                    <Button
                      size="xs"
                      color="failure"
                      className="mt-3"
                      onClick={() => navigate("/pengajuan-saya")}
                    >
                      Perbaiki Sekarang
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold mb-4">Status Pengajuan Clearing</h3>
              <Card className="rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    <HiClock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-yellow-700">Menunggu Verifikasi</h3>
                    <p className="text-sm text-gray-600">
                      Pengajuan clearing Anda sedang diproses oleh Admin/Atasan.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}