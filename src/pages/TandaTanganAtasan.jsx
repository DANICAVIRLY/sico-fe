import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";

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

const API_BASE_URL = "http://10.6.65.73:8000";

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

  // =====================================================================
  // Ganti window.confirm() -> modal konfirmasi custom.
  // confirmModal: null | "setuju"
  // (Tolak sudah punya konfirmasi sendiri lewat form + tombol
  // "Konfirmasi Tolak", jadi tidak perlu modal tambahan.)
  // =====================================================================
  const [confirmModal, setConfirmModal] = useState(null);

  // =====================================================================
  // Ganti window.alert() -> toast custom, auto-hilang sendiri.
  // =====================================================================
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Buat ngukur lebar container preview supaya PDF di-render pas,
  // tanpa celah/letterbox di kiri-kanan, dan responsive ke ukuran layar.
  const pdfContainerRef = useRef(null);
  const [pdfWidth, setPdfWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (pdfContainerRef.current) {
        setPdfWidth(pdfContainerRef.current.clientWidth - 40);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [pdfUrl]);

  // =========================================================
  // AMBIL TOKEN
  // =========================================================
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
  // SETUJUI PENGAJUAN
  // Klik tombol -> validasi -> buka modal konfirmasi custom ->
  // baru submit beneran setelah user klik "Ya, Setujui" di modal.
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
  // Form "Alasan Penolakan" + tombol "Konfirmasi Tolak" itu sendiri
  // sudah berfungsi sebagai langkah konfirmasi, jadi tidak perlu
  // window.confirm() tambahan.
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

      navigate("/dashboard-atasan");
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

  // =========================================================
  // PDF LOADED
  // =========================================================
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================
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

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pengajuan...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================
  if (error && !pengajuan) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* DATA PENGAJUAN */}
        {pengajuan && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informasi Pengajuan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nama Mahasiswa</p>
                <p className="font-medium text-gray-800">
                  {pengajuan.user?.nama ||
                    pengajuan.mahasiswa?.nama ||
                    pengajuan.nama ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">NIM</p>
                <p className="font-medium text-gray-800">
                  {pengajuan.user?.nim ||
                    pengajuan.mahasiswa?.nim ||
                    pengajuan.nim ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                  {pengajuan.status || "-"}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">ID Pengajuan</p>
                <p className="font-medium text-gray-800">
                  #{pengajuan.id || id}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && pengajuan && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* PREVIEW SURAT */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Preview Surat Clearing
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Pratinjau surat sebelum disetujui
                </p>
              </div>

              <button
                onClick={handleDownloadSurat}
                disabled={!pdfUrl || loadingPdf}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Download
              </button>
            </div>

            <div
              ref={pdfContainerRef}
              className="border border-gray-300 rounded-xl overflow-hidden bg-gray-50"
            >
              {loadingPdf ? (
                <div className="h-[500px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-gray-500 text-sm">
                      Memuat surat...
                    </p>
                  </div>
                </div>
              ) : pdfUrl ? (
                <div className="max-h-[850px] overflow-y-auto p-5">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="h-[500px] flex items-center justify-center">
                        <p className="text-gray-500">Memuat PDF...</p>
                      </div>
                    }
                    error={
                      <div className="h-[500px] flex items-center justify-center">
                        <p className="text-red-500">Gagal menampilkan PDF.</p>
                      </div>
                    }
                  >
                    {pdfWidth > 0 &&
                      Array.from(new Array(numPages || 1), (_, index) => (
                        <div
                          key={`page_${index + 1}`}
                          className="flex justify-center mb-5 last:mb-0"
                        >
                          <div className="shadow-md rounded-sm overflow-hidden">
                            <Page
                              pageNumber={index + 1}
                              width={pdfWidth}
                              renderAnnotationLayer={false}
                              renderTextLayer={false}
                            />
                          </div>
                        </div>
                      ))}
                  </Document>
                </div>
              ) : (
                <div className="h-[500px] flex items-center justify-center">
                  <p className="text-gray-500">Preview surat tidak tersedia.</p>
                </div>
              )}
            </div>

            {pdfUrl && numPages && (
              <p className="text-xs text-gray-500 text-center mt-3">
                {numPages} halaman
              </p>
            )}
          </div>

          {/* FORM TANDA TANGAN */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Persetujuan Atasan
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Masukkan nama lengkap sebagai tanda tangan persetujuan.
            </p>

            <div className="mb-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSetujuiClick}
                disabled={processing}
                className="w-full px-5 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? "Memproses..." : "Setujui & Tanda Tangani"}
              </button>

              <button
                onClick={() => setShowTolak(!showTolak)}
                disabled={processing}
                className="w-full px-5 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Tolak Pengajuan
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
                  rows={5}
                  disabled={processing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
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

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Perhatian:</strong> Setelah pengajuan disetujui,
                sistem akan membuat surat clearing final dan QR Code
                verifikasi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MODAL KONFIRMASI CUSTOM (pengganti window.confirm)
      ===================================================== */}
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
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Ya, Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          TOAST NOTIFIKASI CUSTOM (pengganti window.alert)
      ===================================================== */}
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