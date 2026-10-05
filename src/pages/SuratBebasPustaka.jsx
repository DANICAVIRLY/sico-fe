import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import { HiArrowLeft, HiDocumentText } from "react-icons/hi";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const API_BASE_URL = "http://172.18.160.91:8000";

// Halaman tujuan setelah klik "Kembali"
const HALAMAN_KEMBALI = "/data-pengajuan";

const SuratBebasPustaka = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pengajuan, setPengajuan] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [processing, setProcessing] = useState(false);

  // Toast notifikasi custom
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

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
  // DATA PENGAJUAN
  // Backend tidak punya endpoint show untuk bebas-pustaka, jadi data
  // diambil dari list (index) lalu dicari berdasarkan id.
  // =========================================================
  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError("");

      const token = getToken();

      const response = await axios.get(`${API_BASE_URL}/api/bebas-pustaka`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: { per_page: 1000 },
      });

      const payload = response.data?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const item = list.find((row) => String(row.id) === String(id));

      if (!item) {
        setError("Data pengajuan tidak ditemukan.");
        setPengajuan(null);
        return;
      }

      setPengajuan(item);
    } catch (err) {
      console.error("Error fetch data:", err);

      if (err.response?.status === 401) {
        setError("Anda belum login atau token tidak valid.");
      } else if (err.response?.status === 403) {
        setError("Anda tidak memiliki akses untuk halaman ini.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Gagal mengambil data pengajuan.",
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
      setPdfError("");

      const token = getToken();

      const response = await axios.get(
        `${API_BASE_URL}/api/bebas-pustaka/${id}/preview-surat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      setPdfUrl(window.URL.createObjectURL(blob));
    } catch (err) {
      console.error("Error preview PDF:", err);

      if (err.response?.status === 401) {
        setPdfError("Token tidak valid atau sesi login telah berakhir.");
      } else if (err.response?.status === 403) {
        setPdfError("Anda tidak memiliki akses untuk melihat surat.");
      } else if (err.response?.status === 404) {
        setPdfError("Surat belum tersedia.");
      } else {
        setPdfError("Gagal menampilkan preview surat.");
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
        `${API_BASE_URL}/api/bebas-pustaka/${id}/download-surat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `surat-bebas-pustaka-${id}.pdf`;
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
      } else if (err.response?.status === 404) {
        showToast("error", "Surat belum tersedia.");
      } else {
        showToast("error", "Gagal mengunduh surat.");
      }
    }
  };

  // =========================================================
  // SETUJUI & TANDATANGANI
  // =========================================================
  const handleSetujui = async () => {
    try {
      setProcessing(true);

      const token = getToken();

      await axios.post(
        `${API_BASE_URL}/api/bebas-pustaka/${id}/review`,
        {
          keputusan: "setuju",
          catatan_revisi: "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      showToast("success", "Pengajuan disetujui dan ditandatangani.");

      // Muat ulang status dan surat tanpa layar loading penuh
      await Promise.all([fetchData(true), fetchPreviewPdf()]);
    } catch (err) {
      console.error("Error approve:", err);

      const errors = err.response?.data?.errors;
      const detail = errors ? Object.values(errors).flat().join(" ") : null;

      if (err.response?.status === 401) {
        showToast("error", "Anda belum login atau token tidak valid.");
      } else if (err.response?.status === 403) {
        showToast(
          "error",
          "Anda tidak memiliki izin untuk menyetujui pengajuan.",
        );
      } else {
        showToast(
          "error",
          detail || err.response?.data?.message || "Gagal menyetujui pengajuan.",
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
  }, [id]);

  // Lepas memori blob saat PDF diganti atau halaman ditutup
  useEffect(() => {
    return () => {
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const statusLower = String(pengajuan?.status ?? "").toLowerCase();

  // Tombol "Setujui & Tandatangani" hanya untuk pengajuan yang belum diproses
  const bisaDisetujui = ["menunggu", "diajukan"].includes(statusLower);
  const statusClass =
    statusLower === "disetujui"
      ? "bg-green-100 text-green-700 border-green-300"
      : statusLower === "revisi" || statusLower === "ditolak"
        ? "bg-red-100 text-red-700 border-red-300"
        : "bg-yellow-100 text-yellow-700 border-yellow-300";

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
            to={HALAMAN_KEMBALI}
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
        <Link to={HALAMAN_KEMBALI} className="hover:underline">
          Data Pengajuan
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">Tanda Tangan</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Tanda Tangan Pustakawan
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
                  Surat Keterangan Bebas Pustaka
                </h3>
                <p className="text-xs text-gray-500">
                  Preview dokumen bebas pustaka
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
                  <p className="text-sm">
                    {pdfError || "Preview surat tidak tersedia."}
                  </p>
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
                <span className="text-gray-900">Bebas Pustaka</span>
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
                        { day: "2-digit", month: "long", year: "numeric" },
                      )
                    : "-"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">Departemen</span>
                <span className="text-gray-900 text-right">
                  {pengajuan?.user?.departemen ||
                    pengajuan?.departemen ||
                    pengajuan?.mahasiswa?.departemen ||
                    "-"}
                </span>
              </div>

              <div className="flex justify-between items-center border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">Status</span>
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${statusClass}`}
                >
                  {pengajuan?.status || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* TINDAKAN */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Tindakan</h3>

            <p className="text-sm text-gray-500 mb-4">
              {bisaDisetujui
                ? "Dengan menandatangani dokumen ini, Anda menyetujui dokumen tersebut."
                : "Pengajuan ini sudah diproses. Klik tombol di bawah untuk kembali ke Data Pengajuan."}
            </p>

            <button
              onClick={
                bisaDisetujui ? handleSetujui : () => navigate(HALAMAN_KEMBALI)
              }
              disabled={processing}
              className="w-full bg-[#2e1a7a] hover:bg-[#1e1260] text-white font-bold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing
                ? "Memproses..."
                : bisaDisetujui
                  ? "Setujui & Tandatangani"
                  : statusLower === "disetujui"
                    ? "Sudah Disetujui & Ditandatangani"
                    : "Sudah Diproses"}
            </button>
          </div>

          {/* KEMBALI */}
          <div className="pt-2">
            <Link to={HALAMAN_KEMBALI}>
              <button className="flex items-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg w-full lg:w-auto">
                <HiArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFIKASI CUSTOM */}
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

export default SuratBebasPustaka;