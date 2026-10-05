import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  FileInput,
  Label,
  Spinner,
} from "flowbite-react";
import SidebarMahaComp from "../components/SidebarMahaComp";
import AlertModal from "../components/AlertModal";
import { HiMenu } from "react-icons/hi";
import axios from "axios";

const API_URL = "http://172.18.160.91:8000";

export default function PengajuanSaya() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");

  const [fileKtm, setFileKtm] = useState(null);
  const [fileSpp, setFileSpp] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [modal, setModal] = useState({
    open: false,
    type: "warning",
    title: "",
    message: "",
  });

  const [revisiFileKtm, setRevisiFileKtm] = useState(null);
  const [revisiFileSpp, setRevisiFileSpp] = useState(null);
  const [revisiDepartemen, setRevisiDepartemen] = useState("");
  const [ajukanUlangLoading, setAjukanUlangLoading] = useState(false);
  const [ajukanUlangError, setAjukanUlangError] = useState("");

  const [pengajuanList, setPengajuanList] = useState([]);

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    "";

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    setNama(user?.nama || user?.name || "");
    setNim(user?.nim || "");

    getPengajuan();
  }, []);

  const getPengajuan = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/api/pengajuan-clearing`,
        getConfig()
      );

      const data = response.data?.data ?? response.data ?? [];

      const list = Array.isArray(data) ? data : [data];

      setDocuments(list);
      setPengajuanList(list);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data pengajuan clearing."
      );
    } finally {
      setLoading(false);
    }
  };

  const pengajuanRevisi =
    pengajuanList.find(
      (item) =>
        String(item?.status || "").toLowerCase() === "revisi_admin"
    ) || null;

  const validateFile = (file) => {
    if (!file) return true;

    const maxSize = 1 * 1024 * 1024;

    if (file.size > maxSize) {
      setModal({
        open: true,
        type: "warning",
        title: "File Terlalu Besar",
        message: "Maksimal ukuran file adalah 1 MB.",
      });
      return false;
    }

    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!fileKtm || !fileSpp) {
      setModal({
        open: true,
        type: "warning",
        title: "Data Belum Lengkap",
        message: "Silakan upload file KTM dan bukti pembayaran SPP.",
      });
      return;
    }

    if (!validateFile(fileKtm) || !validateFile(fileSpp)) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file_ktm", fileKtm);
      formData.append("file_bukti_spp", fileSpp);

      await axios.post(
        `${API_URL}/api/pengajuan-clearing`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setFileKtm(null);
      setFileSpp(null);

      const inputKtm = document.getElementById("file-ktm");
      if (inputKtm) inputKtm.value = "";

      const inputSpp = document.getElementById("file-spp");
      if (inputSpp) inputSpp.value = "";

      setModal({
        open: true,
        type: "success",
        title: "Berhasil",
        message: "Pengajuan clearing berhasil dikirim.",
      });

      await getPengajuan();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Gagal mengirim pengajuan clearing."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAjukanUlang = async (e) => {
    e.preventDefault();

    if (!pengajuanRevisi) return;

    if (revisiFileKtm && !validateFile(revisiFileKtm)) return;
    if (revisiFileSpp && !validateFile(revisiFileSpp)) return;

    setAjukanUlangLoading(true);
    setAjukanUlangError("");

    try {
      const formData = new FormData();

      if (revisiFileKtm) {
        formData.append("file_ktm", revisiFileKtm);
      }

      if (revisiFileSpp) {
        formData.append("file_bukti_spp", revisiFileSpp);
      }

      await axios.post(
        `${API_URL}/api/pengajuan-clearing/${pengajuanRevisi.id}/ajukan-ulang`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setRevisiFileKtm(null);
      setRevisiFileSpp(null);
      setRevisiDepartemen("");

      setModal({
        open: true,
        type: "success",
        title: "Berhasil",
        message: "Pengajuan berhasil diajukan ulang.",
      });

      await getPengajuan();
    } catch (err) {
      console.error(err);

      setAjukanUlangError(
        err.response?.data?.message ||
          "Gagal mengajukan ulang pengajuan."
      );
    } finally {
      setAjukanUlangLoading(false);
    }
  };

  const handlePreview = async (pengajuanId, jenis) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/pengajuan-clearing/${pengajuanId}/dokumen/${jenis}`,
        {
          ...getConfig(),
          responseType: "blob",
        }
      );

      const blobUrl = window.URL.createObjectURL(response.data);
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error(err);

      setModal({
        open: true,
        type: "warning",
        title: "Gagal",
        message: "Dokumen tidak dapat dibuka.",
      });
    }
  };

  const handleDownload = async (pengajuanId, jenis, fileName) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/pengajuan-clearing/${pengajuanId}/dokumen/${jenis}`,
        {
          ...getConfig(),
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName || "dokumen";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);

      setModal({
        open: true,
        type: "warning",
        title: "Gagal",
        message: "Dokumen tidak dapat diunduh.",
      });
    }
  };

  const renderStatus = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      ["verified", "disetujui", "approved", "diverifikasi_admin"].includes(
        value
      )
    ) {
      return <Badge color="success">Verified</Badge>;
    }

    if (["ditolak", "rejected"].includes(value)) {
      return <Badge color="failure">Ditolak</Badge>;
    }

    return <Badge color="warning">Pending</Badge>;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getFileName = (path) => {
    if (!path) return "-";

    return String(path).split("/").pop();
  };

  const getDocumentRows = () => {
    const rows = [];

    documents.forEach((pengajuan) => {
      if (pengajuan.file_ktm) {
        rows.push({
          id: `${pengajuan.id}-ktm`,
          pengajuanId: pengajuan.id,
          jenis: "ktm",
          nama: getFileName(pengajuan.file_ktm),
          tanggal: pengajuan.created_at,
          status: pengajuan.status,
        });
      }

      if (pengajuan.file_bukti_spp) {
        rows.push({
          id: `${pengajuan.id}-spp`,
          pengajuanId: pengajuan.id,
          jenis: "spp",
          nama: getFileName(pengajuan.file_bukti_spp),
          tanggal: pengajuan.created_at,
          status: pengajuan.status,
        });
      }
    });

    return rows;
  };

  const documentRows = getDocumentRows();

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarMahaComp
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="lg:ml-64">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b bg-white px-4 py-3 shadow-sm lg:hidden">
          <Button
            color="light"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <HiMenu className="h-5 w-5" />
          </Button>

          <h1 className="font-semibold text-gray-800">
            Pengajuan Saya
          </h1>
        </div>

        <main className="p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Sistem Informasi Clearing Online
              </h1>

              <p className="mt-1 text-gray-500">
                Pengajuan Saya
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {pengajuanRevisi ? (
              <Card className="mb-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Revisi Pengajuan
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Silakan perbaiki dokumen yang diminta oleh admin.
                  </p>
                </div>

                {pengajuanRevisi.catatan_revisi && (
                  <div className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-sm font-semibold text-yellow-800">
                      Catatan Admin
                    </p>

                    <p className="mt-1 text-sm text-yellow-700">
                      {pengajuanRevisi.catatan_revisi}
                    </p>
                  </div>
                )}

                {ajukanUlangError && (
                  <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {ajukanUlangError}
                  </div>
                )}

                <form onSubmit={handleAjukanUlang}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <Label htmlFor="revisi-nama">Nama</Label>

                      <input
                        id="revisi-nama"
                        type="text"
                        value={nama}
                        readOnly
                        className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="revisi-nim">NIM</Label>

                      <input
                        id="revisi-nim"
                        type="text"
                        value={nim}
                        readOnly
                        className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="revisi-file-ktm">
                        1. Kartu Tanda Mahasiswa (KTM)
                      </Label>

                      {pengajuanRevisi.file_ktm && (
                        <p className="mb-2 mt-2 text-sm text-gray-600">
                          File saat ini:{" "}
                          <button
                            type="button"
                            onClick={() =>
                              handlePreview(
                                pengajuanRevisi.id,
                                "ktm"
                              )
                            }
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {getFileName(
                              pengajuanRevisi.file_ktm
                            )}
                          </button>
                        </p>
                      )}

                      <FileInput
                        id="revisi-file-ktm"
                        className="mt-2"
                        onChange={(e) =>
                          setRevisiFileKtm(
                            e.target.files?.[0] || null
                          )
                        }
                      />

                      <p className="mt-1 text-xs text-gray-500">
                        Kosongkan jika tidak ingin mengganti file.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="revisi-file-spp">
                        2. Bukti Pembayaran SPP
                      </Label>

                      {pengajuanRevisi.file_bukti_spp && (
                        <p className="mb-2 mt-2 text-sm text-gray-600">
                          File saat ini:{" "}
                          <button
                            type="button"
                            onClick={() =>
                              handlePreview(
                                pengajuanRevisi.id,
                                "spp"
                              )
                            }
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            {getFileName(
                              pengajuanRevisi.file_bukti_spp
                            )}
                          </button>
                        </p>
                      )}

                      <FileInput
                        id="revisi-file-spp"
                        className="mt-2"
                        onChange={(e) =>
                          setRevisiFileSpp(
                            e.target.files?.[0] || null
                          )
                        }
                      />

                      <p className="mt-1 text-xs text-gray-500">
                        Kosongkan jika tidak ingin mengganti file.
                      </p>
                    </div>
                  </div>

                  {pengajuanRevisi.file_distribusi && (
                    <p className="mb-2 mt-5 text-sm text-gray-600">
                      File distribusi saat ini:{" "}
                      <button
                        type="button"
                        onClick={() =>
                          handlePreview(
                            pengajuanRevisi.id,
                            "distribusi"
                          )
                        }
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        {getFileName(
                          pengajuanRevisi.file_distribusi
                        )}
                      </button>
                    </p>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button
                      type="submit"
                      color="blue"
                      disabled={ajukanUlangLoading}
                    >
                      {ajukanUlangLoading ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Mengirim...
                        </>
                      ) : (
                        "Kirim Ulang Pengajuan"
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="mb-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Pengajuan Clearing
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Upload dokumen untuk mengajukan clearing.
                  </p>
                </div>

                <form onSubmit={handleUpload}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <Label htmlFor="nama-mahasiswa">Nama</Label>

                      <input
                        id="nama-mahasiswa"
                        type="text"
                        value={nama}
                        readOnly
                        className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="nim-mahasiswa">NIM</Label>

                      <input
                        id="nim-mahasiswa"
                        type="text"
                        value={nim}
                        readOnly
                        className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="file-ktm">
                        1. Kartu Tanda Mahasiswa (KTM)
                      </Label>

                      <FileInput
                        id="file-ktm"
                        className="mt-2"
                        onChange={(e) =>
                          setFileKtm(e.target.files?.[0] || null)
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="file-spp">
                        2. Bukti Pembayaran SPP
                      </Label>

                      <FileInput
                        id="file-spp"
                        className="mt-2"
                        onChange={(e) =>
                          setFileSpp(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      type="submit"
                      color="blue"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Mengirim...
                        </>
                      ) : (
                        "Kirim Pengajuan"
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <Card>
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-800">
                  Dokumen Saya
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Daftar dokumen yang sudah Anda upload.
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <Spinner size="xl" />
                </div>
              ) : documentRows.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                  Belum ada dokumen pengajuan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                      <tr>
                        <th className="px-6 py-3">Dokumen</th>
                        <th className="px-6 py-3">Tanggal</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {documentRows.map((doc) => (
                        <tr
                          key={doc.id}
                          className="border-b bg-white"
                        >
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                            {doc.nama}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            {formatDate(doc.tanggal)}
                          </td>

                          <td className="px-6 py-4">
                            {renderStatus(doc.status)}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button
                                size="xs"
                                color="light"
                                onClick={() =>
                                  handlePreview(
                                    doc.pengajuanId,
                                    doc.jenis
                                  )
                                }
                              >
                                Preview
                              </Button>

                              <Button
                                size="xs"
                                color="blue"
                                onClick={() =>
                                  handleDownload(
                                    doc.pengajuanId,
                                    doc.jenis,
                                    doc.nama
                                  )
                                }
                              >
                                Unduh
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                Pastikan semua dokumen yang diupload dapat dibaca dengan
                jelas. Jika pengajuan membutuhkan revisi, perbaiki dokumen
                sesuai catatan admin lalu kirim ulang.
              </p>
            </div>
          </div>
        </main>
      </div>

      <AlertModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() =>
          setModal((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </div>
  );
}