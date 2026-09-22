import { Button, Card, Textarea, Badge } from "flowbite-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiCheckCircle,
  HiExclamationCircle,
  HiEye,
  HiDownload,
} from "react-icons/hi";
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://172.18.160.202:8000";

export default function DetailVerifikasi() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [catatan, setCatatan] = useState("");
  const [statusPeminjaman, setStatusPeminjaman] = useState("");
  const [statusDenda, setStatusDenda] = useState("");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Modal konfirmasi
  const [confirmModal, setConfirmModal] = useState(false);

  const extractArray = (payload) => {
    if (Array.isArray(payload)) return payload;

    if (!payload || typeof payload !== "object") return null;

    const commonKeys = [
      "data",
      "items",
      "result",
      "results",
      "bebas_pustaka",
      "pengajuan",
      "list",
    ];

    for (const key of commonKeys) {
      if (Array.isArray(payload[key])) {
        return payload[key];
      }
    }

    for (const key of commonKeys) {
      if (payload[key] && typeof payload[key] === "object") {
        const nested = extractArray(payload[key]);

        if (Array.isArray(nested)) {
          return nested;
        }
      }
    }

    for (const value of Object.values(payload)) {
      if (Array.isArray(value)) {
        return value;
      }
    }

    return null;
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // =====================================================
  // AMBIL DATA PENGAJUAN
  // =====================================================

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const token = localStorage.getItem("token");

      // Backend tidak punya endpoint show single-item untuk bebas-pustaka,
      // jadi kita ambil dari list (index). per_page dibikin besar supaya
      // data mahasiswa yang dicari tidak "tenggelam" di halaman pagination
      // lain (default backend per_page = 15).
      const response = await axios.get(
        `${API_BASE_URL}/api/bebas-pustaka`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          params: {
            per_page: 1000,
          },
        }
      );

      console.log("DATA BEBAS PUSTAKA:", response.data);

      const list = extractArray(response.data?.data);

      if (!Array.isArray(list)) {
        console.error("Data list bukan array:", response.data);

        setErrorMsg("Data pengajuan tidak ditemukan.");
        setDetail(null);

        return;
      }

      const item = list.find(
        (row) => String(row.id) === String(id)
      );

      if (!item) {
        console.error(
          "Item dengan id",
          id,
          "tidak ditemukan:",
          list
        );

        setErrorMsg("Data pengajuan tidak ditemukan.");
        setDetail(null);

        return;
      }

      console.log("DATA MAHASISWA TERPILIH:", item);
      console.log("FILE SKRIPSI (raw):", item.file_skripsi);

      const mapped = {
        id: item.id,

        // Controller pakai with('user'), jadi nama/nim ada di item.user.*
        nama:
          item.user?.nama ||
          item.nama ||
          item.mahasiswa?.nama ||
          "-",

        nim:
          item.user?.nim ||
          item.nim ||
          item.mahasiswa?.nim ||
          "-",

        departemen:
          item.user?.departemen ||
          item.departemen ||
          item.mahasiswa?.departemen ||
          "-",

        status: item.status || "menunggu",

        tanggal: item.created_at
          ? new Date(item.created_at).toLocaleDateString(
              "id-ID",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )
          : "-",

        peminjamanBuku:
          item.status_peminjaman || item.peminjaman_buku || "Tidak ada",

        denda:
          item.status_denda || item.denda || "Tidak ada",

        catatanAwal:
          item.catatan_revisi || "",

        diverifikasiOleh:
          item.reviewer?.nama ||
          item.reviewed_by?.nama ||
          item.diverifikasi_oleh ||
          "-",

        // Backend TIDAK mengirim path asli file_skripsi di response list
        // (kemungkinan demi keamanan), yang dikirim cuma flag boolean
        // "ada_file_skripsi". Endpoint preview/download tetap bisa dipanggil
        // pakai ID saja, jadi kita tidak butuh path aslinya di frontend.
        fileSkripsi: item.ada_file_skripsi ? true : null,
      };

      console.log("FILE SKRIPSI (mapped):", mapped.fileSkripsi);

      setDetail(mapped);

      setStatusPeminjaman(
        mapped.peminjamanBuku
      );

      setStatusDenda(
        mapped.denda
      );

      setCatatan(
        mapped.catatanAwal
      );

    } catch (error) {
      console.error(
        "Error fetching detail:",
        error
      );

      if (error.response) {
        console.error(
          "STATUS:",
          error.response.status
        );

        console.error(
          "RESPONSE:",
          error.response.data
        );
      }

      setErrorMsg(
        "Gagal mengambil data dari server."
      );

      setDetail(null);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PREVIEW PDF
  // =====================================================

  const handlePreviewSkripsi = async () => {
    if (!detail?.fileSkripsi) {
      alert("File skripsi tidak ditemukan.");
      return;
    }

    try {
      setPreviewLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/api/bebas-pustaka/${id}/preview-skripsi`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },

          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);

    } catch (error) {
      console.error(
        "Gagal preview skripsi:",
        error
      );

      console.error(
        "Response:",
        error.response?.data
      );

      alert(
        "Gagal membuka file skripsi."
      );

    } finally {
      setPreviewLoading(false);
    }
  };

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  const handleDownloadSkripsi = async () => {
    if (!detail?.fileSkripsi) {
      alert("File skripsi tidak ditemukan.");
      return;
    }

    try {
      setDownloadLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/api/bebas-pustaka/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },

          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `skripsi-${detail?.nim || id}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(
        "Gagal download skripsi:",
        error
      );

      console.error(
        "Response:",
        error.response?.data
      );

      alert(
        "Gagal mengunduh file skripsi."
      );

    } finally {
      setDownloadLoading(false);
    }
  };

  // =====================================================
  // KIRIM KEPUTUSAN
  // =====================================================

  const kirimKeputusan = async (
    keputusan
  ) => {
    try {
      setSubmitting(true);

      const token =
        localStorage.getItem("token");

      await axios.post(
        `${API_BASE_URL}/api/bebas-pustaka/${id}/review`,
        {
          keputusan,
          catatan_revisi: catatan,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (keputusan === "setuju") {
        const userData =
          JSON.parse(
            localStorage.getItem("user") ||
              "null"
          );

        navigate(
          "/verifikasi-berhasil",
          {
            state: {
              id: detail.id,
              nama: detail.nama,
              nim: detail.nim,
              tanggal: detail.tanggal,
              departemen:
                detail.departemen,
              diverifikasiOleh:
                userData?.nama || "-",
              catatanPustakawan:
                catatan,
              fileSkripsi:
                detail.fileSkripsi,
            },
          }
        );
      } else {
        navigate(
          "/data-pengajuan"
        );
      }

    } catch (error) {
      console.error(
        "Error submit keputusan:",
        error
      );

      if (error.response) {
        console.error(
          "STATUS:",
          error.response.status
        );

        console.error(
          "RESPONSE:",
          error.response.data
        );
      }

      setErrorMsg(
        "Gagal mengirim keputusan verifikasi."
      );

    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // MODAL VERIFIKASI
  // =====================================================

  const handleVerifikasiLulusClick =
    () => {
      setConfirmModal(true);
    };

  const doVerifikasiLulus = () => {
    setConfirmModal(false);

    kirimKeputusan(
      "setuju"
    );
  };

  // =====================================================
  // STATUS FINAL
  // =====================================================

  const statusFinal = [
    "disetujui",
    "revisi",
  ];

  const sudahDiproses =
    detail &&
    statusFinal.includes(
      String(
        detail.status
      ).toLowerCase()
    );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center h-64">
        <p className="text-gray-500">
          Loading data...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (errorMsg || !detail) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <p className="text-red-500 mb-4">
          {errorMsg ||
            "Data tidak ditemukan."}
        </p>

        <Link to="/data-pengajuan">
          <Button color="gray">
            <HiArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>
    );
  }

  // =====================================================
  // SUDAH DIPROSES
  // =====================================================

  if (sudahDiproses) {
    const statusLower =
      String(
        detail.status
      ).toLowerCase();

    const tampilan =
      statusLower === "revisi"
        ? {
            icon:
              HiExclamationCircle,

            warna:
              "bg-yellow-500",

            judul:
              "Pengajuan Perlu Revisi",

            sub:
              "Mahasiswa perlu memperbaiki pengajuan",
          }
        : {
            icon:
              HiCheckCircle,

            warna:
              "bg-green-500",

            judul:
              "Verifikasi Perpustakaan Berhasil",

            sub:
              "Mahasiswa dinyatakan bebas pustaka",
          };

    const Icon =
      tampilan.icon;

    const rows = [
      {
        label: "Nama",
        value: detail.nama,
      },

      {
        label: "NIM",
        value: detail.nim,
      },

      {
        label: "Tanggal",
        value: detail.tanggal,
      },

      {
        label: "Diverifikasi Oleh",
        value:
          detail.diverifikasiOleh,
      },

      {
        label: "Departemen",
        value:
          detail.departemen,
      },

      {
        label: "Catatan",
        value:
          detail.catatanAwal ||
          "-",
      },
    ];

    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">

        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-800">
            Hasil Verifikasi
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Data mahasiswa - detail - surat bebas clearing
          </p>
        </div>

        <Card className="w-full shadow-md">

          <div className="flex flex-col items-center p-3 sm:p-6">

            <div
              className={`${tampilan.warna} rounded-full p-3 sm:p-4 mb-4 text-white`}
            >
              <Icon className="w-9 h-9 sm:w-12 sm:h-12" />
            </div>

            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-center px-2">
              {tampilan.judul}
            </h2>

            <p className="text-sm sm:text-base text-gray-600 text-center mb-6 px-2">
              {tampilan.sub}
            </p>

            {/* DATA MAHASISWA */}

            <div className="w-full border border-gray-200 rounded-lg overflow-hidden mb-6">

              {rows.map(
                (row, index) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-1 sm:grid-cols-2 ${
                      index !==
                      rows.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    <div className="p-3 sm:p-4 bg-gray-50 font-bold text-gray-700 border-b sm:border-b-0 sm:border-r border-gray-200 text-sm sm:text-base">
                      {row.label}
                    </div>

                    <div className="p-3 sm:p-4 text-gray-800 text-sm sm:text-base break-words">
                      {row.value}
                    </div>
                  </div>
                )
              )}

            </div>

            {/* DOKUMEN PDF */}

            {detail.fileSkripsi && (
              <div className="w-full border border-gray-200 rounded-lg p-4 mb-6">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-red-600 font-bold text-xs">
                        PDF
                      </span>
                    </div>

                    <div className="min-w-0">

                      <p className="font-medium text-gray-800 truncate">
                        {`skripsi-${detail.nim || detail.id}.pdf`}
                      </p>

                      <p className="text-xs text-gray-500">
                        Dokumen skripsi mahasiswa
                      </p>

                    </div>

                  </div>

                  <div className="flex gap-2 shrink-0">

                    <Button
                      size="sm"
                      color="light"
                      onClick={
                        handlePreviewSkripsi
                      }
                      disabled={
                        previewLoading
                      }
                    >
                      <HiEye className="mr-2 h-4 w-4" />

                      {previewLoading
                        ? "Membuka..."
                        : "Preview"}
                    </Button>

                    <Button
                      size="sm"
                      color="blue"
                      onClick={
                        handleDownloadSkripsi
                      }
                      disabled={
                        downloadLoading
                      }
                    >
                      <HiDownload className="mr-2 h-4 w-4" />

                      {downloadLoading
                        ? "Mengunduh..."
                        : "Download"}
                    </Button>

                  </div>

                </div>

              </div>
            )}

            <Link
              to="/data-pengajuan"
              className="w-full sm:w-auto"
            >
              <Button
                color="light"
                className="w-full sm:w-auto border border-gray-300 text-blue-600 font-medium hover:bg-gray-50"
              >
                <HiArrowLeft className="mr-2 h-5 w-5" />
                Kembali Ke Dashboard
              </Button>
            </Link>

          </div>
        </Card>

      </div>
    );
  }

  // =====================================================
  // HALAMAN VERIFIKASI
  // =====================================================

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">

      <div className="mb-4 sm:mb-6">

        <h1 className="text-xl sm:text-2xl font-bold text-blue-800">
          Hasil Verifikasi
        </h1>

        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Data mahasiswa - detail - surat bebas clearing
        </p>

      </div>

      <div className="flex flex-col gap-4 sm:gap-6">

        {/* DATA MAHASISWA */}

        <Card>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                {detail.nama}
              </h2>

              <div className="flex flex-wrap gap-2 mt-2">

                <Badge
                  color="success"
                  className="text-xs"
                >
                  {detail.status}
                </Badge>

                <Badge
                  color="indigo"
                  className="text-xs"
                >
                  verifikasi perpustakaan
                </Badge>

              </div>

            </div>

            <div className="text-left sm:text-right text-sm text-gray-600">

              <p>
                pengajuan clearing
              </p>

              <p className="text-xs">
                {detail.tanggal}
              </p>

            </div>

          </div>

        </Card>

        {/* SYARAT */}

        <Card>

          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">
            Syarat Bebas Pustaka
          </h3>

          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">

            <li>
              Tidak memiliki buku yang masih dipinjam.
            </li>

            <li>
              Tidak memiliki tanggungan denda perpustakaan.
            </li>

            <li>
              Jika persyaratan belum terpenuhi,
              silakan lengkapi sesuai catatan
              syarat yang belum terpenuhi.
            </li>

          </ol>

        </Card>

        {/* =================================================
            DOKUMEN PDF MAHASISWA
        ================================================= */}

        <Card>

          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">
            Dokumen Skripsi
          </h3>

          {detail.fileSkripsi ? (

            <div className="border border-gray-200 rounded-lg p-4">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                {/* FILE */}

                <div className="flex items-center gap-3 min-w-0">

                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center shrink-0">

                    <span className="text-red-600 font-bold text-xs">
                      PDF
                    </span>

                  </div>

                  <div className="min-w-0">

                    <p className="font-medium text-gray-800 truncate">
                      {`skripsi-${detail.nim || detail.id}.pdf`}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      File yang diupload mahasiswa
                    </p>

                  </div>

                </div>

                {/* BUTTON */}

                <div className="flex gap-2 shrink-0">

                  <Button
                    size="sm"
                    color="light"
                    onClick={
                      handlePreviewSkripsi
                    }
                    disabled={
                      previewLoading
                    }
                  >
                    <HiEye className="mr-2 h-4 w-4" />

                    {previewLoading
                      ? "Membuka..."
                      : "Preview"}
                  </Button>

                  <Button
                    size="sm"
                    color="blue"
                    onClick={
                      handleDownloadSkripsi
                    }
                    disabled={
                      downloadLoading
                    }
                  >
                    <HiDownload className="mr-2 h-4 w-4" />

                    {downloadLoading
                      ? "Mengunduh..."
                      : "Download"}
                  </Button>

                </div>

              </div>

            </div>

          ) : (

            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">

              <p className="text-sm text-gray-400">
                File skripsi belum ditemukan.
              </p>

            </div>

          )}

        </Card>

        {/* CATATAN */}

        <Card>

          <h3 className="font-bold text-gray-800 mb-2">
            Catatan Pustakawan
          </h3>

          <Textarea
            id="catatan"
            placeholder="Tulis catatan jika ada..."
            rows={3}
            className="w-full"
            value={catatan}
            onChange={(e) =>
              setCatatan(
                e.target.value
              )
            }
          />

        </Card>

        {errorMsg && (
          <p className="text-red-500 text-sm">
            {errorMsg}
          </p>
        )}

        {/* TOMBOL */}

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-2">

          <Link
            to="/data-pengajuan"
            className="w-full sm:w-auto"
          >
            <Button
              color="gray"
              className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>

          <Button
            color="warning"
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white"
            disabled={submitting}
            onClick={() =>
              kirimKeputusan(
                "revisi"
              )
            }
          >
            Revisi
          </Button>

          <Button
            className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900"
            disabled={submitting}
            onClick={
              handleVerifikasiLulusClick
            }
          >
            Verifikasi Lulus
          </Button>

        </div>

      </div>

      {/* =====================================================
          MODAL KONFIRMASI
      ===================================================== */}

      {confirmModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verifikasi Lulus?
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin meluluskan
              verifikasi bebas pustaka mahasiswa ini?
            </p>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  setConfirmModal(false)
                }
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Batal
              </button>

              <button
                onClick={
                  doVerifikasiLulus
                }
                className="flex-1 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-medium"
              >
                Ya, Setujui
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}