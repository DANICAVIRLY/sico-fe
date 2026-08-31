import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { HiEye, HiDownload, HiCheck } from "react-icons/hi";
import SidebarAdminComp from "../components/SidebarAdminComp";

export default function VerifikasiMahasiswa() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil data yang dikirim dari halaman tabel jika ada
  const [data, setData] = useState(location.state?.dataMahasiswa || null);
  const [loading, setLoading] = useState(!location.state?.dataMahasiswa);
  const [catatan, setCatatan] = useState(location.state?.dataMahasiswa?.catatan || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Jika data tidak ada di state (misal user refresh browser), coba fetch ke API
    if (!data) {
      fetchDetailMahasiswa();
    }
  }, [id]);

  const fetchDetailMahasiswa = () => {
    const token = localStorage.getItem("token");

    axios
      .get(`http://10.6.65.110:8000/api/pengajuan-clearing/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        const detail = response.data?.data || response.data;
        setData(detail);
        if (detail.catatan) setCatatan(detail.catatan);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil detail:", error);
        setLoading(false);
      });
  };

  // FIXED - manggil endpoint review-admin (bukan PUT /{id} yang gak ada),
  // dan kirim "keputusan" (setuju/revisi/tolak), bukan "status"
  const handleUpdateStatus = (keputusan) => {
    const token = localStorage.getItem("token");
    setSubmitting(true);

    axios
      .post(
        `http://10.6.65.110:8000/api/pengajuan-clearing/${id}/review-admin`,
        { keputusan: keputusan, catatan_revisi: catatan },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      )
      .then(() => {
        alert(`Status berhasil diperbarui!`);
        navigate(-1);
      })
      .catch((err) => {
        console.error(err);
        alert(err.response?.data?.message || "Gagal memperbarui status.");
      })
      .finally(() => setSubmitting(false));
  };

  // Preview dokumen (buka tab baru)
  const previewDokumen = async (jenis) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://10.6.65.110:8000/api/pengajuan-clearing/${id}/dokumen/${jenis}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const contentType = response.headers["content-type"] || "application/octet-stream";
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: contentType })
      );
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Gagal memuat dokumen.");
    }
  };

  // Download dokumen
  const downloadDokumen = async (jenis, namaFile) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://10.6.65.110:8000/api/pengajuan-clearing/${id}/dokumen/${jenis}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const contentType = response.headers["content-type"] || "application/octet-stream";
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: contentType })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", namaFile);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh dokumen.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SidebarAdminComp />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Memuat data...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SidebarAdminComp />
        <div className="flex-1 p-8 text-center text-gray-500">
          <p>Data pengajuan tidak ditemukan.</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  console.log("ISI DATA DOKUMEN:", data);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <SidebarAdminComp />

      {/* Konten UI */}
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Mahasiswa</h1>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-blue-600 cursor-pointer" onClick={() => navigate(-1)}>Dashboard</span>
              {" • "}
              <span className="text-blue-600 cursor-pointer" onClick={() => navigate(-1)}>Pengajuan</span>
              {" • "}
              <span>Verifikasi</span>
            </p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Database Keuangan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Biodata */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-400">Nama</p>
              <p className="text-base font-semibold text-indigo-600 mt-0.5">
                {data.user?.nama || data.nama || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400">NIM</p>
              <p className="text-base font-semibold text-gray-800 mt-0.5">
                {data.user?.nim || data.nim || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400">Departemen</p>
              <p className="text-base font-semibold text-gray-800 mt-0.5">
                {data.departemen || data.user?.departemen || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400">Tanggal Pengajuan</p>
              <p className="text-base font-semibold text-indigo-600 mt-0.5">
                {data.tanggal || (data.created_at ? new Date(data.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-")}
              </p>
            </div>
          </div>

          {/* Card Dokumen Persyaratan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <h3 className="font-bold text-gray-900 text-base mb-6">Dokumen Persyaratan</h3>
            <div className="space-y-6 text-sm">

              {/* SPP */}
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">Spp</span>
                <div className="flex items-center gap-4 text-indigo-950">
                  <button 
                    type="button" 
                    onClick={() => previewDokumen("spp")} 
                    className="hover:text-indigo-600 transition"
                    title="Lihat Dokumen"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="1" fill="currentColor" />
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => downloadDokumen("spp", `spp-${data?.nim || id}`)} 
                    className="hover:text-indigo-600 transition"
                    title="Unduh Dokumen"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 17V3" />
                      <path d="m6 11 6 6 6-6" />
                      <path d="M19 21H5" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Distribusi Skripsi */}
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">Distribusi Skripsi</span>
                <div className="flex items-center gap-4 text-indigo-950">
                  <button 
                    type="button" 
                    onClick={() => previewDokumen("distribusi")} 
                    className="hover:text-indigo-600 transition"
                    title="Lihat Dokumen"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="1" fill="currentColor" />
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => downloadDokumen("distribusi", `distribusi-${data?.nim || id}`)} 
                    className="hover:text-indigo-600 transition"
                    title="Unduh Dokumen"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 17V3" />
                      <path d="m6 11 6 6 6-6" />
                      <path d="M19 21H5" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* KTM */}
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">KTM (Kartu Tanda Mahasiswa)</span>
                <div className="flex items-center gap-4 text-indigo-950">
                  <button 
                    type="button" 
                    onClick={() => previewDokumen("ktm")} 
                    className="hover:text-indigo-600 transition"
                    title="Lihat Dokumen"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="1" fill="currentColor" />
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => downloadDokumen("ktm", `ktm-${data?.nim || id}`)} 
                    className="hover:text-indigo-600 transition"
                    title="Unduh Dokumen"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 17V3" />
                      <path d="m6 11 6 6 6-6" />
                      <path d="M19 21H5" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Keterangan Bebas Pustaka */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-800 font-medium">Keterangan Bebas Pustaka</span>
                <span className="text-[#00a86b] font-semibold text-sm">
                  Lengkap
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Catatan & Action */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan (Optional)</label>
          <textarea
            rows="4"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Masukkan catatan..."
            className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-700 outline-none focus:border-indigo-500"
          ></textarea>

          <div className="flex justify-end gap-4 mt-6">
            <button
              disabled={submitting}
              onClick={() => handleUpdateStatus("revisi")}
              className="px-8 py-2.5 bg-[#f54242] hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
            >
              Revisi
            </button>
            <button
              disabled={submitting}
              onClick={() => handleUpdateStatus("setuju")}
              className="px-8 py-2.5 bg-[#4c51bf] hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
            >
              Setuju & kirim ke atasan
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}