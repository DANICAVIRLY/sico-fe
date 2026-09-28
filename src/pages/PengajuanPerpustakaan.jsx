import { useState, useEffect } from "react";
import SidebarMahaComp from "../components/SidebarMahaComp";
import AlertModal from "../components/AlertModal";
import { Label, TextInput, Button, FileInput } from "flowbite-react";
import { HiMenu } from "react-icons/hi";
import axios from "axios";


const API_BASE = "http://172.18.160.44:8000/api/bebas-pustaka";

// Bagian akhir URL untuk melihat PDF skripsi.
// HARUS sama dengan route yang mengarah ke previewSkripsi di routes/api.php.
// Cek dengan: php artisan route:list --path=bebas-pustaka
// Hasil akhirnya: GET {API_BASE}/{id}/{PREVIEW_PATH}
const PREVIEW_PATH = "preview-skripsi";

export default function BuatPengajuan() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user") || "null");
  const nama = userData?.nama || "";
  const nim = userData?.nim || "";

  const [loading, setLoading] = useState(false);
  const [loadingLihat, setLoadingLihat] = useState(false);

  // status:
  // null | "pending" | "verified" | "revisi"
  const [status, setStatus] = useState(null);
  const [catatanRevisi, setCatatanRevisi] = useState("");
  const [pengajuanId, setPengajuanId] = useState(null);

  // File skripsi (PDF, max 10MB) — dikirim sebagai "file_skripsi" ke
  // backend, sesuai StoreBebasPustakaRequest / AjukanUlangBebasPustakaRequest.
  const [fileSkripsi, setFileSkripsi] = useState(null);

  // Nama file yang sudah terkirim. Disimpan di localStorage supaya tetap
  // tampil setelah halaman di-refresh.
  const kunciNamaFile = `namaFileSkripsi_${nim}`;
  const [namaFileTerkirim, setNamaFileTerkirim] = useState(
    () => localStorage.getItem(kunciNamaFile) || ""
  );

  const [modal, setModal] = useState({
  open: false,
  type: "warning",
  title: "",
  message: "",
});

const showAlert = (message, type = "warning", title = "") => {
  setModal({ open: true, type, title, message });
};

const closeAlert = () => setModal((m) => ({ ...m, open: false }));

  const namaFileTampil = namaFileTerkirim || `skripsi-${nim}.pdf`;

  const cekStatusPengajuan = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(API_BASE, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const listData =
        response.data?.data?.data || response.data?.data || [];

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

      // Ambil pengajuan dengan ID paling besar (paling baru)
      const pengajuanSaya = semuaPengajuanSaya.reduce((terbaru, item) =>
        item.id > terbaru.id ? item : terbaru
      );

      console.log("DATA PENGAJUAN SAYA (dipakai):", pengajuanSaya);

      setPengajuanId(pengajuanSaya.id);

      // Enum backend:
      // 'menunggu' | 'disetujui' | 'revisi'
      const rawStatus = String(
        pengajuanSaya.status ?? ""
      ).toLowerCase();

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

  // Saat pending/verified, kotak upload diganti tampilan file terkirim
  const sudahTerkirim = isVerified || isPending;

  // Ambil PDF dari backend pakai token, lalu buka di tab baru.
  const handleLihatFile = async () => {
    if (!pengajuanId || loadingLihat) return;

    // Buka tab dulu (sinkron dengan klik) supaya tidak diblokir popup blocker
    const tabBaru = window.open("", "_blank");

    setLoadingLihat(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE}/${pengajuanId}/${PREVIEW_PATH}`,
        {
          headers: {
            Accept: "application/pdf",
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      if (tabBaru) {
        tabBaru.location.href = url;
      } else {
        window.open(url, "_blank");
      }

      // Lepas memori setelah tab sempat memuat file
      setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
    } catch (error) {
      console.log("Error membuka file:", error);
      if (tabBaru) tabBaru.close();

      showAlert(
        error.response?.status === 404
          ? "File tidak ditemukan. Cek route preview di backend (PREVIEW_PATH) dan path file di database."
          : "File skripsi gagal dibuka."
      );
    } finally {
      setLoadingLihat(false);
    }
  };

  const handleKirim = async () => {
    if (tombolDisabled) return;

    // File wajib untuk pengajuan baru. Untuk "ajukan ulang", backend
    // (AjukanUlangBebasPustakaRequest) menandainya nullable — boleh
    // tidak ganti file kalau memang tidak perlu.
    if (!isRevisi && !fileSkripsi) {
      showAlert("File skripsi wajib diupload.", "error", "Upload File");
      return;
    }

    if (fileSkripsi) {
      const maxSize = 10 * 1024 * 1024; // 10 MB, sesuai batas backend
      if (fileSkripsi.size > maxSize) {
        showAlert("Ukuran file skripsi maksimal 10 MB.", "error", "Upload File");
        return;
      }
      if (fileSkripsi.type !== "application/pdf") {
        showAlert("File skripsi harus berformat PDF.", "error", "Upload File");
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      const formData = new FormData();
      if (fileSkripsi) {
        formData.append("file_skripsi", fileSkripsi);
      }

      if (isRevisi && pengajuanId) {
        await axios.post(
          `${API_BASE}/${pengajuanId}/ajukan-ulang`,
          formData,
          { headers }
        );

        showAlert("Pengajuan ulang berhasil dikirim!");
      } else {
        await axios.post(API_BASE, formData, { headers });

        showAlert("Pengajuan berhasil dikirim!");
      }

      // Ingat nama file yang baru dikirim supaya tetap tampil
      if (fileSkripsi) {
        localStorage.setItem(kunciNamaFile, fileSkripsi.name);
        setNamaFileTerkirim(fileSkripsi.name);
      }

      setFileSkripsi(null);
      const inputFile = document.getElementById("fileSkripsi");
      if (inputFile) inputFile.value = "";

      cekStatusPengajuan();
    } catch (error) {
      console.log("Error mengirim pengajuan:", error);

      showAlert(
        error.response?.data?.message ||
          "Pengajuan gagal dikirim."
      );
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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <SidebarMahaComp isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Topbar Mobile (Sticky) — sama persis pola di DashboardMahasiswa.jsx */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#1e2678] text-white p-4 flex items-center justify-between shadow-md">
          <button onClick={() => setSidebarOpen(true)} className="p-1 focus:outline-none">
            <HiMenu className="w-6 h-6" />
          </button>
          <span className="font-bold">Clearing Online</span>
          <div className="w-6" />
        </div>

        <main className="p-6 md:p-8">
          <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-10">
            Buat Pengajuan
          </h2>

          {/* grid-cols-2 fixed sebelumnya bikin kolom kanan-kiri kegencet
              parah di layar HP. Sekarang 1 kolom di HP, 2 kolom di layar
              lebar (lg ke atas). */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* =========================
                KOLOM KIRI
            ========================== */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-5">
                <Label
                  htmlFor="nama"
                  value="Nama Lengkap"
                >
                  Nama Lengkap
                </Label>

                <TextInput
                  id="nama"
                  value={nama || ""}
                  readOnly
                />
              </div>

              <div className="mb-5">
                <Label
                  htmlFor="nim"
                  value="NIM"
                >
                  NIM
                </Label>

                <TextInput
                  id="nim"
                  value={nim || ""}
                  readOnly
                />
              </div>

              {/* =========================
                  UPLOAD SKRIPSI
              ========================== */}
              <div className="mb-5">
                <Label htmlFor="fileSkripsi" value="Upload Skripsi (PDF, maks. 10 MB)">
                  Upload Skripsi (PDF, maks. 10 MB)
                </Label>

                {sudahTerkirim ? (
                  <>
                    {/* Tampilan sama seperti sebelum dikirim, tapi bisa diklik
                        untuk melihat file yang sudah terkirim */}
                    <button
                      type="button"
                      onClick={handleLihatFile}
                      disabled={loadingLihat}
                      title="Klik untuk melihat file"
                      className="mt-2 flex w-full items-stretch overflow-hidden rounded-lg border border-gray-300 bg-gray-50 text-left text-sm hover:bg-gray-100 disabled:opacity-60"
                    >
                      <span className="bg-gray-800 px-4 py-3 font-semibold text-white whitespace-nowrap">
                        {loadingLihat ? "Membuka..." : "Lihat File"}
                      </span>
                      <span className="px-4 py-3 text-gray-900 truncate">
                        {namaFileTampil}
                      </span>
                    </button>

                    <p className="mt-2 text-sm text-gray-600">
                      File dipilih:{" "}
                      <span className="font-semibold">{namaFileTampil}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <FileInput
                      id="fileSkripsi"
                      accept=".pdf"
                      className="mt-2"
                      onChange={(e) => setFileSkripsi(e.target.files?.[0] || null)}
                    />

                    {fileSkripsi && (
                      <p className="mt-2 text-sm text-gray-600">
                        File dipilih:{" "}
                        <span className="font-semibold">{fileSkripsi.name}</span>
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* =========================
                  CATATAN REVISI
              ========================== */}
              {isRevisi && (
                <div className="mb-5 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                  <p className="font-semibold mb-1">
                    Pengajuan perlu direvisi
                  </p>

                  <p>
                    {catatanRevisi ||
                      "Pustakawan tidak menyertakan catatan."}
                  </p>

                  <button
                    type="button"
                    onClick={handleLihatFile}
                    disabled={loadingLihat}
                    className="mt-2 text-blue-600 underline disabled:opacity-50"
                  >
                    {loadingLihat ? "Membuka..." : "Lihat file yang sebelumnya dikirim"}
                  </button>
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

            {/* =========================
                KOLOM KANAN
            ========================== */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-center font-medium mb-5">
                Tanda Tangan Pustakawan
              </h2>

              <div className="rounded-lg h-64 flex flex-col items-center justify-center">
                {/* =========================
                    SUDAH DIVERIFIKASI
                ========================== */}
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

                ) : isRevisi ? (
                  /* =========================
                      PERLU REVISI
                  ========================== */
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-sm">
                      <svg
                        className="w-12 h-12 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.14A1 1 0 003 19h18a1 1 0 00.89-1.45L13.71 3.86a1 1 0 00-1.72 0z"
                        />
                      </svg>
                    </div>

                    <span className="text-red-600 font-semibold text-lg">
                      Perlu Revisi
                    </span>
                  </div>

                ) : isPending ? (
                  /* =========================
                      MENUNGGU
                  ========================== */
                  <span className="text-gray-400">
                    Menunggu verifikasi pustakawan
                  </span>

                ) : (
                  /* =========================
                      BELUM ADA PENGAJUAN
                  ========================== */
                  <span className="text-gray-400">
                    Belum ada tanda tangan
                  </span>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
        <AlertModal
      open={modal.open}
      type={modal.type}
      title={modal.title}
      message={modal.message}
      onClose={closeAlert}
    />
    </div>
  );
}