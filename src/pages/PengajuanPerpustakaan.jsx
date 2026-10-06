import { useState, useEffect } from "react";
import SidebarMahaComp from "../components/SidebarMahaComp";
import AlertModal from "../components/AlertModal";
import { Label, TextInput, Button, FileInput } from "flowbite-react";
import { HiMenu } from "react-icons/hi";
import axios from "axios";



const API_BASE = "http://10.6.65.165:8000/api/bebas-pustaka";
const PREVIEW_SKRIPSI_PATH = "preview-skripsi";
const PREVIEW_DISTRIBUSI_PATH = "preview-distribusi";
const FIELD_SKRIPSI = "file_skripsi";
const FIELD_DISTRIBUSI = "file_distribusi";
const MAX_FILE_MB_SKRIPSI = 5;
const MAX_FILE_MB_DISTRIBUSI = 1;

const validasiFile = (file, namaFile, maxFileMb) => {
  if (!file) return `${namaFile} wajib diupload.`;

  if (file.size > maxFileMb * 1024 * 1024) {
    return `Ukuran ${namaFile} maksimal ${maxFileMb} MB.`;
  }

  if (file.type !== "application/pdf") {
    return `${namaFile} harus berformat PDF.`;
  }

  return null;
};


function KotakUpload({
  id,
  label,
  file,
  onPilih,
  sudahTerkirim,
  namaFile,
  onLihat,
  sedangMembuka,
}) {
  return (
    <div className="mb-5">
      <Label htmlFor={id} value={label}>
        {label}
      </Label>

      {sudahTerkirim ? (
        <>
          <button
            type="button"
            onClick={onLihat}
            disabled={sedangMembuka}
            title="Klik untuk melihat file"
            className="mt-2 flex w-full items-stretch overflow-hidden rounded-lg border border-gray-300 bg-gray-50 text-left text-sm hover:bg-gray-100 disabled:opacity-60"
          >
            <span className="bg-gray-800 px-4 py-3 font-semibold text-white whitespace-nowrap">
              {sedangMembuka ? "Membuka..." : "Lihat File"}
            </span>

            <span className="px-4 py-3 text-gray-900 truncate">
              {namaFile}
            </span>
          </button>

          <p className="mt-2 text-sm text-gray-600">
            File dipilih:{" "}
            <span className="font-semibold">{namaFile}</span>
          </p>
        </>
      ) : (
        <>
          <FileInput
            id={id}
            accept=".pdf"
            className="mt-2"
            onChange={(e) => onPilih(e.target.files?.[0] || null)}
          />

          {file && (
            <p className="mt-2 text-sm text-gray-600">
              File dipilih:{" "}
              <span className="font-semibold">{file.name}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function BuatPengajuan() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user") || "null");
  const nama = userData?.nama || "";
  const nim = userData?.nim || "";
  const [loading, setLoading] = useState(false);
  const [sedangMembuka, setSedangMembuka] = useState("");
  const [status, setStatus] = useState(null);
  const [catatanRevisi, setCatatanRevisi] = useState("");
  const [pengajuanId, setPengajuanId] = useState(null);
  const [fileSkripsi, setFileSkripsi] = useState(null);
  const [fileDistribusi, setFileDistribusi] = useState(null);
  const kunciSkripsi = `namaFileSkripsi_${nim}`;
  const kunciDistribusi = `namaFileDistribusi_${nim}`;
  const [namaSkripsiTerkirim, setNamaSkripsiTerkirim] = useState(
    () => localStorage.getItem(kunciSkripsi) || ""
  );
  const [namaDistribusiTerkirim, setNamaDistribusiTerkirim] = useState(
    () => localStorage.getItem(kunciDistribusi) || ""
  );
  const [modal, setModal] = useState({
    open: false,
    type: "warning",
    title: "",
    message: "",
  });
  const showAlert = (message, type = "warning", title = "") => {
    setModal({
      open: true,
      type,
      title,
      message,
    });
  };
  const closeAlert = () =>
    setModal((m) => ({
      ...m,
      open: false,
    }));
  const namaSkripsiTampil =
    namaSkripsiTerkirim || `skripsi-${nim}.pdf`;

  const namaDistribusiTampil = namaDistribusiTerkirim || `distribusi-${nim}.pdf`;
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
        response.data?.data?.data ||
        response.data?.data ||
        [];

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

      const pengajuanSaya = semuaPengajuanSaya.reduce(
        (terbaru, item) =>
          item.id > terbaru.id ? item : terbaru
      );

      setPengajuanId(pengajuanSaya.id);

      const rawStatus = String(
        pengajuanSaya.status ?? ""
      ).toLowerCase();

      if (rawStatus === "revisi") {
        setStatus("revisi");
        setCatatanRevisi(
          pengajuanSaya.catatan_revisi || ""
        );
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
  const bisaUploadUlang = isRevisi || isVerified;
  const tombolDisabled = loading || isPending;
  const sudahTerkirim = isPending;


  const handleLihatFile = async (jenis) => {
    if (!pengajuanId || sedangMembuka) return;

    const path =
      jenis === "distribusi"
        ? PREVIEW_DISTRIBUSI_PATH
        : PREVIEW_SKRIPSI_PATH;

    const namaJenis =
      jenis === "distribusi"
        ? "distribusi"
        : "skripsi";
    const tabBaru = window.open("", "_blank");

    setSedangMembuka(jenis);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE}/${pengajuanId}/${path}`,
        {
          headers: {
            Accept: "application/pdf",
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      if (tabBaru) {
        tabBaru.location.href = url;
      } else {
        window.open(url, "_blank");
      }
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60 * 1000);
    } catch (error) {
      console.log("Error membuka file:", error);

      if (tabBaru) {
        tabBaru.close();
      }

      showAlert(
        error.response?.status === 404
          ? `File ${namaJenis} tidak ditemukan. Cek route preview di backend (${path}) dan path file di database.`
          : `File ${namaJenis} gagal dibuka.`,
        "error",
        "Gagal Membuka File"
      );
    } finally {
      setSedangMembuka("");
    }
  };

  const handleKirim = async () => {
  if (tombolDisabled) return;

  const pesanError =
    validasiFile(
      fileSkripsi,
      "File skripsi",
      MAX_FILE_MB_SKRIPSI
    ) ||
    validasiFile(
      fileDistribusi,
      "Form distribusi skripsi",
      MAX_FILE_MB_DISTRIBUSI
    );

  if (pesanError) {
    showAlert(
      pesanError,
      "error",
      "Upload File"
    );

    return;
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
    formData.append(
      FIELD_SKRIPSI,
      fileSkripsi
    );
    formData.append(
      FIELD_DISTRIBUSI,
      fileDistribusi
    );

    if (bisaUploadUlang && pengajuanId) {
      await axios.post(
        `${API_BASE}/${pengajuanId}/ajukan-ulang`,
        formData,
        {
          headers,
        }
      );

      showAlert(
        "Pengajuan ulang berhasil dikirim!",
        "success",
        "Berhasil"
      );
    } else {
      await axios.post(
        API_BASE,
        formData,
        {
          headers,
        }
      );

      showAlert(
        "Pengajuan berhasil dikirim!",
        "success",
        "Berhasil"
      );
    }

    localStorage.setItem(
      kunciSkripsi,
      fileSkripsi.name
    );

    setNamaSkripsiTerkirim(
      fileSkripsi.name
    );

    localStorage.setItem(
      kunciDistribusi,
      fileDistribusi.name
    );

    setNamaDistribusiTerkirim(
      fileDistribusi.name
    );

    setFileSkripsi(null);
    setFileDistribusi(null);

    ["fileSkripsi", "fileDistribusi"].forEach(
      (id) => {
        const input =
          document.getElementById(id);

        if (input) {
          input.value = "";
        }
      }
    );

    await cekStatusPengajuan();

  } catch (error) {
    console.log(
      "Error mengirim pengajuan:",
      error
    );

    const errors =
      error.response?.data?.errors;

    const message =
      error.response?.data?.message;

    if (errors) {
      const detail = Object.values(errors)
        .flat()
        .join("\n");

      showAlert(
        detail,
        "error",
        "Gagal"
      );
    } else {
      showAlert(
        message ||
          "Pengajuan gagal dikirim.",
        "error",
        "Gagal"
      );
    }

  } finally {
    setLoading(false);
  }
};

  const labelTombol = () => {
    if (loading) return "Mengirim...";

    if (isPending) {
      return "Menunggu Verifikasi";
    }

    if (isRevisi) {
      return "Ajukan Ulang";
    }

    if (isVerified) {
      return "Ganti File (Jika Ada Kesalahan)";
    }

    return "Kirim";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">

      {/* SIDEBAR */}
      <SidebarMahaComp
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-64 min-w-0">

        {/* MOBILE HEADER */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#1e2678] text-white p-4 flex items-center justify-between shadow-md">
          <button
            onClick={() =>
              setSidebarOpen(true)
            }
            className="p-1 focus:outline-none"
          >
            <HiMenu className="w-6 h-6" />
          </button>

          <span className="font-bold">
            Clearing Online
          </span>

          <div className="w-6" />
        </div>

        <main className="p-6 md:p-8">
          <h2 className="text-2xl md:text-4xl font-bold mb-6 md:mb-10">
            Buat Pengajuan
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">

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

              <div className="mb-5">

                <Label
                  htmlFor="fileSkripsi"
                  value="Upload Skripsi (PDF, maks. 5 MB)"
                >
                  Upload Skripsi (PDF, maks. 5 MB)
                </Label>

                {sudahTerkirim ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleLihatFile(
                          "skripsi"
                        )
                      }
                      disabled={
                        sedangMembuka ===
                        "skripsi"
                      }
                      title="Klik untuk melihat file"
                      className="mt-2 flex w-full items-stretch overflow-hidden rounded-lg border border-gray-300 bg-gray-50 text-left text-sm hover:bg-gray-100 disabled:opacity-60"
                    >

                      <span className="bg-gray-800 px-4 py-3 font-semibold text-white whitespace-nowrap">
                        {sedangMembuka ===
                        "skripsi"
                          ? "Membuka..."
                          : "Lihat File"}
                      </span>

                      <span className="px-4 py-3 text-gray-900 truncate">
                        {namaSkripsiTampil}
                      </span>

                    </button>

                    <p className="mt-2 text-sm text-gray-600">
                      File dipilih:{" "}
                      <span className="font-semibold">
                        {namaSkripsiTampil}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <FileInput
                      id="fileSkripsi"
                      accept=".pdf"
                      className="mt-2"
                      onChange={(e) =>
                        setFileSkripsi(
                          e.target.files?.[0] ||
                            null
                        )
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

            <KotakUpload
              id="fileDistribusi"
              label="Upload Form Distribusi Skripsi (PDF, maks. 1 MB)"
              file={fileDistribusi}
              onPilih={setFileDistribusi}
              sudahTerkirim={sudahTerkirim}
              namaFile={namaDistribusiTampil}
              onLihat={() => handleLihatFile("distribusi")}
              sedangMembuka={
                sedangMembuka === "distribusi"
              }
            />

              {isRevisi && (
                <div className="mb-5 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">

                  <p className="font-semibold mb-1">
                    Pengajuan perlu direvisi
                  </p>

                  <p>
                    {catatanRevisi ||
                      "Pustakawan tidak menyertakan catatan."}
                  </p>

                </div>
              )}

              {isVerified && (
                <div className="mb-5 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">

                  <p className="font-semibold mb-1">
                    Pengajuan sudah disetujui
                  </p>

                  <p>
                    Jika Anda menemukan
                    kesalahan pada file yang
                    diunggah, Anda masih dapat
                    mengganti file selama belum
                    digunakan untuk pengajuan
                    clearing. Kedua file
                    (skripsi dan form distribusi)
                    perlu diunggah ulang.
                  </p>

                  <div className="mt-2 flex flex-col items-start gap-1">

                    <button
                      type="button"
                      onClick={() =>
                        handleLihatFile(
                          "skripsi"
                        )
                      }
                      disabled={
                        !!sedangMembuka
                      }
                      className="text-blue-600 underline disabled:opacity-50"
                    >
                      {sedangMembuka ===
                      "skripsi"
                        ? "Membuka..."
                        : "Lihat skripsi yang sebelumnya dikirim"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleLihatFile(
                          "distribusi"
                        )
                      }
                      disabled={
                        !!sedangMembuka
                      }
                      className="text-blue-600 underline disabled:opacity-50"
                    >
                      {sedangMembuka ===
                      "distribusi"
                        ? "Membuka..."
                        : "Lihat form distribusi yang sebelumnya dikirim"}
                    </button>

                  </div>

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

              <h2 className="text-center font-medium mb-5">
                Tanda Tangan Pustakawan
              </h2>

              <div className="rounded-lg h-64 flex flex-col items-center justify-center">

                {/* VERIFIED */}
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

                  /* REVISI */
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

                  /* PENDING */
                  <span className="text-gray-400">
                    Menunggu verifikasi
                    pustakawan
                  </span>

                ) : (

                  /* BELUM ADA */
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