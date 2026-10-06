import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { HiEye, HiDownload, HiCheck, HiMenu } from "react-icons/hi";
import SidebarAdminComp from "../components/SidebarAdminComp";
import AlertModal from "../components/AlertModal";
import { Button } from "flowbite-react";

const API_BASE_URL = "http://10.6.65.165:8000";

export default function VerifikasiMahasiswa() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(location.state?.dataMahasiswa || null);
  const [loading, setLoading] = useState(true);
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "warning",
    title: "",
    message: "",
  });

  const [navigateAfterClose, setNavigateAfterClose] = useState(false);

  const showAlert = (
    message,
    type = "warning",
    title = "",
    withNavigate = false
  ) => {
    setNavigateAfterClose(withNavigate);
    setModal({
      open: true,
      type,
      title,
      message,
    });
  };

  const closeAlert = () => {
    setModal((m) => ({
      ...m,
      open: false,
    }));

    if (navigateAfterClose) {
      setNavigateAfterClose(false);
      navigate(-1);
    }
  };

  useEffect(() => {
    fetchDetailMahasiswa();
  }, [id]);

  const fetchDetailMahasiswa = () => {
    const token = localStorage.getItem("token");

    axios
      .get(`${API_BASE_URL}/api/pengajuan-clearing/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        const detail = response.data?.data || response.data;

        setData(detail);
        setCatatan(detail.catatan_revisi || "");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil detail:", error);
        setLoading(false);
      });
  };

  const handleUpdateStatus = (keputusan) => {
    const token = localStorage.getItem("token");

    setSubmitting(true);

    axios
      .post(
        `${API_BASE_URL}/api/pengajuan-clearing/${id}/review-admin`,
        {
          keputusan: keputusan,
          catatan_revisi: catatan,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      )
      .then(() => {
        showAlert(
          "Status berhasil diperbarui!",
          "success",
          "Berhasil",
          true
        );
      })
      .catch((err) => {
        console.error(err);

        showAlert(
          err.response?.data?.message || "Gagal memperbarui status.",
          "error",
          "Gagal"
        );
      })
      .finally(() => setSubmitting(false));
  };

  const handleSetujuiClick = () => {
    setConfirmModal(true);
  };

  const doSetuju = () => {
    setConfirmModal(false);
    handleUpdateStatus("setuju");
  };

  const pesanErrorDokumen = async (err, pesanDefault) => {
    if (err.response?.data instanceof Blob) {
      try {
        const json = JSON.parse(await err.response.data.text());
        return json?.message || pesanDefault;
      } catch {
        return pesanDefault;
      }
    }

    return err.response?.data?.message || pesanDefault;
  };

  const previewDokumen = async (jenis) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/api/pengajuan-clearing/${id}/dokumen/${jenis}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const contentType =
        response.headers["content-type"] || "application/octet-stream";

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: contentType,
        })
      );

      window.open(url, "_blank");
    } catch (err) {
      console.error(err);

      const pesan = await pesanErrorDokumen(err, "Gagal memuat dokumen.");
      showAlert(pesan, "error", "Gagal");
    }
  };

  const downloadDokumen = async (jenis, namaFile) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/api/pengajuan-clearing/${id}/dokumen/${jenis}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const contentType =
        response.headers["content-type"] || "application/octet-stream";

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: contentType,
        })
      );

      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", namaFile);

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);

      const pesan = await pesanErrorDokumen(err, "Gagal mengunduh dokumen.");
      showAlert(pesan, "error", "Gagal");
    }
  };

  const ambilSuratBebasPustaka = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${API_BASE_URL}/api/pengajuan-clearing/${id}/surat-bebas-pustaka`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
        responseType: "blob",
      }
    );

    return window.URL.createObjectURL(
      new Blob([response.data], {
        type: "application/pdf",
      })
    );
  };

  const pesanErrorSurat = (err, aksi) => {
    const status = err.response?.status;

    if (status === 422) {
      return "Surat belum tersedia, pengajuan bebas pustaka belum disetujui.";
    }

    if (status === 403) {
      return "Anda tidak berhak mengakses surat ini.";
    }

    if (status === 404) {
      return "Surat bebas pustaka untuk pengajuan ini tidak ditemukan.";
    }

    return `Gagal ${aksi} surat bebas pustaka.`;
  };

  const previewSuratBebasPustaka = async () => {
    try {
      const url = await ambilSuratBebasPustaka();

      window.open(url, "_blank");
    } catch (err) {
      console.error(err);

      showAlert(
        pesanErrorSurat(err, "memuat"),
        "error",
        "Gagal"
      );
    }
  };

  const downloadSuratBebasPustaka = async () => {
    try {
      const url = await ambilSuratBebasPustaka();

      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `surat-bebas-pustaka-${data?.user?.nim || data?.nim || id}.pdf`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);

      showAlert(
        pesanErrorSurat(err, "mengunduh"),
        "error",
        "Gagal"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        <SidebarAdminComp
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:hidden sticky top-0 z-30 bg-[#1e2678] text-white p-4 flex items-center justify-between shadow-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 focus:outline-none"
          >
            <HiMenu className="w-6 h-6" />
          </button>

          <span className="font-bold">Clearing Online</span>

          <div className="w-6" />
        </div>

        <div className="flex-1 lg:ml-64 min-w-0 flex justify-center items-center py-24">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />

          <span className="ml-3 text-gray-600">
            Memuat data...
          </span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        <SidebarAdminComp
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:hidden sticky top-0 z-30 bg-[#1e2678] text-white p-4 flex items-center justify-between shadow-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 focus:outline-none"
          >
            <HiMenu className="w-6 h-6" />
          </button>

          <span className="font-bold">Clearing Online</span>

          <div className="w-6" />
        </div>

        <div className="flex-1 lg:ml-64 min-w-0 p-6 md:p-8 text-center text-gray-500">
          <p>Data pengajuan tidak ditemukan.</p>

          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      <SidebarAdminComp
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-64 min-w-0">
        <div className="lg:hidden sticky top-0 z-30 bg-[#1e2678] text-white p-4 flex items-center justify-between shadow-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 focus:outline-none"
          >
            <HiMenu className="w-6 h-6" />
          </button>

          <span className="font-bold">Clearing Online</span>

          <div className="w-6" />
        </div>

        <main className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Verifikasi Mahasiswa
              </h1>

              <p className="text-xs text-gray-500 mt-1">
                <span
                  className="text-blue-600 cursor-pointer"
                  onClick={() => navigate(-1)}
                >
                  Dashboard
                </span>

                {" • "}

                <span
                  className="text-blue-600 cursor-pointer"
                  onClick={() => navigate(-1)}
                >
                  Pengajuan
                </span>

                {" • "}

                <span>Verifikasi</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-400">
                  Nama
                </p>

                <p className="text-base font-semibold text-indigo-600 mt-0.5">
                  {data.user?.nama || data.nama || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400">
                  NIM
                </p>

                <p className="text-base font-semibold text-gray-800 mt-0.5">
                  {data.user?.nim || data.nim || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400">
                  Departemen
                </p>

                <p className="text-base font-semibold text-gray-800 mt-0.5">
                  {data.departemen || data.user?.departemen || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400">
                  Tanggal Pengajuan
                </p>

                <p className="text-base font-semibold text-indigo-600 mt-0.5">
                  {data.tanggal ||
                    (data.created_at
                      ? new Date(data.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "-")}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-gray-900 text-base">
                Dokumen Persyaratan
              </h3>

              <div className="flex-1 flex flex-col justify-center space-y-6 text-sm mt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-800 font-medium">
                    KTM (Kartu Tanda Mahasiswa)
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="xs"
                      color="light"
                      onClick={() => previewDokumen("ktm")}
                    >
                      Preview
                    </Button>

                    <Button
                      size="xs"
                      color="blue"
                      onClick={() =>
                        downloadDokumen(
                          "ktm",
                          `ktm-${data?.nim || id}`
                        )
                      }
                    >
                      Unduh
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-800 font-medium">
                    Bukti Pembayaran SPP
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="xs"
                      color="light"
                      onClick={() => previewDokumen("spp")}
                    >
                      Preview
                    </Button>

                    <Button
                      size="xs"
                      color="blue"
                      onClick={() =>
                        downloadDokumen(
                          "spp",
                          `spp-${data?.nim || id}`
                        )
                      }
                    >
                      Unduh
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-800 font-medium">
                    Form Distribusi Skripsi
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="xs"
                      color="light"
                      onClick={() => previewDokumen("distribusi")}
                    >
                      Preview
                    </Button>

                    <Button
                      size="xs"
                      color="blue"
                      onClick={() =>
                        downloadDokumen(
                          "distribusi",
                          `distribusi-${data?.nim || id}`
                        )
                      }
                    >
                      Unduh
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-medium">
                    Keterangan Bebas Pustaka
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="xs"
                      color="light"
                      onClick={previewSuratBebasPustaka}
                    >
                      Preview
                    </Button>

                    <Button
                      size="xs"
                      color="blue"
                      onClick={downloadSuratBebasPustaka}
                    >
                      Unduh
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catatan (Optional)
            </label>

            <textarea
              rows="4"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Masukkan catatan..."
              className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-700 outline-none focus:border-indigo-500"
            />

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
              <button
                disabled={submitting}
                onClick={() => handleUpdateStatus("revisi")}
                className="px-8 py-2.5 bg-[#f54242] hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
              >
                Revisi
              </button>

              <button
                disabled={submitting}
                onClick={handleSetujuiClick}
                className="px-8 py-2.5 bg-[#4c51bf] hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
              >
                Setuju & kirim ke Kabag TU
              </button>
            </div>
          </div>
        </main>
      </div>

      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Setujui Pengajuan?
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Apakah Anda yakin ingin menyetujui pengajuan ini?
              Pengajuan akan dikirim ke atasan untuk tanda tangan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Batal
              </button>

              <button
                onClick={doSetuju}
                className="flex-1 px-4 py-2 bg-[#4c51bf] hover:bg-indigo-700 text-white rounded-lg font-medium"
              >
                Ya, Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeAlert}
      />
    </div>
  );
}