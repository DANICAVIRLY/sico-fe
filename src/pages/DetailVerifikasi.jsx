import { Button, Card, Textarea, Select, Badge } from "flowbite-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { HiArrowLeft, HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
import { useState, useEffect } from "react";
import axios from "axios";

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

  // Modal konfirmasi custom (pengganti langsung eksekusi tanpa konfirmasi),
  // dipakai sebelum submit keputusan "setuju".
  const [confirmModal, setConfirmModal] = useState(false);

  const extractArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return null;

    const commonKeys = ["data", "items", "result", "results", "bebas_pustaka", "pengajuan", "list"];

    for (const key of commonKeys) {
      if (Array.isArray(payload[key])) return payload[key];
    }

    for (const key of commonKeys) {
      if (payload[key] && typeof payload[key] === "object") {
        const nested = extractArray(payload[key]);
        if (Array.isArray(nested)) return nested;
      }
    }

    for (const value of Object.values(payload)) {
      if (Array.isArray(value)) return value;
    }

    return null;
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const token = localStorage.getItem("token");

      const response = await axios.get("http://172.18.160.93:8000/api/bebas-pustaka", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const list = extractArray(response.data?.data);

      if (!Array.isArray(list)) {
        console.error("Data list bukan array:", response.data);
        setErrorMsg("Data pengajuan tidak ditemukan.");
        setDetail(null);
        return;
      }

      const item = list.find((row) => String(row.id) === String(id));

      if (!item) {
        console.error("Item dengan id", id, "tidak ditemukan di list:", list);
        setErrorMsg("Data pengajuan tidak ditemukan.");
        setDetail(null);
        return;
      }

      const mapped = {
        id: item.id,
        nama: item.nama || item.user?.nama || item.mahasiswa?.nama || "-",
        nim: item.nim || item.user?.nim || item.mahasiswa?.nim || "-",
        departemen: item.departemen || item.user?.departemen || item.mahasiswa?.departemen || "-",
        // Enum backend: 'menunggu' | 'disetujui' | 'revisi'
        status: item.status || "menunggu",
        tanggal: item.created_at
          ? new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-",
        peminjamanBuku: item.status_peminjaman || item.peminjaman_buku || "Tidak ada",
        denda: item.status_denda || item.denda || "Tidak ada",
        catatanAwal: item.catatan_revisi || "",
        diverifikasiOleh: item.reviewer?.nama || item.reviewed_by?.nama || item.diverifikasi_oleh || "-",
      };

      setDetail(mapped);
      setStatusPeminjaman(mapped.peminjamanBuku);
      setStatusDenda(mapped.denda);
      setCatatan(mapped.catatanAwal);
    } catch (error) {
      console.error("Error fetching detail:", error);
      if (error.response) {
        console.error("STATUS:", error.response.status);
        console.error("RESPONSE:", error.response.data);
      }
      setErrorMsg("Gagal mengambil data dari server.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  // Kirim keputusan verifikasi ke backend. keputusan: "setuju" | "revisi"
  const kirimKeputusan = async (keputusan) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `http://172.18.160.93:8000/api/bebas-pustaka/${id}/review`,
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
        const userData = JSON.parse(localStorage.getItem("user") || "null");

        navigate("/verifikasi-berhasil", {
          state: {
            nama: detail.nama,
            nim: detail.nim,
            tanggal: detail.tanggal,
            departemen: detail.departemen,
            diverifikasiOleh: userData?.nama || "-",
            catatanPustakawan: catatan,
          },
        });
      } else {
        navigate("/data-pengajuan");
      }
    } catch (error) {
      console.error("Error submit keputusan:", error);
      if (error.response) {
        console.error("STATUS:", error.response.status);
        console.error("RESPONSE:", error.response.data);
      }
      setErrorMsg("Gagal mengirim keputusan verifikasi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Tombol "Verifikasi Lulus" tidak langsung submit — buka modal konfirmasi
  // dulu, baru submit beneran setelah user klik "Ya, Setujui" di modal.
  const handleVerifikasiLulusClick = () => {
    setConfirmModal(true);
  };

  const doVerifikasiLulus = () => {
    setConfirmModal(false);
    kirimKeputusan("setuju");
  };

  // Status final: sudah diproses, tidak perlu form aktif lagi
  const statusFinal = ["disetujui", "revisi"];
  const sudahDiproses = detail && statusFinal.includes(String(detail.status).toLowerCase());

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center h-64">
        <p className="text-gray-500">Loading data...</p>
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-red-500 mb-4">{errorMsg || "Data tidak ditemukan."}</p>
        <Link to="/data-pengajuan">
          <Button color="gray">
            <HiArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>
    );
  }

  if (sudahDiproses) {
    const statusLower = String(detail.status).toLowerCase();

    const tampilan = statusLower === "revisi"
      ? {
          icon: HiExclamationCircle,
          warna: "bg-yellow-500",
          judul: "Pengajuan Perlu Revisi",
          sub: "Mahasiswa perlu memperbaiki pengajuan",
        }
      : {
          icon: HiCheckCircle,
          warna: "bg-green-500",
          judul: "Verifikasi Perpustakaan Berhasil",
          sub: "Mahasiswa dinyatakan bebas pustaka",
        };

    const Icon = tampilan.icon;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Hasil Verifikasi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Data mahasiswa - detail - surat bebas clearing
          </p>
        </div>

        <Card className="w-full shadow-md">
          <div className="flex flex-col items-center p-6">
            <div className={`${tampilan.warna} rounded-full p-4 mb-4 text-white`}>
              <Icon className="w-12 h-12" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center">{tampilan.judul}</h2>
            <p className="text-gray-600 text-center mb-6">{tampilan.sub}</p>

            <div className="w-full border border-gray-200 rounded-lg overflow-hidden mb-6">
              <div className="grid grid-cols-2 border-b border-gray-200">
                <div className="p-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">Nama</div>
                <div className="p-4 text-gray-800">{detail.nama}</div>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200">
                <div className="p-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">NIM</div>
                <div className="p-4 text-gray-800">{detail.nim}</div>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200">
                <div className="p-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">Tanggal</div>
                <div className="p-4 text-gray-800">{detail.tanggal}</div>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200">
                <div className="p-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">Diverifikasi Oleh</div>
                <div className="p-4 text-gray-800">{detail.diverifikasiOleh}</div>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200">
                <div className="p-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">Departemen</div>
                <div className="p-4 text-gray-800">{detail.departemen}</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">Catatan</div>
                <div className="p-4 text-gray-800">{detail.catatanAwal || "-"}</div>
              </div>
            </div>

            <Link to="/data-pengajuan">
              <Button color="light" className="border border-gray-300 text-blue-600 font-medium hover:bg-gray-50">
                <HiArrowLeft className="mr-2 h-5 w-5" />
                Kembali Ke Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Hasil Verifikasi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Data mahasiswa - detail - surat bebas clearing
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{detail.nama}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge color="success" className="text-xs">
                  {detail.status}
                </Badge>
                <Badge color="indigo" className="text-xs">
                  verifikasi perpustakaan
                </Badge>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>pengajuan clearing</p>
              <p className="text-xs">{detail.tanggal}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Syarat Bebas Pustaka</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Tidak memiliki buku yang masih dipinjam.</li>
            <li>Tidak memiliki tanggungan denda perpustakaan.</li>
            <li>
              Jika persyaratan belum terpenuhi, silakan lengkapi sesuai
              catatan syarat yang belum terpenuhi.
            </li>
          </ol>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-800 mb-2">Catatan Pustakawan</h3>
          <Textarea
            id="catatan"
            placeholder="Tulis catatan jika ada..."
            rows={3}
            className="w-full"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </Card>

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

        <div className="flex justify-end gap-4 mt-2">
          <Link to="/data-pengajuan">
            <Button color="gray" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <Button
            color="warning"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            disabled={submitting}
            onClick={() => kirimKeputusan("revisi")}
          >
            Revisi
          </Button>
          <Button
            className="bg-blue-800 hover:bg-blue-900"
            disabled={submitting}
            onClick={handleVerifikasiLulusClick}
          >
            Verifikasi Lulus
          </Button>
        </div>
      </div>

      {/* =====================================================
          MODAL KONFIRMASI CUSTOM
          Muncul sebelum keputusan "setuju" beneran dikirim ke backend
          & sebelum pindah ke halaman /verifikasi-berhasil.
          Style-nya disamakan dengan modal konfirmasi di halaman lain
          (Tanda Tangan Atasan, Verifikasi Mahasiswa).
      ===================================================== */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verifikasi Lulus?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin meluluskan verifikasi bebas pustaka
              mahasiswa ini?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Batal
              </button>
              <button
                onClick={doVerifikasiLulus}
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