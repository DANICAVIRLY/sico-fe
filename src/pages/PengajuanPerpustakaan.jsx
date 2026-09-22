import { useState, useEffect } from "react";
import SidebarMahaComp from "../components/SidebarMahaComp";
import AlertModal from "../components/AlertModal";
import { Label, TextInput, Button, FileInput } from "flowbite-react";
import { HiMenu } from "react-icons/hi";
import axios from "axios";


const API_BASE = "http://172.18.160.48:8000/api/bebas-pustaka";
// Bagian akhir URL untuk melihat PDF skripsi.
// HARUS sama dengan route yang mengarah ke previewSkripsi di routes/api.php.
// Cek dengan: php artisan route:list --path=bebas-pustaka
// Hasil akhirnya: GET {API_BASE}/{id}/{PREVIEW_PATH}
const PREVIEW_PATH = "preview-skripsi";

// Batas ukuran file (MB). Samakan dengan validasi di backend.
const MAX_FILE_MB = 5;

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

  const [fileSkripsi, setFileSkripsi] = useState(null);

  // Nama file yang sudah terkirim. Disimpan di localStorage supaya tetap
  // tampil setelah halaman di-refresh.
  const kunciNamaFile = `namaFileSkripsi_${nim}`;
  const [namaFileTerkirim, setNamaFileTerkirim] = useState(
    () => localStorage.getItem(kunciNamaFile) || "",
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

      const listData = response.data?.data?.data || response.data?.data || [];

      const semuaPengajuanSaya = Array.isArray(listData)
        ? listData.filter(
            (item) =>
              String(item.nim) === String(nim) ||
              String(item.user_id) === String(userData?.id) ||
              item.nama?.toLowerCase() === nama.toLowerCase(),
          )
        : [];

      if (semuaPengajuanSaya.length === 0) {
        setStatus(null);
        setCatatanRevisi("");
        setPengajuanId(null);
        return;
      }

      const pengajuanSaya = semuaPengajuanSaya.reduce((terbaru, item) =>
        item.id > terbaru.id ? item : terbaru,
      );

      setPengajuanId(pengajuanSaya.id);

      const rawStatus = String(pengajuanSaya.status ?? "").toLowerCase();

      if (rawStatus === "revisi") {
        setStatus("revisi");
        setCatatanRevisi(pengajuanSaya.catatan_revisi || "");
      } else if (rawStatus === "disetujui") {
        setStatus("verified");
        setCatatanRevisi("");
      } else {
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

  // Mahasiswa boleh upload ulang saat "revisi" ATAU "verified"
  // (sadar sendiri ada kesalahan setelah disetujui Pustakawan)
  const bisaUploadUlang = isRevisi || isVerified;

  // Tombol hanya disable saat loading atau masih pending
  const tombolDisabled = loading || isPending;

  // Saat masih pending, kotak upload diganti tampilan file terkirim.
  // Saat verified/revisi, form upload tetap muncul supaya bisa ganti file.
  const sudahTerkirim = isPending;

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
        },
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

      // [DIPERBAIKI] tambah type "error" dan title, sebelumnya kosong
      // sehingga jatuh ke default "warning" (oranye)
      showAlert(
        error.response?.status === 404
          ? "File tidak ditemukan. Cek route preview di backend (PREVIEW_PATH) dan path file di database."
          : "File skripsi gagal dibuka.",
        "error",
        "Gagal Membuka File",
      );
    } finally {
      setLoadingLihat(false);
    }
  };

  const handleKirim = async () => {
    if (tombolDisabled) return;

    // File wajib, baik untuk pengajuan baru maupun revisi/ajukan ulang
    // (AjukanUlangBebasPustakaRequest: required, bukan nullable).
    if (!fileSkripsi) {
      showAlert("File skripsi wajib diupload.", "error", "Upload File");
      return;
    }

<<<<<<< HEAD
    if (fileSkripsi) {
      const maxSize = 10 * 1024 * 1024; // 10 MB, sesuai batas backend
      if (fileSkripsi.size > maxSize) {
        showAlert(
          "Ukuran file skripsi maksimal 10 MB.",
          "error",
          "Upload File",
        );
        return;
      }
      if (fileSkripsi.type !== "application/pdf") {
        showAlert("File skripsi harus berformat PDF.", "error", "Upload File");
        return;
      }
=======
    const maxSize = MAX_FILE_MB * 1024 * 1024;
    if (fileSkripsi.size > maxSize) {
      showAlert(
        `Ukuran file skripsi maksimal ${MAX_FILE_MB} MB.`,
        "error",
        "Upload File"
      );
      return;
    }
    if (fileSkripsi.type !== "application/pdf") {
      showAlert("File skripsi harus berformat PDF.", "error", "Upload File");
      return;
>>>>>>> 97b2b0b (nambah pengajuan ulang)
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
      formData.append("file_skripsi", fileSkripsi);

<<<<<<< HEAD
      if (isRevisi && pengajuanId) {
        await axios.post(`${API_BASE}/${pengajuanId}/ajukan-ulang`, formData, {
          headers,
        });
=======
      // Pakai endpoint ajukan-ulang kalau statusnya revisi ATAU verified
      if (bisaUploadUlang && pengajuanId) {
        await axios.post(
          `${API_BASE}/${pengajuanId}/ajukan-ulang`,
          formData,
          { headers }
        );
>>>>>>> 97b2b0b (nambah pengajuan ulang)

        // [DIPERBAIKI] tambah type "success" dan title, sebelumnya kosong
        // sehingga jatuh ke default "warning" (oranye)
        showAlert("Pengajuan ulang berhasil dikirim!", "success", "Berhasil");
      } else {
        await axios.post(API_BASE, formData, { headers });

        // [DIPERBAIKI] sama seperti di atas
        showAlert("Pengajuan berhasil dikirim!", "success", "Berhasil");
      }

      // Ingat nama file yang baru dikirim supaya tetap tampil
      localStorage.setItem(kunciNamaFile, fileSkripsi.name);
      setNamaFileTerkirim(fileSkripsi.name);

      setFileSkripsi(null);
      const inputFile = document.getElementById("fileSkripsi");
      if (inputFile) inputFile.value = "";

      cekStatusPengajuan();
    } catch (error) {
      console.log("Error mengirim pengajuan:", error);

<<<<<<< HEAD
      // [DIPERBAIKI] tambah type "error" dan title, sebelumnya kosong
      showAlert(
        error.response?.data?.message || "Pengajuan gagal dikirim.",
        "error",
        "Gagal",
      );
=======
      // Tangani pesan error spesifik dari backend,
      // termasuk kasus "sudah dipakai untuk pengajuan clearing"
      const errors = error.response?.data?.errors;
      const message = error.response?.data?.message;

      if (errors) {
        const detail = Object.values(errors).flat().join("\n");
        showAlert(detail);
      } else {
        showAlert(message || "Pengajuan gagal dikirim.");
      }
>>>>>>> 97b2b0b (nambah pengajuan ulang)
    } finally {
      setLoading(false);
    }
  };

  const labelTombol = () => {
    if (loading) return "Mengirim...";
    if (isPending) return "Menunggu Verifikasi";
    if (isRevisi) return "Ajukan Ulang";
    // Label khusus saat sudah disetujui tapi mau ganti file
    if (isVerified) return "Ganti File (Jika Ada Kesalahan)";

    return "Kirim";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <SidebarMahaComp
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-64 min-w-0">
        <div className="lg:hidden sticky top-0 z-30 bg-[#1e2678] text-white p-4 flex items-center justify-between shadow-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 focus:outline-none"
          >
            <HiMenu className="w-6 h-6" />
          </button>
          <span className="font-bold">Clearing Online</span>
          <div className="w-6" />
        </div>

        <main className="p-6 md:p-8">
          <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-10">
            Buat Pengajuan
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-5">
<<<<<<< HEAD
                <Label htmlFor="nama" value="Nama Lengkap">
                  Nama Lengkap
                </Label>

=======
                <Label htmlFor="nama" value="Nama Lengkap">Nama Lengkap</Label>
>>>>>>> 97b2b0b (nambah pengajuan ulang)
                <TextInput id="nama" value={nama || ""} readOnly />
              </div>

              <div className="mb-5">
<<<<<<< HEAD
                <Label htmlFor="nim" value="NIM">
                  NIM
                </Label>

=======
                <Label htmlFor="nim" value="NIM">NIM</Label>
>>>>>>> 97b2b0b (nambah pengajuan ulang)
                <TextInput id="nim" value={nim || ""} readOnly />
              </div>

              {/* =========================
                  UPLOAD SKRIPSI
              ========================== */}
              <div className="mb-5">
                <Label
                  htmlFor="fileSkripsi"
<<<<<<< HEAD
                  value="Upload Skripsi (PDF, maks. 10 MB)"
                >
                  Upload Skripsi (PDF, maks. 10 MB)
=======
                  value={`Upload Skripsi (PDF, maks. ${MAX_FILE_MB} MB)`}
                >
                  Upload Skripsi (PDF, maks. {MAX_FILE_MB} MB)
>>>>>>> 97b2b0b (nambah pengajuan ulang)
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
                      onChange={(e) =>
                        setFileSkripsi(e.target.files?.[0] || null)
                      }
                    />

                    {fileSkripsi && (
                      <p className="mt-2 text-sm text-gray-600">
                        File dipilih:{" "}
                        <span className="font-semibold">
                          {fileSkripsi.name}
                        </span>
                      </p>
                    )}
                  </>
                )}
              </div>

              {isRevisi && (
                <div className="mb-5 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                  <p className="font-semibold mb-1">Pengajuan perlu direvisi</p>
<<<<<<< HEAD
=======
                  <p>{catatanRevisi || "Pustakawan tidak menyertakan catatan."}</p>
                </div>
              )}
>>>>>>> 97b2b0b (nambah pengajuan ulang)

              {/* Info khusus saat status sudah disetujui */}
              {isVerified && (
                <div className="mb-5 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
                  <p className="font-semibold mb-1">Pengajuan sudah disetujui</p>
                  <p>
<<<<<<< HEAD
                    {catatanRevisi || "Pustakawan tidak menyertakan catatan."}
=======
                    Jika Anda menemukan kesalahan pada file yang diunggah,
                    Anda masih dapat mengganti file selama belum digunakan
                    untuk pengajuan clearing.
>>>>>>> 97b2b0b (nambah pengajuan ulang)
                  </p>

                  <button
                    type="button"
                    onClick={handleLihatFile}
                    disabled={loadingLihat}
                    className="mt-2 text-blue-600 underline disabled:opacity-50"
                  >
                    {loadingLihat
                      ? "Membuka..."
                      : "Lihat file yang sebelumnya dikirim"}
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

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-center font-medium mb-5">Tanda Tangan Pustakawan</h2>

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
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.14A1 1 0 003 19h18a1 1 0 00.89-1.45L13.71 3.86a1 1 0 00-1.72 0z" />
                      </svg>
                    </div>
                    <span className="text-red-600 font-semibold text-lg">Perlu Revisi</span>
                  </div>
                ) : isPending ? (
<<<<<<< HEAD
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
=======
                  <span className="text-gray-400">Menunggu verifikasi pustakawan</span>
                ) : (
>>>>>>> 97b2b0b (nambah pengajuan ulang)
                  <span className="text-gray-400">Belum ada tanda tangan</span>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
<<<<<<< HEAD
=======

>>>>>>> 97b2b0b (nambah pengajuan ulang)
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