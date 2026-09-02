import { Card, Button } from "flowbite-react";
import { Link, useParams, useLocation } from "react-router-dom";
import { HiArrowLeft, HiDocumentText, HiDownload } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// react-pdf butuh worker pdf.js. Diambil dari node_modules (dibundle
// Vite) supaya versinya SELALU cocok dengan pdfjs-dist yang ter-install,
// tidak bergantung ke CDN eksternal yang bisa beda versi / diblokir jaringan.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// =====================================================================
// PENTING: samain base URL ke satu tempat. IP ini beberapa kali berubah
// di file-file lain project ini (10.6.64.238, 10.6.65.141, 10.6.65.93).
// Pastikan ini benar-benar IP backend yang aktif sekarang.
// =====================================================================
const API_BASE_URL = "http://10.6.65.93:8000";

export default function TandaTangan() {
  const { id } = useParams();
  const location = useLocation();

  const stateData = location.state?.dataMahasiswa;

  const [loading, setLoading] = useState(!stateData);
  const [pengajuan, setPengajuan] = useState(stateData || null);
  const [submitting, setSubmitting] = useState(false);

  // PDF preview
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [numPages, setNumPages] = useState(null);

  // Buat ngukur lebar container supaya PDF di-render pas, tanpa
  // letterbox/celah di kiri-kanan.
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
  }, []);

  const today = new Date();

  const tanggalSurat = today.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // =========================================================
  // FETCH DETAIL PENGAJUAN
  // =========================================================
  useEffect(() => {
    if (!stateData) {
      fetchData();
    } else {
      setLoading(false);
    }

    fetchPreviewPdf();

    // cleanup Blob URL
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(

        `${API_BASE_URL}/api/pengajuan-clearing/${id}`,

        `http://10.6.65.93:8000/api/pengajuan-clearing/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const item = response.data?.data || response.data;

      setPengajuan({
        id: item.id,
        nama: item.user?.nama || item.nama || "-",
        nim: item.user?.nim || item.nim || "-",

        tanggal: item.created_at
          ? new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "-",

        departemen: item.departemen || item.user?.departemen || "-",

        status: item.status || "Menunggu TTD",

        created_at: item.created_at,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error);

      setLoading(false);
    }
  };

  // =========================================================
  // PREVIEW SURAT PDF
  // GET /pengajuan-clearing/{id}/preview-surat
  // =========================================================
  const fetchPreviewPdf = async () => {
    try {
      setLoadingPdf(true);

      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token tidak ditemukan");
        setLoadingPdf(false);
        return;
      }

      const response = await axios.get(

        `${API_BASE_URL}/api/pengajuan-clearing/${id}/preview-surat`,

        `http://10.6.65.93:8000/api/pengajuan-clearing/${id}/preview-surat`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
      setLoadingPdf(false);
    } catch (error) {
      console.error(
        "Gagal mengambil preview surat:",
        error.response?.data || error
      );

      setLoadingPdf(false);
    }
  };

  // =========================================================
  // BUKA PREVIEW DI TAB BARU
  // =========================================================
  const handlePreviewSurat = () => {
    if (!pdfUrl) {
      alert("Preview surat belum tersedia.");
      return;
    }

    window.open(pdfUrl, "_blank");
  };

  // =========================================================
  // DOWNLOAD / LIHAT SURAT FINAL
  // GET /pengajuan-clearing/{id}/download-surat
  // =========================================================
  const handleDownloadSurat = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        return;
      }

      const response = await axios.get(

        `${API_BASE_URL}/api/pengajuan-clearing/${id}/download-surat`,

        `http://10.6.65.93:8000/api/pengajuan-clearing/${id}/download-surat`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `surat-clearing-${pengajuan?.nim || id}.pdf`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal download surat:", error.response?.data || error);

      alert(error.response?.data?.message || "Gagal mendownload surat.");
    }
  };

  // =========================================================
  // SETUJUI CLEARING
  // POST /pengajuan-clearing/{id}/review-atasan
  // =========================================================
  const handleSetujui = async () => {
    const ttd = prompt("Ketik nama lengkap sebagai tanda tangan:");

    if (!ttd) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        setSubmitting(false);
        return;
      }

      await axios.post(

        `${API_BASE_URL}/api/pengajuan-clearing/${id}/review-atasan`,

        `http://10.6.65.93:8000/api/pengajuan-clearing/${id}/review-atasan`,

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

      alert("Dokumen berhasil ditandatangani!");

      window.location.href = `/verifikasi-qr/${id}`;
    } catch (error) {
      console.error("Error setujui:", error.response?.data || error);
      alert(
        error.response?.data?.message ||
          "Gagal menandatangani dokumen."
      );
      setSubmitting(false);
    }
  };

  // =========================================================
  // TOLAK CLEARING
  // POST /pengajuan-clearing/{id}/review-atasan
  // =========================================================
  const handleTolak = async () => {
    const alasan = prompt("Masukkan alasan penolakan:");

    if (!alasan) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        setSubmitting(false);
        return;
      }

      await axios.post(

        `${API_BASE_URL}/api/pengajuan-clearing/${id}/review-atasan`,

        `http://10.6.65.93:8000/api/pengajuan-clearing/${id}/review-atasan`,

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

      alert("Dokumen berhasil ditolak!");

      window.location.href = "/data-mahasiswa-atasan";
    } catch (error) {
      console.error("Error tolak:", error.response?.data || error);
      alert(
        error.response?.data?.message ||
          "Gagal menolak dokumen."
      );
      setSubmitting(false);
    }
  };

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
  // DATA TIDAK DITEMUKAN
  // =========================================================
  if (!pengajuan) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Data pengajuan tidak ditemukan.</p>

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
      {/* =====================================================
          BREADCRUMB
      ===================================================== */}
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

      {/* =====================================================
          TITLE
      ===================================================== */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Tanda Tangan Atasan
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===================================================
            KIRI - PREVIEW SURAT
        =================================================== */}
        <div className="bg-[#e6f6e9] p-6 rounded-xl border border-green-200">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg border border-green-200">
                <HiDocumentText className="w-5 h-5 text-green-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Surat Keterangan
                </h3>

                <p className="text-xs text-gray-500">Preview dokumen clearing</p>
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex gap-2"></div>
          </div>

          {/* =================================================
              PDF FRAME
              Dirender pakai react-pdf (canvas), bukan <iframe> browser
              native, supaya ukurannya presisi ngepas ke container -
              tidak ada letterbox/background gelap di kiri-kanan.
          ================================================= */}
          <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200">
            <div
              ref={pdfContainerRef}
              className="bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden relative flex justify-center"
            >
              {loadingPdf ? (
                <div
                  className="flex flex-col justify-center items-center text-gray-500 w-full"
                  style={{ aspectRatio: "208 / 295" }}
                >
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <span className="text-sm">Memuat surat...</span>
                </div>
              ) : pdfUrl ? (
                <Document
                  file={pdfUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <div
                      className="flex flex-col justify-center items-center text-gray-500 w-full"
                      style={{ aspectRatio: "208 / 295" }}
                    >
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <span className="text-sm">Merender surat...</span>
                    </div>
                  }
                  error={
                    <div
                      className="flex flex-col justify-center items-center text-gray-400 w-full"
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
              ) : (
                <div
                  className="flex flex-col justify-center items-center text-gray-400 w-full"
                  style={{ aspectRatio: "208 / 295" }}
                >
                  <HiDocumentText className="w-12 h-12 mb-3" />
                  <p className="text-sm">Preview surat tidak tersedia.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================
            KANAN
        =================================================== */}
        <div className="space-y-6">
          {/* =================================================
              INFORMASI DOKUMEN
          ================================================= */}
          <Card className="shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              Informasi Dokumen
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">Jenis Pengajuan</span>
                <span className="text-gray-900">Clearing</span>
              </div>

              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">Nama</span>
                <span className="text-gray-900 text-right">{pengajuan.nama}</span>
              </div>

              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">NIM</span>
                <span className="text-gray-900">{pengajuan.nim}</span>
              </div>

              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">Tanggal Pengajuan</span>
                <span className="text-gray-900 text-right">{pengajuan.tanggal}</span>
              </div>

              <div className="flex justify-between border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">Departemen</span>
                <span className="text-gray-900 text-right">{pengajuan.departemen}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-2 gap-4">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                  {pengajuan.status || "Menunggu TTD"}
                </span>
              </div>
            </div>
          </Card>

          {/* =================================================
              TINDAKAN
          ================================================= */}
          <Card className="shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Tindakan</h3>

            <p className="text-sm text-gray-500 mb-4">
              Dengan menandatangani dokumen ini, Anda menyetujui dokumen tersebut.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-[#2e1a7a] hover:bg-[#1e1260] text-white font-bold py-2.5"
                onClick={handleSetujui}
                disabled={submitting}
              >
                {submitting ? "Memproses..." : "Setujui & Tandatangani"}
              </Button>

              <Button
                className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2.5"
                onClick={handleTolak}
                disabled={submitting}
              >
                {submitting ? "Memproses..." : "Tolak Dokumen"}
              </Button>
            </div>
          </Card>

          {/* =================================================
              KEMBALI
          ================================================= */}
          <div className="pt-2">
            <Link to="/data-mahasiswa-atasan">
              <Button
                color="gray"
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 w-full lg:w-auto"
              >
                <HiArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}