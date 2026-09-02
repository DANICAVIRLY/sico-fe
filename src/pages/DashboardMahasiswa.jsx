import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from 'flowbite-react';
import SidebarMahaComp from '../components/SidebarMahaComp';
import { HiCheckCircle, HiCheck, HiClock, HiQrcode, HiDeviceMobile, HiExclamationCircle } from 'react-icons/hi';
import axios from 'axios';

const API_BASE = "http://10.6.65.93:8000/api";

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
  const [surat, setSurat] = useState(null);
  const [tahapan, setTahapan] = useState(0);
  const totalTahapan = 4;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setNama(userData?.nama || "Mahasiswa");
    fetchData();
  }, []);

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
        `${API_BASE}/bebas-pustaka`,
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

      console.log("BEBAS PUSTAKA STATUS:", bebasPustakaSaya?.status);

      // 2. Cek status Pengajuan Clearing
      const clearingRes = await axios.get(
        `${API_BASE}/pengajuan-clearing`,
        { headers }
      );
      const clearingItems =
        clearingRes.data?.data?.data || clearingRes.data?.data || [];
      const item = Array.isArray(clearingItems) ? clearingItems[0] || null : null;

      console.log("PENGAJUAN CLEARING FULL ITEM:", item);

      if (item) setPengajuan(item);

      // 3. Hitung tahapan gabungan
      // CATATAN: field "status" pada pengajuan-clearing TIDAK berubah lagi
      // setelah admin menyetujui (tetap "disetujui" walau atasan sudah tanda
      // tangan). Progres verifikasi admin & atasan yang sebenarnya dilacak
      // lewat timestamp direview_admin_at dan disetujui_atasan_at, jadi step
      // dihitung dari situ, bukan dari string status.
      let step = 0;
      if (bpSelesai) step = 1;

      if (item) {
        const statusClearing = String(item.status ?? "").toLowerCase();
        const sudahDireviewAdmin = Boolean(item.direview_admin_at);
        const sudahDisetujuiAtasan = Boolean(item.disetujui_atasan_at);

        if (statusClearing === "ditolak") {
          // Ditolak: tetap di step 1 (bebas pustaka), clearing perlu diajukan ulang
          step = bpSelesai ? 1 : 0;
        } else if (statusClearing === "revisi_admin") {
          // Perlu revisi: masih di tahap Pengajuan Clearing, belum lolos verifikasi admin
          step = bpSelesai ? 1 : 0;
        } else if (sudahDisetujuiAtasan) {
          // Atasan sudah menyetujui/menandatangani -> proses selesai total
          step = 4;
        } else if (sudahDireviewAdmin) {
          // Admin sudah approve & kirim ke atasan, tapi atasan belum tanda tangan
          step = 3;
        } else {
          // Baru diajukan, belum direview admin sama sekali
          step = 2;
        }
      }

      setTahapan(step);

      if (item && item.disetujui_atasan_at) {
        fetchSurat(item.id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurat = (id) => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE}/pengajuan-clearing/${id}/surat`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        setSurat(response.data?.data || response.data);
      })
      .catch((error) => {
        console.error("Error fetching surat:", error);
      });
  };

  const handlePreviewSurat = () => {
    const token = localStorage.getItem("token");
    if (pengajuan?.id) {
      window.open(
        `${API_BASE}/pengajuan-clearing/${pengajuan.id}/surat?token=${token}`,
        "_blank"
      );
    }
  };

  const handleDownloadSurat = () => {
    const token = localStorage.getItem("token");
    if (pengajuan?.id) {
      window.open(
        `${API_BASE}/pengajuan-clearing/${pengajuan.id}/surat/download?token=${token}`,
        "_blank"
      );
    }
  };

  const statusPengajuan = String(pengajuan?.status ?? "").toLowerCase();
  const perluDirevisi = statusPengajuan === "revisi_admin";

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
                    <div
                      key={step.label}
                      className="flex-1 flex flex-col items-center relative"
                    >
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
                        {isDone ? (
                          <HiCheck className="w-4 h-4" />
                        ) : (
                          <HiDeviceMobile className="w-4 h-4" />
                        )}
                      </div>

                      <p className="text-xs font-semibold text-gray-800 mt-2 text-center">
                        {step.label}
                      </p>

                      <p
                        className={`text-[11px] mt-0.5 ${
                          isDone || isActive ? "text-indigo-600" : "text-gray-400"
                        }`}
                      >
                        {isDone ? "Selesai" : isActive ? "Sedang diproses" : "Belum"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {surat ? (
            <div>
              <h3 className="text-xl font-bold mb-4">Dokumen Selesai</h3>
              <Card className="rounded-lg shadow-sm border border-green-200 bg-green-50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">
                      Clearing Perpustakaan
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Selesai pada {surat.tanggal_terbit || new Date().toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Nomor Surat: {surat.nomor_surat || "-"}
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
                      {surat.qr_token ? (
                        <img
                          src={`${API_BASE}/surat/qr/${surat.qr_token}`}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                            e.target.alt = "QR Code";
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center text-xs text-gray-400 font-mono bg-gray-50 rounded">
                                QR
                              </div>
                            `;
                          }}
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
                      <p className="text-[10px] text-gray-400 mt-1 break-all">
                        {surat.qr_token || "QR Token"}
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
            /* [ADDED] Kartu khusus status revisi - tampilkan catatan dari admin */
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
          ) : pengajuan?.disetujui_atasan_at ? (
            /* Atasan sudah menyetujui, tapi data surat (fetchSurat) belum berhasil dimuat.
               Ini beda kondisi dari "menunggu tanda tangan" - jangan tampilkan pesan menunggu. */
            <div>
              <h3 className="text-xl font-bold mb-4">Status Pengajuan Clearing</h3>
              <Card className="rounded-lg shadow-sm border border-green-200 bg-green-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <HiCheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-700">Pengajuan Selesai</h3>
                    <p className="text-sm text-gray-600">
                      Pengajuan clearing Anda sudah disetujui Admin dan ditandatangani Atasan.
                      Surat sedang disiapkan, silakan muat ulang halaman beberapa saat lagi.
                    </p>
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
                    <h3 className="font-bold text-yellow-700">
                      {pengajuan?.direview_admin_at ? "Menunggu Tanda Tangan Atasan" : "Menunggu Verifikasi"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {pengajuan?.direview_admin_at
                        ? "Pengajuan clearing Anda sudah disetujui Admin dan sedang menunggu tanda tangan Atasan."
                        : "Pengajuan clearing Anda sedang diproses oleh Admin/Atasan."}
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