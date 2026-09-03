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

      const response = await axios.get("http://10.6.65.73:8000/api/bebas-pustaka", {
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
        `http://10.6.65.73:8000/api/bebas-pustaka/${id}/review`,
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
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Syarat-Syarat Untuk Bebas Pustaka</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Tidak ada peminjaman buku</span>
              <Select
                className="w-32"
                value={statusPeminjaman}
                onChange={(e) => setStatusPeminjaman(e.target.value)}
              >
                <option>Tidak ada</option>
                <option>Ada</option>
              </Select>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Tidak ada denda</span>
              <Select
                className="w-32"
                value={statusDenda}
                onChange={(e) => setStatusDenda(e.target.value)}
              >
                <option>Ada</option>
                <option>Tidak ada</option>
              </Select>
            </div>
          </div>
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
            onClick={() => kirimKeputusan("setuju")}
          >
            Verifikasi Lulus
          </Button>
        </div>
      </div>
    </div>
  );
}