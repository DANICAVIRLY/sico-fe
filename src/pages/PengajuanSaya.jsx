import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  FileInput,
  Label,
  Spinner,
} from "flowbite-react";
import SidebarMahaComp from "../components/SidebarMahaComp";
import axios from "axios";

const API_URL = "http://10.6.64.238:8000";
const STORAGE_URL = `${API_URL}/storage`;

export default function PengajuanSaya() {
  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [departemen, setDepartemen] = useState("");
  const [programStudi, setProgramStudi] = useState("");

  const [fileKtm, setFileKtm] = useState(null);
  const [fileSpp, setFileSpp] = useState(null);
  const [fileDistribusi, setFileDistribusi] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // [ADDED] STATE UNTUK AJUKAN ULANG
  // =========================

  const [revisiFileKtm, setRevisiFileKtm] = useState(null);
  const [revisiFileSpp, setRevisiFileSpp] = useState(null);
  const [revisiFileDistribusi, setRevisiFileDistribusi] = useState(null);
  const [revisiDepartemen, setRevisiDepartemen] = useState("");
  const [revisiProgramStudi, setRevisiProgramStudi] = useState("");
  const [ajukanUlangLoading, setAjukanUlangLoading] = useState(false);
  const [ajukanUlangError, setAjukanUlangError] = useState("");

  const [pengajuanList, setPengajuanList] = useState([]);

  const pengajuanRevisi = pengajuanList.find(
    (p) => String(p.status).toUpperCase() === "REVISI_ADMIN"
  );

  // =========================
  // TOKEN
  // =========================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      ""
    );
  };

  const getConfig = () => {
    const token = getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    };
  };

  // =========================
  // AMBIL DATA USER
  // =========================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        setNama(
          user.nama || user.name || user.nama_lengkap || user.full_name || ""
        );

        setNim(user.nim || user.NIM || user.nim_mahasiswa || "");

        setDepartemen(user.departemen || user.department || "");

        setProgramStudi(
          user.program_studi || user.programStudi || user.prodi || ""
        );
      } catch (err) {
        console.error("Gagal membaca data user:", err);
      }
    }

    setNama((prev) => prev || localStorage.getItem("nama") || "Mahasiswa");

    setNim((prev) => prev || localStorage.getItem("nim") || "");
  }, []);

  // =========================
  // AMBIL DATA PENGAJUAN
  // =========================

  const getPengajuan = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/pengajuan-clearing`,
        getConfig()
      );

      console.log("DATA PENGAJUAN:", response.data);

      const result = response.data?.data ?? response.data;

      let data = [];

      if (Array.isArray(result)) {
        data = result;
      } else if (Array.isArray(result?.data)) {
        data = result.data;
      } else if (result) {
        data = [result];
      }

      setDocuments(data);
      setPengajuanList(data);

      const revisi = data.find(
        (p) => String(p.status).toUpperCase() === "REVISI_ADMIN"
      );

      if (revisi) {
        setRevisiDepartemen(revisi.departemen || "");
        setRevisiProgramStudi(revisi.program_studi || "");
      }
    } catch (err) {
      console.error("Gagal mengambil pengajuan:", err);

      console.log("STATUS:", err.response?.status);
      console.log("RESPONSE:", err.response?.data);

      if (err.response?.status === 401) {
        setError("Sesi login sudah habis. Silakan login kembali.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Gagal mengambil data pengajuan dari server.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPengajuan();
  }, []);

  // =========================
  // VALIDASI FILE
  // =========================

  const validateFile = (file) => {
    if (!file) {
      return true;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(`File ${file.name} terlalu besar. Maksimal 5 MB.`);
      return false;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(`File ${file.name} tidak didukung.\nGunakan PDF, JPG, JPEG, atau PNG.`);
      return false;
    }

    return true;
  };

  // =========================
  // UPLOAD PENGAJUAN
  // =========================

  const handleUpload = async (e) => {
    e.preventDefault();

    setError("");

    if (!departemen.trim()) {
      alert("Departemen wajib diisi.");
      return;
    }

    if (!programStudi.trim()) {
      alert("Program Studi wajib diisi.");
      return;
    }

    if (!fileKtm) {
      alert("File KTM wajib diupload.");
      return;
    }

    if (!fileSpp) {
      alert("File Bukti Pembayaran SPP wajib diupload.");
      return;
    }

    if (!fileDistribusi) {
      alert("File Distribusi Skripsi wajib diupload.");
      return;
    }

    if (!validateFile(fileKtm)) return;
    if (!validateFile(fileSpp)) return;
    if (!validateFile(fileDistribusi)) return;

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("departemen", departemen);
      formData.append("program_studi", programStudi);
      formData.append("file_ktm", fileKtm);
      formData.append("file_bukti_spp", fileSpp);
      formData.append("file_distribusi", fileDistribusi);

      console.log("FORM DATA:");

      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const token = getToken();

      const response = await axios.post(
        `${API_URL}/api/pengajuan-clearing`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("UPLOAD RESPONSE:", response.data);

      alert("Pengajuan clearing berhasil diajukan.");

      setFileKtm(null);
      setFileSpp(null);
      setFileDistribusi(null);

      const inputKtm = document.getElementById("fileKtm");
      const inputSpp = document.getElementById("fileSpp");
      const inputDistribusi = document.getElementById("fileDistribusi");

      if (inputKtm) inputKtm.value = "";
      if (inputSpp) inputSpp.value = "";
      if (inputDistribusi) inputDistribusi.value = "";

      await getPengajuan();
    } catch (err) {
      console.error("ERROR UPLOAD:", err);

      console.log("STATUS:", err.response?.status);
      console.log("RESPONSE:", err.response?.data);

      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const messages = Object.values(errors).flat().join("\n");

        setError(messages);
        alert(messages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
        alert(err.response.data.message);
      } else {
        setError("Gagal mengajukan clearing.");
        alert("Gagal mengajukan clearing.");
      }
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // [ADDED] AJUKAN ULANG (setelah revisi admin)
  // =========================

  const handleAjukanUlang = async (e) => {
    e.preventDefault();

    setAjukanUlangError("");

    if (!pengajuanRevisi) {
      return;
    }

    if (revisiFileKtm && !validateFile(revisiFileKtm)) return;
    if (revisiFileSpp && !validateFile(revisiFileSpp)) return;
    if (revisiFileDistribusi && !validateFile(revisiFileDistribusi)) return;

    try {
      setAjukanUlangLoading(true);

      const formData = new FormData();

      if (revisiDepartemen && revisiDepartemen !== pengajuanRevisi.departemen) {
        formData.append("departemen", revisiDepartemen);
      }

      if (
        revisiProgramStudi &&
        revisiProgramStudi !== pengajuanRevisi.program_studi
      ) {
        formData.append("program_studi", revisiProgramStudi);
      }

      if (revisiFileKtm) formData.append("file_ktm", revisiFileKtm);
      if (revisiFileSpp) formData.append("file_bukti_spp", revisiFileSpp);
      if (revisiFileDistribusi) {
        formData.append("file_distribusi", revisiFileDistribusi);
      }

      const token = getToken();

      const response = await axios.post(
        `${API_URL}/api/pengajuan-clearing/${pengajuanRevisi.id}/ajukan-ulang`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("AJUKAN ULANG RESPONSE:", response.data);

      alert("Pengajuan clearing berhasil diajukan ulang.");

      setRevisiFileKtm(null);
      setRevisiFileSpp(null);
      setRevisiFileDistribusi(null);

      const inputKtm = document.getElementById("revisiFileKtm");
      const inputSpp = document.getElementById("revisiFileSpp");
      const inputDistribusi = document.getElementById("revisiFileDistribusi");

      if (inputKtm) inputKtm.value = "";
      if (inputSpp) inputSpp.value = "";
      if (inputDistribusi) inputDistribusi.value = "";

      await getPengajuan();
    } catch (err) {
      console.error("ERROR AJUKAN ULANG:", err);
      console.log("STATUS:", err.response?.status);
      console.log("RESPONSE:", err.response?.data);

      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors)
          .flat()
          .join("\n");

        setAjukanUlangError(messages);
        alert(messages);
      } else if (err.response?.data?.message) {
        setAjukanUlangError(err.response.data.message);
        alert(err.response.data.message);
      } else {
        setAjukanUlangError("Gagal mengajukan ulang.");
        alert("Gagal mengajukan ulang.");
      }
    } finally {
      setAjukanUlangLoading(false);
    }
  };

  // =========================
  // URL FILE
  // =========================

  const getFileUrl = (file) => {
    if (!file) {
      return null;
    }

    if (file.startsWith("http://") || file.startsWith("https://")) {
      return file;
    }

    if (file.startsWith("storage/")) {
      return `${API_URL}/${file}`;
    }

    if (file.startsWith("/storage/")) {
      return `${API_URL}${file}`;
    }

    return `${STORAGE_URL}/${file}`;
  };

  // =========================
  // PREVIEW
  // =========================

  const handlePreview = (file) => {
    const url = getFileUrl(file);

    if (!url) {
      alert("File tidak ditemukan.");
      return;
    }

    window.open(url, "_blank");
  };

  // =========================
  // DOWNLOAD
  // =========================

  const handleDownload = async (file) => {
    const url = getFileUrl(file);

    if (!url) {
      alert("File tidak ditemukan.");
      return;
    }

    try {
      const response = await axios.get(url, {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = blobUrl;

      const fileName = file.split("/").pop();

      link.setAttribute("download", fileName || "dokumen");

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Gagal download:", err);

      alert("Gagal mengunduh file.");
    }
  };

  // =========================
  // STATUS
  // =========================

  const renderStatus = (status) => {
    const normalized = String(status || "")
      .toLowerCase()
      .replace(/[_-]/g, " ");

    if (
      normalized === "verified" ||
      normalized === "approved" ||
      normalized === "disetujui"
    ) {
      return (
        <Badge
          color="success"
          className="rounded-full px-3 py-1 text-xs font-medium"
        >
          Verified
        </Badge>
      );
    }

    if (normalized === "rejected" || normalized === "ditolak") {
      return (
        <Badge
          color="failure"
          className="rounded-full px-3 py-1 text-xs font-medium"
        >
          Rejected
        </Badge>
      );
    }

    return (
      <Badge
        color="warning"
        className="rounded-full px-3 py-1 text-xs font-medium"
      >
        Pending
      </Badge>
    );
  };

  // =========================
  // FORMAT TANGGAL
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  // =========================
  // NAMA FILE
  // =========================

  const getFileName = (file) => {
    if (!file) {
      return "-";
    }

    return file.split("/").pop();
  };

  // =========================
  // BUAT BARIS DOKUMEN
  // =========================

  const getDocumentRows = () => {
    const rows = [];

    documents.forEach((pengajuan) => {
      if (pengajuan.file_ktm || pengajuan.ktm || pengajuan.fileKtm) {
        rows.push({
          id: `${pengajuan.id}-ktm`,
          pengajuanId: pengajuan.id,
          nama: "Kartu Tanda Mahasiswa (KTM)",
          file: pengajuan.file_ktm || pengajuan.ktm || pengajuan.fileKtm,
          status: pengajuan.status_ktm || pengajuan.status || "Pending",
          upload: pengajuan.created_at || pengajuan.tanggal_upload,
          validasi: pengajuan.validated_at || pengajuan.tanggal_validasi,
          catatan: pengajuan.catatan_ktm || pengajuan.catatan || "-",
        });
      }

      if (
        pengajuan.file_bukti_spp ||
        pengajuan.bukti_spp ||
        pengajuan.fileSpp
      ) {
        rows.push({
          id: `${pengajuan.id}-spp`,
          pengajuanId: pengajuan.id,
          nama: "Bukti Pembayaran SPP",
          file:
            pengajuan.file_bukti_spp ||
            pengajuan.bukti_spp ||
            pengajuan.fileSpp,
          status: pengajuan.status_spp || pengajuan.status || "Pending",
          upload: pengajuan.created_at || pengajuan.tanggal_upload,
          validasi: pengajuan.validated_at || pengajuan.tanggal_validasi,
          catatan: pengajuan.catatan_spp || pengajuan.catatan || "-",
        });
      }

      if (
        pengajuan.file_distribusi ||
        pengajuan.distribusi ||
        pengajuan.fileDistribusi
      ) {
        rows.push({
          id: `${pengajuan.id}-distribusi`,
          pengajuanId: pengajuan.id,
          nama: "Distribusi Skripsi",
          file:
            pengajuan.file_distribusi ||
            pengajuan.distribusi ||
            pengajuan.fileDistribusi,
          status:
            pengajuan.status_distribusi || pengajuan.status || "Pending",
          upload: pengajuan.created_at || pengajuan.tanggal_upload,
          validasi: pengajuan.validated_at || pengajuan.tanggal_validasi,
          catatan: pengajuan.catatan_distribusi || pengajuan.catatan || "-",
        });
      }
    });

    return rows;
  };

  const documentRows = getDocumentRows();

  return (
    <div className="min-h-screen bg-gray-100">
      <SidebarMahaComp />

      <main className="ml-64 p-8">
        {/* HEADER */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-indigo-600">
            Sistem Informasi Clearing Online
          </p>

          <h1 className="text-3xl font-bold text-gray-800">
            Pengajuan Saya
          </h1>

          <p className="mt-2 text-gray-500">
            Kelola dan unggah dokumen persyaratan clearing Anda.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Terjadi kesalahan</p>

            <p className="mt-1 whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* [ADDED] FORM AJUKAN ULANG - muncul kalau ada pengajuan status REVISI_ADMIN */}
        {pengajuanRevisi && (
          <Card className="mb-6 border border-amber-300 bg-amber-50 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-amber-800">
                Pengajuan Anda Perlu Direvisi
              </h2>

              <p className="mt-1 text-sm text-amber-700">
                Admin meminta Anda memperbaiki pengajuan clearing #
                {pengajuanRevisi.id}.
              </p>

              {pengajuanRevisi.catatan_revisi && (
                <div className="mt-3 rounded border border-amber-300 bg-white p-3 text-sm text-amber-800">
                  <strong>Catatan dari admin:</strong>
                  <p className="mt-1">{pengajuanRevisi.catatan_revisi}</p>
                </div>
              )}
            </div>

            {ajukanUlangError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 whitespace-pre-line">
                {ajukanUlangError}
              </div>
            )}

            <form onSubmit={handleAjukanUlang}>
              <div className="mb-5 grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="revisiDepartemen" value="Departemen" />
                  <input
                    id="revisiDepartemen"
                    type="text"
                    value={revisiDepartemen}
                    onChange={(e) => setRevisiDepartemen(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="revisiProgramStudi" value="Program Studi" />
                  <input
                    id="revisiProgramStudi"
                    type="text"
                    value={revisiProgramStudi}
                    onChange={(e) => setRevisiProgramStudi(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* KTM */}
              <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-2 font-semibold text-gray-800">
                  Ganti KTM (opsional)
                </h3>

                {pengajuanRevisi.file_ktm && (
                  <p className="mb-2 text-sm text-gray-600">
                    File saat ini:{" "}
                    <button
                      type="button"
                      onClick={() => handlePreview(pengajuanRevisi.file_ktm)}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {getFileName(pengajuanRevisi.file_ktm)}
                    </button>
                  </p>
                )}

                <FileInput
                  id="revisiFileKtm"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setRevisiFileKtm(e.target.files?.[0] || null)
                  }
                />
                {revisiFileKtm && (
                  <p className="mt-2 text-sm text-gray-600">
                    File baru dipilih:{" "}
                    <span className="font-semibold">
                      {revisiFileKtm.name}
                    </span>
                  </p>
                )}
              </div>

              {/* SPP */}
              <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-2 font-semibold text-gray-800">
                  Ganti Bukti SPP (opsional)
                </h3>

                {pengajuanRevisi.file_bukti_spp && (
                  <p className="mb-2 text-sm text-gray-600">
                    File saat ini:{" "}
                    <button
                      type="button"
                      onClick={() =>
                        handlePreview(pengajuanRevisi.file_bukti_spp)
                      }
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {getFileName(pengajuanRevisi.file_bukti_spp)}
                    </button>
                  </p>
                )}

                <FileInput
                  id="revisiFileSpp"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setRevisiFileSpp(e.target.files?.[0] || null)
                  }
                />
                {revisiFileSpp && (
                  <p className="mt-2 text-sm text-gray-600">
                    File baru dipilih:{" "}
                    <span className="font-semibold">
                      {revisiFileSpp.name}
                    </span>
                  </p>
                )}
              </div>

              {/* DISTRIBUSI */}
              <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-2 font-semibold text-gray-800">
                  Ganti Distribusi Skripsi (opsional)
                </h3>

                {pengajuanRevisi.file_distribusi && (
                  <p className="mb-2 text-sm text-gray-600">
                    File saat ini:{" "}
                    <button
                      type="button"
                      onClick={() =>
                        handlePreview(pengajuanRevisi.file_distribusi)
                      }
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {getFileName(pengajuanRevisi.file_distribusi)}
                    </button>
                  </p>
                )}

                <FileInput
                  id="revisiFileDistribusi"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setRevisiFileDistribusi(e.target.files?.[0] || null)
                  }
                />
                {revisiFileDistribusi && (
                  <p className="mt-2 text-sm text-gray-600">
                    File baru dipilih:{" "}
                    <span className="font-semibold">
                      {revisiFileDistribusi.name}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  color="warning"
                  disabled={ajukanUlangLoading}
                >
                  {ajukanUlangLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Mengirim...
                    </>
                  ) : (
                    "Kirim Ulang Pengajuan"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* FORM UPLOAD - hanya tampil kalau TIDAK sedang dalam status revisi */}
        {!pengajuanRevisi && (
          <Card className="mb-6 border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Unggah Dokumen Baru
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Lengkapi dokumen persyaratan clearing Anda.
              </p>
            </div>

            <form onSubmit={handleUpload}>
              {/* DATA MAHASISWA */}
              <div className="mb-6 grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="nama" value="Nama Mahasiswa" />

                  <input
                    id="nama"
                    type="text"
                    value={nama}
                    disabled
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-100 p-3 text-sm text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="nim" value="NIM" />

                  <input
                    id="nim"
                    type="text"
                    value={nim}
                    disabled
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-100 p-3 text-sm text-gray-500"
                  />
                </div>
              </div>

              {/* DEPARTEMEN & PRODI */}
              <div className="mb-6 grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="departemen" value="Departemen" />

                  <input
                    id="departemen"
                    type="text"
                    value={departemen}
                    onChange={(e) => setDepartemen(e.target.value)}
                    placeholder="Masukkan Departemen"
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="programStudi" value="Program Studi" />

                  <input
                    id="programStudi"
                    type="text"
                    value={programStudi}
                    onChange={(e) => setProgramStudi(e.target.value)}
                    placeholder="Masukkan Program Studi"
                    className="mt-2 block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* KTM */}
              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-800">
                    1. Kartu Tanda Mahasiswa (KTM)
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Upload KTM dalam format PDF, JPG, JPEG, atau PNG.
                    Maksimal 5 MB.
                  </p>
                </div>

                <FileInput
                  id="fileKtm"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setFileKtm(e.target.files?.[0] || null)
                  }
                />

                {fileKtm && (
                  <p className="mt-2 text-sm text-gray-600">
                    File dipilih:{" "}
                    <span className="font-semibold">{fileKtm.name}</span>
                  </p>
                )}
              </div>

              {/* SPP */}
              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-800">
                    2. Bukti Pembayaran SPP
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Upload bukti pembayaran SPP dalam format PDF, JPG, JPEG,
                    atau PNG. Maksimal 5 MB.
                  </p>
                </div>

                <FileInput
                  id="fileSpp"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setFileSpp(e.target.files?.[0] || null)
                  }
                />

                {fileSpp && (
                  <p className="mt-2 text-sm text-gray-600">
                    File dipilih:{" "}
                    <span className="font-semibold">{fileSpp.name}</span>
                  </p>
                )}
              </div>

              {/* DISTRIBUSI */}
              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-800">
                    3. Distribusi Skripsi
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Upload dokumen distribusi skripsi dalam format PDF, JPG,
                    JPEG, atau PNG. Maksimal 5 MB.
                  </p>
                </div>

                <FileInput
                  id="fileDistribusi"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setFileDistribusi(e.target.files?.[0] || null)
                  }
                />

                {fileDistribusi && (
                  <p className="mt-2 text-sm text-gray-600">
                    File dipilih:{" "}
                    <span className="font-semibold">
                      {fileDistribusi.name}
                    </span>
                  </p>
                )}
              </div>

              {/* BUTTON */}
              <div className="flex justify-end">
                <Button type="submit" color="blue" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Mengajukan...
                    </>
                  ) : (
                    "Ajukan Clearing"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* TABEL DOKUMEN */}
        <Card className="border border-gray-200 shadow-sm">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Dokumen Terunggah
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Daftar dokumen persyaratan yang telah Anda upload.
              </p>
            </div>

            <div className="mt-2 rounded-lg bg-indigo-50 px-4 py-2 sm:mt-0">
              <span className="text-sm font-semibold text-indigo-600">
                {documentRows.length} Dokumen
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Spinner size="xl" />

              <p className="mt-4 text-sm text-gray-500">
                Mengambil data dokumen...
              </p>
            </div>
          ) : documentRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-7 w-7 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 8h10M7 12h10M7 16h6"
                  />
                </svg>
              </div>

              <p className="font-semibold text-gray-700">Belum ada dokumen</p>

              <p className="mt-1 text-sm text-gray-400">
                Silakan upload dokumen persyaratan terlebih dahulu.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm text-gray-600">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Dokumen</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">
                      Tanggal Upload
                    </th>
                    <th className="px-5 py-4 font-semibold">Validasi</th>
                    <th className="px-5 py-4 font-semibold">Catatan</th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {documentRows.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b border-gray-100 bg-white transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                            <svg
                              className="h-5 w-5 text-indigo-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h5.586A2 2 0 0113 2.586L16.414 6A2 2 0 0117 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm7-1.414V7h4.414L11 2.586zM8 10a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800">
                              {doc.nama}
                            </p>

                            <p className="mt-1 max-w-[240px] truncate text-xs text-gray-400">
                              {getFileName(doc.file)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5">
                        {renderStatus(doc.status)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-gray-500">
                        {formatDate(doc.upload)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-gray-500">
                        {formatDate(doc.validasi)}
                      </td>

                      <td className="max-w-[220px] px-5 py-5">
                        <span className="block truncate text-sm text-gray-500">
                          {doc.catatan || "-"}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="xs"
                            color="light"
                            onClick={() => handlePreview(doc.file)}
                          >
                            Preview
                          </Button>

                          <Button
                            size="xs"
                            color="blue"
                            onClick={() => handleDownload(doc.file)}
                          >
                            Unduh
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* INFORMASI */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <span className="font-bold text-blue-600">i</span>
            </div>

            <div>
              <h3 className="font-semibold text-blue-800">
                Informasi Pengajuan
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                Pastikan seluruh dokumen yang diunggah merupakan dokumen yang
                benar dan dapat terbaca dengan jelas. Dokumen dengan status{" "}
                <strong>Rejected</strong> dapat diperbarui melalui
                pengunggahan ulang.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}