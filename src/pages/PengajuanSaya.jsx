import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  FileInput,
  Label,
  Select,
} from "flowbite-react";
import SidebarMahaComp from "../components/SidebarMahaComp";

export default function PengajuanSaya() {
  const nama = localStorage.getItem("nama") || "Mahasiswa";
  const nim = localStorage.getItem("nim") || "-";

  const [jenisDokumen, setJenisDokumen] = useState("");
  const [file, setFile] = useState(null);

  const [documents, setDocuments] = useState([
    {
      id: 1,
      nama: "Kartu Tanda Mahasiswa (KTM)",
      status: "Verified",
      upload: "07 Agustus 2026",
      validasi: "08 Agustus 2026",
      catatan: "-",
      file: "ktm.pdf",
    },
    {
      id: 2,
      nama: "Bukti Pembayaran SPP",
      status: "Pending",
      upload: "08 Agustus 2026",
      validasi: "-",
      catatan: "Menunggu validasi admin",
      file: "spp.pdf",
    },
    {
      id: 3,
      nama: "Surat Bebas Tanggungan Keuangan",
      status: "Verified",
      upload: "08 Agustus 2026",
      validasi: "08 Agustus 2026",
      catatan: "-",
      file: "keuangan.pdf",
    },
    {
      id: 4,
      nama: "Distribusi Skripsi",
      status: "Rejected",
      upload: "08 Agustus 2026",
      validasi: "08 Agustus 2026",
      catatan: "Dokumen tidak jelas",
      file: "skripsi.pdf",
    },
  ]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!jenisDokumen) {
      alert("Silakan pilih jenis dokumen.");
      return;
    }
    if (!file) {
      alert("Silakan pilih file terlebih dahulu.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5 MB.");
      return;
    }

    const dataBaru = {
      id: Date.now(),
      nama: jenisDokumen,
      status: "Pending",
      upload: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      validasi: "-",
      catatan: "Menunggu validasi admin",
      file: file.name,
    };

    setDocuments((prev) => [...prev, dataBaru]);
    setJenisDokumen("");
    setFile(null);
    alert("Dokumen berhasil diupload.");
  };

  const renderStatus = (status) => {
    if (status === "Verified") {
      return (
        <Badge color="success" className="rounded-full px-3 py-1 text-xs font-medium">
          Verified
        </Badge>
      );
    }
    if (status === "Rejected") {
      return (
        <Badge color="failure" className="rounded-full px-3 py-1 text-xs font-medium">
          Rejected
        </Badge>
      );
    }
    return (
      <Badge color="warning" className="rounded-full px-3 py-1 text-xs font-medium">
        Pending
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SidebarMahaComp />
      <main className="lg:ml-64 p-6 md:p-8">
        
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-medium text-indigo-600">Sistem Informasi Clearing Online</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Pengajuan Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan unggah dokumen persyaratan clearing Anda.</p>
        </div>

        {/* Form Upload */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Unggah Dokumen Baru</h2>
            <p className="text-sm text-gray-500">Pilih jenis dokumen dan unggah file persyaratan Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="nama" value="Nama Mahasiswa" className="text-sm font-medium" />
              <input
                id="nama"
                type="text"
                value={nama}
                disabled
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="nim" value="NIM" className="text-sm font-medium" />
              <input
                id="nim"
                type="text"
                value={nim}
                disabled
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-600"
              />
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="jenisDokumen" value="Jenis Dokumen" className="text-sm font-medium" />
            <Select
              id="jenisDokumen"
              value={jenisDokumen}
              onChange={(e) => setJenisDokumen(e.target.value)}
              className="mt-1"
            >
              <option value="">Pilih jenis dokumen</option>
              <option value="Kartu Tanda Mahasiswa (KTM)">Kartu Tanda Mahasiswa (KTM)</option>
              <option value="Bukti Pembayaran SPP">Bukti Pembayaran SPP</option>
              <option value="Surat Bebas Tanggungan Keuangan">Surat Bebas Tanggungan Keuangan</option>
              <option value="Distribusi Skripsi">Distribusi Skripsi</option>
            </Select>
          </div>

          <div className="mb-4">
            <Label htmlFor="file" value="File Dokumen" className="text-sm font-medium" />
            <FileInput
              id="file"
              className="mt-1"
              color="blue"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <p className="mt-1 text-xs text-gray-400">Format: PDF, JPG, JPEG, PNG. Maksimal 5 MB.</p>
            {file && (
              <div className="mt-2 rounded-lg bg-gray-50 p-3 border border-gray-200">
                <p className="text-sm font-medium text-gray-700">File dipilih:</p>
                <p className="text-sm text-gray-500">{file.name}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button color="blue" onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700">
              Upload Dokumen
            </Button>
          </div>
        </Card>

        {/* Tabel Dokumen */}
        <Card className="border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Dokumen Terunggah</h2>
              <p className="text-sm text-gray-500">Daftar dokumen yang telah Anda unggah.</p>
            </div>
            <div className="mt-2 sm:mt-0 rounded-lg bg-indigo-50 px-4 py-2">
              <span className="text-sm font-semibold text-indigo-600">{documents.length} Dokumen</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Dokumen</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Tanggal Upload</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Validasi</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Catatan</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-medium text-gray-700">Belum ada dokumen</p>
                        <p className="text-sm text-gray-400">Silakan unggah dokumen terlebih dahulu.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{doc.nama}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[180px]">{doc.file || "Tidak ada file"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{renderStatus(doc.status)}</td>
                      <td className="px-4 py-3 text-gray-600">{doc.upload}</td>
                      <td className="px-4 py-3 text-gray-600">{doc.validasi}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{doc.catatan || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="xs"
                            color="light"
                            className="border border-gray-300 text-gray-600 hover:bg-gray-50"
                            onClick={() => alert(`Preview dokumen: ${doc.file}`)}
                          >
                            Preview
                          </Button>
                          <Button
                            size="xs"
                            color="blue"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => alert(`Download dokumen: ${doc.file}`)}
                          >
                            Unduh
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Info */}
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <span className="text-sm font-bold text-blue-600">i</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800">Informasi Pengajuan</h3>
              <p className="text-sm text-blue-700">
                Pastikan seluruh dokumen yang diunggah merupakan dokumen yang benar dan dapat terbaca dengan jelas. 
                Dokumen dengan status <strong>Rejected</strong> dapat diperbarui dengan mengunggah ulang.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}