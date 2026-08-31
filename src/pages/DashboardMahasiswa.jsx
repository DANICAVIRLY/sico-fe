import { useEffect, useState } from 'react';
import { Card, Button, Badge } from 'flowbite-react';
import SidebarMahaComp from '../components/SidebarMahaComp';
import { HiCheckCircle, HiClock, HiQrcode } from 'react-icons/hi';
import axios from 'axios';

export default function DashboardMahasiswa() {
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(true);
  const [pengajuan, setPengajuan] = useState(null);
  const [surat, setSurat] = useState(null);
  const [tahapan, setTahapan] = useState(0);
  const totalTahapan = 4;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "null");
    setNama(userData?.nama || "Mahasiswa");
    fetchData();
  }, []);

  const fetchData = () => {
    const token = localStorage.getItem("token");

    axios
      .get("http://10.6.65.141:8000/api/pengajuan-clearing", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        const items = response.data?.data || response.data || [];
        const item = items[0] || null;

        if (item) {
          setPengajuan(item);

          // Hitung tahapan berdasarkan status
          let step = 0;
          if (item.status === 'menunggu_ttd') step = 2;
          else if (item.status === 'diverifikasi' || item.status === 'selesai') step = 4;
          else if (item.status === 'ditolak') step = 0;
          setTahapan(step);

          // Jika sudah diverifikasi, ambil surat
          if (item.status === 'diverifikasi' || item.status === 'selesai') {
            fetchSurat(item.id);
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  const fetchSurat = (id) => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://10.6.65.141:8000/api/pengajuan-clearing/${id}/surat`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        setSurat(response.data?.data || response.data);
      })
      .catch((error) => {
        console.error("Error fetching surat:", error);
      });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      menunggu_ttd: { color: "warning", label: "Menunggu TTD" },
      diverifikasi: { color: "success", label: "Selesai" },
      selesai: { color: "success", label: "Selesai" },
      ditolak: { color: "failure", label: "Ditolak" },
    };
    const info = statusMap[status] || { color: "gray", label: status || "Diproses" };
    return <Badge color={info.color}>{info.label}</Badge>;
  };

  const handlePreviewSurat = () => {
    const token = localStorage.getItem("token");
    if (pengajuan?.id) {
      window.open(
        `http://10.6.65.141:8000/api/pengajuan-clearing/${pengajuan.id}/surat?token=${token}`,
        "_blank"
      );
    }
  };

  const handleDownloadSurat = () => {
    const token = localStorage.getItem("token");
    if (pengajuan?.id) {
      window.open(
        `http://10.6.65.141:8000/api/pengajuan-clearing/${pengajuan.id}/surat/download?token=${token}`,
        "_blank"
      );
    }
  };

  // QR Code URL untuk verifikasi
  const qrUrl = pengajuan?.id 
    ? `http://10.6.65.141:8000/api/surat/verify/${surat?.qr_token || pengajuan.id}`
    : "#";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SidebarMahaComp />
        <div className="lg:ml-64 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-500">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarMahaComp />

      <main className="lg:ml-64 p-6 md:p-8">
        <div className="w-full">

          {/* HEADER */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Halo!, {nama}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Berikut Ringkasan Clearing Anda
            </p>
          </div>

          {/* TIMELINE PROGRESS */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">Tahapan Proses Clearing</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Pengajuan</span>
                    <span>Verifikasi Admin</span>
                    <span>Verifikasi Atasan</span>
                    <span>Selesai</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(tahapan / totalTahapan) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-indigo-600 whitespace-nowrap">
                  {tahapan}/{totalTahapan}
                </span>
              </div>
            </div>
          </div>

          {/* STATUS PENGAJUAN */}
          {pengajuan && (
            <div className="mb-6">
              <Card className="border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-bold text-gray-800">Pengajuan Clearing</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Status: {getStatusBadge(pengajuan.status)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Diajukan: {pengajuan.created_at
                        ? new Date(pengajuan.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>
                  {pengajuan.status === "diverifikasi" || pengajuan.status === "selesai" ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                      <HiCheckCircle className="w-5 h-5" />
                      <span className="font-medium text-sm">Selesai</span>
                    </div>
                  ) : pengajuan.status === "ditolak" ? (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                      <span className="font-medium text-sm">Ditolak</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">
                      <HiClock className="w-5 h-5" />
                      <span className="font-medium text-sm">Diproses</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* DOKUMEN SELESAI + QR CODE */}
          {surat ? (
            <div>
              <h3 className="text-xl font-bold mb-4">Dokumen Selesai</h3>
              <Card className="rounded-lg shadow-sm border border-green-200 bg-green-50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  
                  {/* KIRI - Info Dokumen */}
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">
                      Clearing Perpustakaan
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Selesai pada {surat.tanggal_terbit || new Date().toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Nomor Surat: {surat.nomor_surat || "-"}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="xs" outline onClick={handlePreviewSurat}>
                        Lihat PDF
                      </Button>
                      <Button size="xs" outline onClick={handleDownloadSurat}>
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* KANAN - QR CODE */}
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 flex items-center justify-center bg-white rounded-lg border border-gray-200 p-1">
                      {surat.qr_token ? (
                        <img
                          src={`http://10.6.65.141:8000/api/surat/qr/${surat.qr_token}`}
                          alt="QR Code"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                            e.target.alt = "QR Code";
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center text-xs text-gray-400 font-mono bg-gray-50 rounded">
                                QR
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-mono bg-gray-50 rounded">
                          QR
                        </div>
                      )}
                    </div>
                    <div className="w-28">
                      <p className="text-xs font-bold text-gray-900 leading-tight">
                        Scan untuk verifikasi dokumen ini
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 break-all">
                        {surat.qr_token || "QR Token"}
                      </p>
                    </div>
                  </div>

                </div>
              </Card>
            </div>
          ) : pengajuan && pengajuan.status !== "ditolak" ? (
            <div>
              <h3 className="text-xl font-bold mb-4">Dokumen Selesai</h3>
              <Card className="rounded-lg shadow-sm border border-yellow-200 bg-yellow-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    <HiClock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-yellow-700">Menunggu Verifikasi</h3>
                    <p className="text-sm text-gray-600">
                      Dokumen Anda sedang dalam proses verifikasi oleh Admin dan Atasan.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

        </div>
      </main>
    </div>
  );
}