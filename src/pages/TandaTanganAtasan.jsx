import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import {
  HiArrowLeft,
  HiDocumentText,
} from "react-icons/hi";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// =====================================================================
// Worker PDF.js diambil dari node_modules (dibundle Vite), bukan CDN.
// Ini menghindari mismatch versi antara pdfjs-dist yang ter-install
// dengan file worker yang di-fetch dari luar (penyebab umum
// "Gagal merender surat").
// =====================================================================
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// =====================================================================
// PENTING: satu tempat buat base URL. IP ini beberapa kali berubah di
// project ini — pastikan ini IP backend yang aktif sekarang, dan samakan
// di semua file lain yang manggil backend yang sama.
// =====================================================================
const API_BASE_URL = "http://10.6.65.80:8000";

const TandaTanganAtasan = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pengajuan, setPengajuan] = useState(null);
  const [ttd, setTtd] = useState("");

  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");
  const [showTolak, setShowTolak] = useState(false);
  const [alasan, setAlasan] = useState("");

  // Modal konfirmasi custom (pengganti window.confirm)
  const [confirmModal, setConfirmModal] = useState(null); // null | "setuju"

  // Toast notifikasi custom (pengganti window.alert)
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Lebar container preview, diukur otomatis biar PDF pas ngisi penuh
  // tanpa celah/letterbox dan tetap responsive.
  const pdfContainerRef = useRef(null);
  const [pdfWidth, setPdfWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (pdfContainerRef.current) {
        setPdfWidth(pdfContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [pdfUrl]);

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Anda belum login atau token tidak ditemukan.");
    }
    return token;
  };

  // =========================================================
  // FETCH DATA PENGAJUAN
  // =========================================================
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await axios.get(
        `${API_BASE_URL}/api/pengajuan-clearing/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setPengajuan(response.data.data || response.data);
    } catch (err) {
      console.error("Error fetch data:", err);

      if (err.response?.status === 401) {
        setError("Anda belum login atau token tidak valid.");
      } else if (err.response?.status === 403) {
        setError("Anda tidak memiliki akses untuk halaman ini.");
      } else if (err.response?.status === 404) {
        setError("Data pengajuan tidak ditemukan.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Gagal mengambil data pengajuan."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // PREVIEW SURAT
  // =========================================================
  const fetchPreviewPdf = async () => {
    try {
      setLoadingPdf(true);
      setError("");

      const token = getToken();

      const response = await axios.get(
        `${API_BASE_URL}/api/pengajuan-clearing/${id}/preview-surat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("Error preview PDF:", err);

      if (err.response?.status === 401) {
        setError("Token tidak valid atau sesi login telah berakhir.");
      } else if (err.response?.status === 403) {
        setError("Anda tidak memiliki akses untuk melihat surat.");
      } else {
        setError(
          err.response?.data?.message || "Gagal menampilkan preview surat."
        );
      }
    } finally {
      setLoadingPdf(false);
    }
  };

  // =========================================================
  // DOWNLOAD SURAT
  // =========================================================
  const handleDownloadSurat = async () => {
    try {
      const token = getToken();

      const response = await axios.get(
        `${API_BASE_URL}/api/pengajuan-clearing/${id}/download-surat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `surat-clearing-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error download surat:", err);

      if (err.response?.status === 401) {
        showToast("error", "Token tidak valid atau sesi login telah berakhir.");
      } else if (err.response?.status === 403) {
        showToast("error", "Anda tidak memiliki akses untuk mengunduh surat.");
      } else {
        showToast(
          "error",
          err.response?.data?.message || "Gagal mengunduh surat."
        );
      }
    }
  };

  // =========================================================
  // SETUJUI PENGAJUAN (validasi -> modal custom -> submit)
  // =========================================================
  const handleSetujuiClick = () => {
    if (!ttd.trim()) {
      showToast("error", "Silakan ketik nama lengkap sebagai tanda tangan.");
      return;
    }
    setConfirmModal("setuju");
  };

  const doSetujui = async () => {
    setConfirmModal(null);

    try {
      setProcessing(true);
      setError("");

      const token = getToken();

      await axios.post(
        `${API_BASE_URL}/api/pengajuan-clearing/${id}/review-atasan`,
        {
          keputusan: "setuju",
          catatan: `Disetujui oleh atasan: ${ttd}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      navigate(`/verifikasi-qr/${id}`);
    } catch (err) {
      console.error("Error approve:", err);

      if (err.response?.status === 401) {
        showToast("error", "Anda belum login atau token tidak valid.");
      } else if (err.response?.status === 403) {
        showToast("error", "Anda tidak memiliki izin untuk menyetujui pengajuan.");
      } else if (err.response?.status === 422) {
        showToast(
          "error",
          err.response?.data?.message ||
            "Pengajuan belum memenuhi syarat untuk disetujui."
        );
      } else {
        showToast(
          "error",
          err.response?.data?.message || "Gagal menyetujui pengajuan."
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  // =========================================================
  // TOLAK PENGAJUAN
  // Form alasan + tombol "Konfirmasi Tolak" sudah jadi langkah
  // konfirmasinya sendiri, jadi tidak perlu window.confirm tambahan.
  // =========================================================
  const handleTolak = async () => {
    if (!alasan.trim()) {
      showToast("error", "Silakan masukkan alasan penolakan.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const token = getToken();

      await axios.post(
        `${API_BASE_URL}/api/pengajuan-clearing/${id}/review-atasan`,
        {
          keputusan: "tolak",
          catatan: alasan,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      setShowTolak(false);
      setAlasan("");
      navigate("/data-mahasiswa-atasan");
    } catch (err) {
      console.error("Error reject:", err);

      if (err.response?.status === 401) {
        showToast("error", "Anda belum login atau token tidak valid.");
      } else if (err.response?.status === 403) {
        showToast("error", "Anda tidak memiliki izin untuk menolak pengajuan.");
      } else if (err.response?.status === 422) {
        showToast(
          "error",
          err.response?.data?.message || "Pengajuan tidak dapat diproses."
        );
      } else {
        showToast(
          "error",
          err.response?.data?.message || "Gagal menolak pengajuan."
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    if (!id) {
      setError("ID pengajuan tidak ditemukan.");
      setLoading(false);
      return;
    }

    fetchData();
    fetchPreviewPdf();

    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id]);

  // Kalau pengajuan sudah diproses (disetujui/ditolak), form
  // "Tindakan" tidak perlu ditampilkan lagi.
  const statusPengajuan = String(pengajuan?.status ?? "").toLowerCase();
  const sudahDiproses = ["disetujui", "ditolak"].includes(statusPengajuan);

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR (data gagal diambil sama sekali)
  // =========================================================
  if (error && !pengajuan) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">{error}</p>
          <Link
            to="/data-mahasiswa-atasan"
            className="text-indigo-600 hover:underline mt-2 inline-block"
          >
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="max-w-6xl mx-auto p-4">

      {/* BREADCRUMB */}
      <div className="text-sm text-gray-500 mb-4 flex gap-2">
        <Link to="/dashboard-atasan" className="hover:underline">
          Dashboard
        </Link>
        <span>›</span>
        <Link to="/data-mahasiswa-atasan" className="hover:underline">
          Menunggu Tanda Tangan
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">Tanda Tangan</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Tanda Tangan Atasan
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* KIRI - PREVIEW SURAT */}
        <div className="bg-[#e6f6e9] p-6 rounded-xl border border-green-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg border border-green-200">
                <HiDocumentText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Surat Keterangan
                </h3>
                <p className="text-xs text-gray-500">
                  Preview dokumen clearing
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadSurat}
              disabled={!pdfUrl || loadingPdf}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200">
            <div
              ref={pdfContainerRef}
              className="bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden relative"
            >
              {loadingPdf ? (
                <div
                  className="flex flex-col justify-center items-center text-gray-500"
                  style={{ aspectRatio: "208 / 295" }}
                >
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <span className="text-sm">Memuat surat...</span>
                </div>
              ) : pdfUrl ? (
                <div className="max-h-[850px] overflow-y-auto">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div
                        className="flex flex-col justify-center items-center text-gray-500"
                        style={{ aspectRatio: "208 / 295" }}
                      >
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <span className="text-sm">Merender surat...</span>
                      </div>
                    }
                    error={
                      <div
                        className="flex flex-col justify-center items-center text-gray-400"
                        style={{ aspectRatio: "208 / 295" }}
                      >
                        <HiDocumentText className="w-12 h-12 mb-3" />
                        <p className="text-sm">Gagal merender surat.</p>
                      </div>
                    }
                  >
                    {pdfWidth > 0 &&
                      Array.from(new Array(numPages || 1), (_, index) => (
                        <Page
                          key={`page_${index + 1}`}
                          pageNumber={index + 1}
                          width={pdfWidth}
                          renderAnnotationLayer={false}
                          renderTextLayer={false}
                        />
                      ))}
                  </Document>
                </div>
              ) : (
                <div
                  className="flex flex-col justify-center items-center text-gray-400"
                  style={{ aspectRatio: "208 / 295" }}
                >
                  <HiDocumentText className="w-12 h-12 mb-3" />
                  <p className="text-sm">Preview surat tidak tersedia.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KANAN */}
        <div className="space-y-6">

          {/* INFORMASI DOKUMEN */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              Informasi Dokumen
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">
                  Jenis Pengajuan
                </span>
                <span className="text-gray-900">Clearing</span>
              </div>

              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">Nama</span>
                <span className="text-gray-900 text-right">
                  {pengajuan?.user?.nama ||
                    pengajuan?.mahasiswa?.nama ||
                    pengajuan?.nama ||
                    "-"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">NIM</span>
                <span className="text-gray-900">
                  {pengajuan?.user?.nim ||
                    pengajuan?.mahasiswa?.nim ||
                    pengajuan?.nim ||
                    "-"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">
                  Tanggal Pengajuan
                </span>
                <span className="text-gray-900 text-right">
                  {pengajuan?.created_at
                    ? new Date(pengajuan.created_at).toLocaleDateString(
                        "id-ID",
                        { day: "2-digit", month: "long", year: "numeric" }
                      )
                    : "-"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">Departemen</span>
                <span className="text-gray-900 text-right">
                  {pengajuan?.departemen || "-"}
                </span>
              </div>

              <div className="flex justify-between items-center border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                  {pengajuan?.status || "Menunggu TTD"}
                </span>
              </div>
            </div>
          </div>

          {/* TINDAKAN — disembunyikan kalau sudah disetujui/ditolak */}
          {!sudahDiproses && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Tindakan
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Dengan menandatangani dokumen ini, Anda menyetujui dokumen
                tersebut.
              </p>

              <div className="mb-4">
                <label
                  htmlFor="ttd"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nama Lengkap
                </label>
                <input
                  id="ttd"
                  type="text"
                  value={ttd}
                  onChange={(e) => setTtd(e.target.value)}
                  placeholder="Ketik nama lengkap sebagai tanda tangan"
                  disabled={processing}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSetujuiClick}
                  disabled={processing}
                  className="w-full bg-[#2e1a7a] hover:bg-[#1e1260] text-white font-bold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Memproses..." : "Setujui & Tandatangani"}
                </button>

              </div>

              {showTolak && (
                <div className="mt-6 pt-6 border-t">
                  <label
                    htmlFor="alasan"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Alasan Penolakan
                  </label>
                  <textarea
                    id="alasan"
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    placeholder="Masukkan alasan penolakan..."
                    rows={4}
                    disabled={processing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleTolak}
                      disabled={processing}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {processing ? "Memproses..." : "Konfirmasi Tolak"}
                    </button>
                    <button
                      onClick={() => {
                        setShowTolak(false);
                        setAlasan("");
                      }}
                      disabled={processing}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Kalau sudah diproses, tampilkan status singkat sebagai gantinya */}
          {sudahDiproses && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Tindakan
              </h3>
              <p className="text-sm text-gray-600">
                Pengajuan ini sudah{" "}
                <strong>
                  {statusPengajuan === "disetujui" ? "disetujui" : "ditolak"}
                </strong>
                . Tidak ada tindakan lanjutan yang diperlukan.
              </p>
            </div>
          )}

          {/* KEMBALI */}
          <div className="pt-2">
            <Link to="/data-mahasiswa-atasan">
              <button className="flex items-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg w-full lg:w-auto">
                <HiArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </button>
            </Link>
          </div>

        </div>
      </div>

      {/* MODAL KONFIRMASI CUSTOM (pengganti window.confirm) */}
      {confirmModal === "setuju" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Setujui Pengajuan?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin menyetujui pengajuan ini? Surat
              clearing final akan diterbitkan setelah ini.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Batal
              </button>
              <button
                onClick={doSetujui}
                className="flex-1 px-4 py-2 bg-[#2e1a7a] hover:bg-[#1e1260] text-white rounded-lg font-medium"
              >
                Ya, Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFIKASI CUSTOM (pengganti window.alert) */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 max-w-sm px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default TandaTanganAtasan;