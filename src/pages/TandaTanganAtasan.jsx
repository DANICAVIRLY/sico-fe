import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

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

      console.log("Data pengajuan:", response.data);

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

      console.log("Preview PDF berhasil");

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

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
          err.response?.data?.message ||
            "Gagal menampilkan preview surat."
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

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

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
        alert("Token tidak valid atau sesi login telah berakhir.");
      } else if (err.response?.status === 403) {
        alert("Anda tidak memiliki akses untuk mengunduh surat.");
      } else {
        alert(
          err.response?.data?.message ||
            "Gagal mengunduh surat."
        );
      }
    }
  };

  // =========================================================
  // SETUJUI PENGAJUAN
  // =========================================================
  const handleSetujui = async () => {
    if (!ttd.trim()) {
      alert("Silakan ketik nama lengkap sebagai tanda tangan.");
      return;
    }

    const konfirmasi = window.confirm(
      "Apakah Anda yakin ingin menyetujui pengajuan ini?"
    );

    if (!konfirmasi) {
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const token = getToken();

      const response = await axios.post(
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

      console.log("Response approve:", response.data);

      alert("Pengajuan berhasil disetujui.");

      // Redirect ke halaman verifikasi QR
      navigate(`/verifikasi-qr/${id}`);
    } catch (err) {
      console.error("Error approve:", err);

      if (err.response?.status === 401) {
        alert("Anda belum login atau token tidak valid.");
      } else if (err.response?.status === 403) {
        alert("Anda tidak memiliki izin untuk menyetujui pengajuan.");
      } else if (err.response?.status === 422) {
        alert(
          err.response?.data?.message ||
            "Pengajuan belum memenuhi syarat untuk disetujui."
        );
      } else {
        alert(
          err.response?.data?.message ||
            "Gagal menyetujui pengajuan."
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  // =========================================================
  // TOLAK PENGAJUAN
  // =========================================================
  const handleTolak = async () => {
    if (!alasan.trim()) {
      alert("Silakan masukkan alasan penolakan.");
      return;
    }

    const konfirmasi = window.confirm(
      "Apakah Anda yakin ingin menolak pengajuan ini?"
    );

    if (!konfirmasi) {
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const token = getToken();

      const response = await axios.post(
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

      console.log("Response reject:", response.data);

      alert("Pengajuan berhasil ditolak.");

      setShowTolak(false);
      setAlasan("");

      navigate("/dashboard-atasan");
    } catch (err) {
      console.error("Error reject:", err);

      if (err.response?.status === 401) {
        alert("Anda belum login atau token tidak valid.");
      } else if (err.response?.status === 403) {
        alert("Anda tidak memiliki izin untuk menolak pengajuan.");
      } else if (err.response?.status === 422) {
        alert(
          err.response?.data?.message ||
            "Pengajuan tidak dapat diproses."
        );
      } else {
        alert(
          err.response?.data?.message ||
            "Gagal menolak pengajuan."
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

    // Cleanup URL PDF ketika component di-unmount
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

          <p className="mt-4 text-gray-600">
            Memuat data pengajuan...
          </p>
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
          <div className="text-red-500 text-4xl mb-4">
            !
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Terjadi Kesalahan
          </h2>

          <p className="text-gray-600 mb-6">
            {error}
          </p>

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

        {/* HEADER */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Tanda Tangan Atasan
              </h1>

              <p className="text-gray-500 mt-1">
                Review dan persetujuan pengajuan clearing
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Kembali
            </button>
          </div>
        </div>

        {/* DATA PENGAJUAN */}
        {pengajuan && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Informasi Pengajuan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <p className="text-sm text-gray-500">
                  Nama Mahasiswa
                </p>

                <p className="font-medium text-gray-800">
                  {pengajuan.user?.name ||
                    pengajuan.mahasiswa?.nama ||
                    pengajuan.nama ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  NIM
                </p>

                <p className="font-medium text-gray-800">
                  {pengajuan.user?.nim ||
                    pengajuan.mahasiswa?.nim ||
                    pengajuan.nim ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Status
                </p>

                <span className="inline-block mt-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                  {pengajuan.status || "-"}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  ID Pengajuan
                </p>

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
          <div className="bg-white rounded-lg shadow-sm p-6">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Preview Surat Clearing
              </h2>

              <button
                onClick={handleDownloadSurat}
                disabled={!pdfUrl || loadingPdf}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Download
              </button>
            </div>

            {loadingPdf ? (
              <div className="h-[700px] flex items-center justify-center border rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>

                  <p className="mt-3 text-gray-500">
                    Memuat surat...
                  </p>
                </div>
              </div>
            ) : pdfUrl ? (
              <div className="border rounded-lg overflow-auto bg-gray-200 max-h-[700px]">

                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="p-10 text-center">
                      Memuat PDF...
                    </div>
                  }
                  error={
                    <div className="p-10 text-center text-red-500">
                      Gagal menampilkan PDF.
                    </div>
                  }
                >
                  {Array.from(
                    new Array(numPages || 0),
                    (_, index) => (
                      <div
                        key={`page_${index + 1}`}
                        className="flex justify-center mb-4"
                      >
                        <Page
                          pageNumber={index + 1}
                          width={550}
                        />
                      </div>
                    )
                  )}
                </Document>

              </div>
            ) : (
              <div className="h-[500px] flex items-center justify-center border rounded-lg">
                <p className="text-gray-500">
                  Preview surat tidak tersedia.
                </p>
              </div>
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

            {/* TTD */}
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

            {/* BUTTON */}
            <div className="space-y-3">

              <button
                onClick={handleSetujui}
                disabled={processing}
                className="w-full px-5 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing
                  ? "Memproses..."
                  : "Setujui & Tanda Tangani"}
              </button>

              <button
                onClick={() => setShowTolak(!showTolak)}
                disabled={processing}
                className="w-full px-5 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Tolak Pengajuan
              </button>

            </div>

            {/* FORM TOLAK */}
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
                    {processing
                      ? "Memproses..."
                      : "Konfirmasi Tolak"}
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

            {/* INFO */}
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
    </div>
  );
};

export default TandaTanganAtasan;