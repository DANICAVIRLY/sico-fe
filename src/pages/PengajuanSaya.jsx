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

    // Cek ukuran file maksimal 5 MB
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
        <Badge
          color="success"
          className="inline-flex rounded-full px-3 py-1"
        >
          Verified
        </Badge>
      );
    }

    if (status === "Rejected") {
      return (
        <Badge
          color="failure"
          className="inline-flex rounded-full px-3 py-1"
        >
          Rejected
        </Badge>
      );
    }

    return (
      <Badge
        color="warning"
        className="inline-flex rounded-full px-3 py-1"
      >
        Pending
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SidebarMahaComp />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-indigo-600"> Sistem Informasi Clearing Online </p>
          <h1 className="text-3xl font-bold text-gray-800"> Pengajuan Saya </h1>
          <p className="mt-2 text-gray-500">
            Kelola dan unggah dokumen persyaratan
            clearing Anda.
          </p>
        </div>
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800"> Unggah Dokumen Baru </h2>
            <p className="mt-1 text-sm text-gray-500">
              Pilih jenis dokumen dan unggah file
              persyaratan Anda.
            </p>
          </div>
          <div className="mb-5 grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="nama" value="Nama Mahasiswa" />
              <input id="nama"  type="text" value={nama}  disabled className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-500"/>
            </div>
            <div>
              <Label htmlFor="nim" value="NIM" />
              <input id="nim" type="text" value={nim} disabled className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-500" />
            </div>
          </div>
          <div className="mb-5">
            <Label htmlFor="jenisDokumen" value="Jenis Dokumen" />
            <Select id="jenisDokumen" value={jenisDokumen} onChange={(event) => setJenisDokumen(event.target.value) } className="mt-2" >
              <option value=""> Pilih jenis dokumen </option>
              <option value="Kartu Tanda Mahasiswa (KTM)"> Kartu Tanda Mahasiswa (KTM) </option>
              <option value="Bukti Pembayaran SPP"> Bukti Pembayaran SPP </option>
              <option value="Surat Bebas Tanggungan Keuangan"> Surat Bebas Tanggungan Keuangan </option>
              <option value="Distribusi Skripsi"> Distribusi Skripsi </option>
            </Select>
          </div>
          <div>
            <Label htmlFor="file" value="File Dokumen" />
            <FileInput id="file" className="mt-2" color="blue" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
            <p className="mt-2 text-xs text-gray-400">
              Format yang diperbolehkan: PDF, JPG,
              JPEG, PNG. Maksimal 5 MB.
            </p>
            {file && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-700"> File dipilih: </p>
                <p className="mt-1 text-sm text-gray-500"> {file.name} </p>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button color="blue" onClick={handleUpload}> Upload Dokumen </Button>
          </div>
        </Card>
        <Card className="border border-gray-200 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800"> Dokumen Terunggah </h2>
              <p className="mt-1 text-sm text-gray-500"> Daftar dokumen yang telah Anda unggah. </p>
            </div>
            <div className="rounded-lg bg-indigo-50 px-4 py-2">
              <span className="text-sm font-semibold text-indigo-600"> {documents.length} Dokumen </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th scope="col" className="whitespace-nowrap px-6 py-4 font-semibold"> Dokumen </th>
                  <th scope="col" className="whitespace-nowrap px-6 py-4 font-semibold" > Status </th>
                  <th scope="col" className="whitespace-nowrap px-6 py-4 font-semibold" > Tanggal Upload  </th>
                  <th scope="col" className="whitespace-nowrap px-6 py-4 font-semibold" > Validasi </th>
                  <th scope="col" className="whitespace-nowrap px-6 py-4 font-semibold" > Catatan </th>
                  <th scope="col" className="whitespace-nowrap px-6 py-4 text-center font-semibold" > Aksi </th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">

                          <span className="text-xl">
                            
                          </span>

                        </div>

                        <p className="font-medium text-gray-700">
                          Belum ada dokumen
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          Silakan unggah dokumen terlebih dahulu.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  documents.map((doc) => (

                    <tr
                      key={doc.id}
                      className="border-b border-gray-200 bg-white transition hover:bg-gray-50"
                    >

                      {/* DOKUMEN */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          {/* ICON */}

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-indigo-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >

                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h5.586A2 2 0 0113 2.586L16.414 6A2 2 0 0117 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm7-1.414V7h4.414L11 2.586zM8 10a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              />

                            </svg>

                          </div>

                          {/* NAMA FILE */}

                          <div className="min-w-0">

                            <p className="font-semibold text-gray-800">
                              {doc.nama}
                            </p>

                            <p className="mt-1 max-w-[220px] truncate text-xs text-gray-400">
                              {doc.file || "Tidak ada file"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="whitespace-nowrap px-6 py-5">

                        {renderStatus(doc.status)}

                      </td>

                      {/* UPLOAD */}

                      <td className="whitespace-nowrap px-6 py-5 text-gray-500">

                        {doc.upload}

                      </td>

                      {/* VALIDASI */}

                      <td className="whitespace-nowrap px-6 py-5 text-gray-500">

                        {doc.validasi}

                      </td>

                      {/* CATATAN */}

                      <td className="max-w-[200px] px-6 py-5">

                        <span className="text-sm text-gray-500">

                          {doc.catatan || "-"}

                        </span>

                      </td>

                      {/* AKSI */}

                      <td className="px-6 py-5">

                        <div className="flex justify-center gap-2">

                          {/* PREVIEW */}

                          <Button
                            size="xs"
                            color="light"
                            onClick={() => {
                              alert(
                                `Preview dokumen: ${doc.file}`
                              );
                            }}
                          >
                            Preview
                          </Button>

                          {/* DOWNLOAD */}

                          <Button
                            size="xs"
                            color="blue"
                            onClick={() => {
                              alert(
                                `Download dokumen: ${doc.file}`
                              );
                            }}
                          >
                            Unduh
                          </Button>

                          {/* EDIT */}

                          {(doc.status === "Pending" ||
                            doc.status === "Rejected") && (

                            <Button
                              size="xs"
                              color="light"
                              onClick={() => {

                                setJenisDokumen(
                                  doc.nama
                                );

                                alert(
                                  "Silakan pilih file baru pada form upload di atas."
                                );

                              }}
                            >
                              Edit
                            </Button>

                          )}

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </Card>
        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex gap-3">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">

              <span className="text-sm font-bold text-blue-600">
                i
              </span>

            </div>

            <div>

              <h3 className="font-semibold text-blue-800">
                Informasi Pengajuan
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                Pastikan seluruh dokumen yang diunggah
                merupakan dokumen yang benar dan dapat
                terbaca dengan jelas. Dokumen dengan status
                <strong> Rejected </strong>
                dapat diperbarui melalui tombol Edit.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}