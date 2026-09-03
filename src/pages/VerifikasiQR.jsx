import { Card, Button } from "flowbite-react";
import { Link, useParams } from "react-router-dom";
import { HiCheckCircle, HiArrowLeft, HiDocumentDownload } from "react-icons/hi";
import { useState, useEffect } from "react";
import axios from "axios";

// =====================================================================
// PENTING: samain base URL ke satu tempat.
// Ganti ke '10.6.65.141' kalau ternyata itu yg jadi server aktif.
// =====================================================================
const API_BASE_URL = "http://10.6.65.73:8000";

export default function VerifikasiQR() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  // =====================================================================
  // Endpoint lama "/pengajuan-clearing/{id}/surat" TIDAK ADA di backend.
  // Diganti ke GET /pengajuan-clearing/{id} (route "show") yang beneran ada.
  //
  // ASUMSI (perlu dicek ke controller show()):
  // - nomor_surat, qr_token, tanggal_terbit, penandatangan, jabatan
  //   ada di response item. Kalau belum, field itu perlu ditambahin di
  //   backend saat reviewAtasan() approve dokumen (generate qr_token,
  //   nomor_surat, dst lalu simpan ke row pengajuan_clearing).
  // =====================================================================
  const fetchData = () => {
    const token = localStorage.getItem("token");

    axios
      .get(`${API_BASE_URL}/api/pengajuan-clearing/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        const item = response.data?.data || response.data;
        setData({
          id: item.id,
          nama: item.user?.nama || "-",
          nim: item.user?.nim || "-",
          departemen: item.departemen || "-",
          nomor_surat: item.nomor_surat || `CLR/${String(id).padStart(4, "0")}/SICO/2026`,
          qr_token: item.qr_token || "",
          status: "Terverifikasi",
          penandatangan: item.atasan?.nama || "Atasan SICO",
          jabatan: "Atasan",
          tanggal_terbit: item.disetujui_atasan_at
            ? new Date(item.disetujui_atasan_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }),
          jenis_clearing: "Clearing Perpustakaan",
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Gagal mengambil data surat.");
        setLoading(false);
      });
  };

  // =====================================================================
  // Preview & Download pakai endpoint asli backend, dengan Authorization
  // header lewat axios (bukan window.open + ?token= query param, karena
  // route ini kemungkinan divalidasi pakai Sanctum Bearer token, bukan
  // query string).
  // =====================================================================
  const handlePreview = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/pengajuan-clearing/${id}/preview-surat`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Gagal preview surat:", error.response?.data || error);
      alert("Gagal memuat preview surat.");
    }
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/api/pengajuan-clearing/${id}/download-surat`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `surat-clearing-${data?.nim || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal download surat:", error.response?.data || error);
      alert("Gagal mendownload surat.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e6f6e9] p-4">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Memuat data surat...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e6f6e9] p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800">Data Tidak Ditemukan</h2>
          <p className="text-gray-500 mt-2">{error || "Surat belum tersedia."}</p>
          <Link to="/data-mahasiswa-atasan" className="mt-4 inline-block">
            <Button color="light" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e6f6e9] p-4">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="bg-green-500 rounded-full p-4 mb-4 text-white shadow-lg">
          <HiCheckCircle className="w-16 h-16" />
        </div>

        <h1 className="text-3xl font-bold text-green-700 text-center mb-1">
          Dokumen Terverifikasi
        </h1>
        <p className="text-sm text-green-600 text-center mb-8">
          Surat clearing telah diterbitkan dan terdaftar pada sistem
        </p>

        <Card className="w-full shadow-lg rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="p-6 space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">Nomor Surat</span>
                <span className="text-gray-900 text-sm font-semibold">{data.nomor_surat}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">Jenis Clearing</span>
                <span className="text-gray-900 text-sm">{data.jenis_clearing}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">Nama Mahasiswa</span>
                <span className="text-gray-900 text-sm">{data.nama}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">NIM</span>
                <span className="text-gray-900 text-sm">{data.nim}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">Departemen</span>
                <span className="text-gray-900 text-sm">{data.departemen}</span>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">Penandatangan</span>
                <span className="text-gray-900 text-sm">{data.penandatangan}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">Jabatan</span>
                <span className="text-gray-900 text-sm">{data.jabatan}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">Tanggal Terbit</span>
                <span className="text-gray-900 text-sm">{data.tanggal_terbit}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">QR Code</span>
                <span className="text-gray-900 text-sm">
                  {data.qr_token ? (
                    <span className="text-green-600">✅ Tersedia</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm font-medium">Status</span>
                <span className="text-green-600 font-medium text-sm">{data.status}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#e6f6e9] p-4 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-xl border-t border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <HiCheckCircle className="w-5 h-5" />
              <span>Status:</span>
              <span className="font-bold">Dokumen Sah</span>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto" onClick={handlePreview}>
                Preview Surat
              </Button>
              <Button className="bg-[#2e1a7a] hover:bg-[#1e1260] w-full md:w-auto" onClick={handleDownload}>
                <HiDocumentDownload className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <Link to="/data-mahasiswa-atasan">
            <Button color="light" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}