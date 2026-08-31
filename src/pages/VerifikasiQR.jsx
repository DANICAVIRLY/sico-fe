import { Card, Button } from "flowbite-react";
import { Link, useParams } from "react-router-dom";
import { HiCheckCircle, HiArrowLeft, HiDocumentDownload } from "react-icons/hi";
import { useState, useEffect } from "react";
import axios from "axios";

export default function VerifikasiQR() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
    const token = localStorage.getItem("token");

    axios
      .get(`http://10.6.65.141:8000/api/pengajuan-clearing/${id}/surat`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        const item = response.data?.data || response.data;
        setData({
          id: item.id,
          nama: item.nama || "-",
          nim: item.nim || "-",
          departemen: item.departemen || "-",
          tanggal: item.tanggal_surat || item.created_at
            ? new Date(item.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : "-",
          nomor_surat: item.nomor_surat || `CLR/${String(id).padStart(4, "0")}/SICO/2026`,
          qr_token: item.qr_token || "",
          status: "Terverifikasi",
          penandatangan: item.penandatangan || "Atasan SICO",
          jabatan: item.jabatan || "Atasan",
          tanggal_terbit: item.tanggal_terbit || new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
          jenis_clearing: item.jenis_clearing || "Clearing Perpustakaan",
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Gagal mengambil data surat.");
        setLoading(false);
      });
  };

  const handleDownload = () => {
    const token = localStorage.getItem("token");
    window.open(
      `http://10.6.65.141:8000/api/pengajuan-clearing/${id}/surat/download?token=${token}`,
      "_blank"
    );
  };

  const handlePreview = () => {
    const token = localStorage.getItem("token");
    window.open(
      `http://10.6.65.141:8000/api/pengajuan-clearing/${id}/surat?token=${token}`,
      "_blank"
    );
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
        {/* Ikon Centang */}
        <div className="bg-green-500 rounded-full p-4 mb-4 text-white shadow-lg">
          <HiCheckCircle className="w-16 h-16" />
        </div>

        {/* Judul */}
        <h1 className="text-3xl font-bold text-green-700 text-center mb-1">
          Dokumen Terverifikasi
        </h1>
        <p className="text-sm text-green-600 text-center mb-8">
          Surat clearing telah diterbitkan dan terdaftar pada sistem
        </p>

        {/* Kartu Informasi */}
        <Card className="w-full shadow-lg rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Kolom Kiri */}
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

            {/* Kolom Kanan */}
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

          {/* Footer */}
          <div className="bg-[#e6f6e9] p-4 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-xl border-t border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <HiCheckCircle className="w-5 h-5" />
              <span>Status:</span>
              <span className="font-bold">Dokumen Sah</span>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
                onClick={handlePreview}
              >
                Preview Surat
              </Button>
              <Button
                className="bg-[#2e1a7a] hover:bg-[#1e1260] w-full md:w-auto"
                onClick={handleDownload}
              >
                <HiDocumentDownload className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </Card>

        {/* Tombol Kembali */}
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