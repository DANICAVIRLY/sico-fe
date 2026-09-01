import { useEffect, useState } from 'react';
import { Card, Button, Badge } from 'flowbite-react';
import SidebarMahaComp from '../components/SidebarMahaComp';
import { HiCheckCircle, HiCheck, HiClock, HiQrcode, HiDeviceMobile } from 'react-icons/hi';
import axios from 'axios';

const STEPPER_ITEMS = [
  { label: 'Surat Bebas Pustaka' },
  { label: 'Pengajuan Clearing' },
  { label: 'Verifikasi Admin' },
  { label: 'Verifikasi Atasan' },
];

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
      .get("http://10.6.64.238:8000/api/pengajuan-clearing", {
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
      .get(`http://10.6.64.238:8000/api/pengajuan-clearing/${id}/surat`, {
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
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Halo!, {nama}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Berikut Ringkasan Clearing Anda
            </p>
          </div>
          <div className="mb-6">
            <Card className="border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-indigo-700">Tahapan Proses Clearing</h3>
                <span className="text-sm font-semibold text-indigo-600 whitespace-nowrap">
                  {tahapan}/{totalTahapan}
                </span>
              </div>

              <div className="flex items-start justify-between mt-4 px-2">
                {STEPPER_ITEMS.map((step, index) => {
                  const stepNumber = index + 1;
                  const isDone = tahapan >= totalTahapan ? true : stepNumber < tahapan;
                  const isActive = tahapan < totalTahapan && stepNumber === tahapan;
                  const isLineFilled = tahapan >= totalTahapan ? true : stepNumber <= tahapan;

                  return (
                    <div
                      key={step.label}
                      className="flex-1 flex flex-col items-center relative"
                    >
                      {index !== 0 && (
                        <div
                          className={`absolute top-4 right-1/2 w-full h-0.5 ${
                            isLineFilled ? "bg-indigo-600" : "bg-gray-200"
                          }`}
                        />
                      )}

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          isDone
                            ? "bg-indigo-600 text-white"
                            : isActive
                            ? "bg-white border-2 border-indigo-600 text-indigo-600"
                            : "bg-gray-100 border border-gray-300 text-gray-400"
                        }`}
                      >
                        {isDone ? (
                          <HiCheck className="w-4 h-4" />
                        ) : (
                          <HiDeviceMobile className="w-4 h-4" />
                        )}
                      </div>

                      <p className="text-xs font-semibold text-gray-800 mt-2 text-center">
                        {step.label}
                      </p>

                      <p
                        className={`text-[11px] mt-0.5 ${
                          isDone || isActive ? "text-indigo-600" : "text-gray-400"
                        }`}
                      >
                        {isDone ? "Selesai" : isActive ? "Sedang diproses" : "Belum"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Dokumen Selesai</h3>
            <Card className="rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">
                    Clearing Perpustakaan
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Selesai pada 15 Mei 2026
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="xs" outline>
                      Lihat PDF
                    </Button>
                    <Button size="xs" outline>
                      Download
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 flex items-center justify-center bg-white rounded-lg border border-gray-200 p-1">
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-mono bg-gray-50 rounded">
                      QR Code
                    </div>
                  </div>
                  <div className="w-28">
                    <p className="text-xs font-bold text-gray-900 leading-tight">
                      Scan untuk verifikasi dokumen ini
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

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