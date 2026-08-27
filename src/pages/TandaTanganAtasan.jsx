import { Card, Button } from "flowbite-react";
import { Link, useParams, useLocation } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { useState, useEffect } from "react";
import axios from "axios";

export default function TandaTangan() {
  const { id } = useParams();
  const location = useLocation();
  const stateData = location.state?.dataMahasiswa;

  const [loading, setLoading] = useState(!stateData);
  const [pengajuan, setPengajuan] = useState(stateData || null);

  useEffect(() => {
    // Kalau data tidak ada di state, ambil dari API
    if (!stateData) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchData = () => {
    const token = localStorage.getItem("token");

    axios
      .get(`http://10.6.65.141:8000/api/pengajuan-clearing/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      .then((response) => {
        const item = response.data?.data || response.data;

        setPengajuan({
          id: item.id,
          nama: item.user?.nama || item.nama || "-",
          nim: item.user?.nim || item.nim || "-",
          tanggal: item.created_at
            ? new Date(item.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : "-",
          departemen:
            item.departemen || item.user?.departemen || "-",
          status: item.status || "Menunggu TTD",
          created_at: item.created_at,
        });

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        console.error("Response:", error.response?.data);
        setLoading(false);
      });
  };

 
  //setuju dan tanda tangan
  const handleSetujui = () => {
    const token = localStorage.getItem("token");

    const ttd = prompt(
      "Ketik nama lengkap sebagai tanda tangan:"
    );

    if (!ttd) return;

    axios
      .post(
        `http://10.6.65.141:8000/api/pengajuan-clearing/${id}/review-atasan`,
        {
          keputusan: "setuju",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log(
          "REVIEW ATASAN BERHASIL:",
          response.data
        );

        alert("Dokumen berhasil ditandatangani!");

        window.location.href = "/dashboard-atasan";
      })
      .catch((error) => {
        console.error(
          "ERROR REVIEW ATASAN:",
          error.response?.data
        );

        alert(
          error.response?.data?.message ||
            "Gagal menandatangani dokumen."
        );
      });
  };

  //tolak dokumen
  const handleTolak = () => {
    const alasan = prompt(
      "Masukkan alasan penolakan:"
    );

    if (!alasan) return;

    const token = localStorage.getItem("token");

    axios
      .post(
        `http://10.6.65.141:8000/api/pengajuan-clearing/${id}/review-atasan`,
        {
          keputusan: "tolak",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log(
          "PENOLAKAN BERHASIL:",
          response.data
        );

        alert("Dokumen ditolak!");

        window.location.href = "/dashboard-atasan";
      })
      .catch((error) => {
        console.error(
          "ERROR MENOLAK:",
          error.response?.data
        );

        alert(
          error.response?.data?.message ||
            "Gagal menolak dokumen."
        );
      });
  };


  //loading
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>

          <span className="ml-3 text-gray-500">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  //data tidak di temukan
  if (!pengajuan) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">
            Data pengajuan tidak ditemukan.
          </p>

          <Link
            to="/data-mahasiswa-atasan"
            className="text-indigo-600 hover:underline mt-2 inline-block"
          >
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  //halaman utama
  return (
    <div className="max-w-6xl mx-auto p-4">

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4 flex gap-2">
        <Link
          to="/dashboard-atasan"
          className="hover:underline"
        >
          Dashboard
        </Link>

        <span>›</span>

        <Link
          to="/data-mahasiswa-atasan"
          className="hover:underline"
        >
          Menunggu Tanda Tangan
        </Link>

        <span>›</span>

        <span className="text-gray-900 font-medium">
          Tanda Tangan
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        tanda_tangan_atasan
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ========================= */}
        {/* KIRI - PREVIEW */}
        {/* ========================= */}
        <div className="bg-[#e6f6e9] p-8 rounded-xl border border-green-200 min-h-[500px] flex flex-col items-center justify-center relative">

          <h3 className="text-lg font-bold text-gray-800 mb-6 w-full text-left">
            Preview Dokumen
          </h3>

          <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md h-[400px] relative">

            <div className="space-y-3 mt-8">

              <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>

              <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>

              <div className="h-3 bg-gray-200 rounded w-4/6 mx-auto"></div>

              <div className="h-3 bg-gray-200 rounded w-full mt-4"></div>

              <div className="h-3 bg-gray-200 rounded w-full"></div>

              <div className="h-3 bg-gray-200 rounded w-full"></div>

              <div className="h-3 bg-gray-200 rounded w-3/4"></div>

            </div>

            <div className="absolute bottom-8 right-8 w-24 h-12 bg-blue-100 rounded border border-blue-300 flex items-center justify-center text-blue-500 text-xs font-medium">
              Tanda Tangan
            </div>

          </div>
        </div>

        {/* ========================= */}
        {/* KANAN - INFORMASI & AKSI */}
        {/* ========================= */}
        <div className="space-y-6">

          {/* Informasi Dokumen */}
          <Card className="shadow-sm">

            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              Informasi Dokumen
            </h3>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">
                  Jenis Pengajuan
                </span>

                <span className="text-gray-900">
                  Clearing
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">
                  Nama
                </span>

                <span className="text-gray-900">
                  {pengajuan.nama}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">
                  NIM
                </span>

                <span className="text-gray-900">
                  {pengajuan.nim}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">
                  Tanggal Pengajuan
                </span>

                <span className="text-gray-900">
                  {pengajuan.tanggal}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">
                  Departemen
                </span>

                <span className="text-gray-900">
                  {pengajuan.departemen}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500 font-medium">
                  Status
                </span>

                <span className="text-gray-900">
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                    {pengajuan.status || "Menunggu TTD"}
                  </span>
                </span>
              </div>

            </div>
          </Card>

          {/* Tindakan */}
          <Card className="shadow-sm">

            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Tindakan
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              Dengan menandatangani dokumen ini, anda
              menyetujui dokumen tersebut.
            </p>

            <div className="flex flex-col gap-3">

              {/* SETUJUI */}
              <Button
                className="w-full bg-[#2e1a7a] hover:bg-[#1e1260] text-white font-bold py-2.5"
                onClick={handleSetujui}
              >
                Setujui & Tandatangani
              </Button>

              {/* TOLAK */}
              <Button
                className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2.5"
                onClick={handleTolak}
              >
                Tolak Dokumen
              </Button>

            </div>
          </Card>

          {/* Kembali */}
          <div className="pt-2">

            <Link to="/data-mahasiswa-atasan">

              <Button
                color="gray"
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 w-full lg:w-auto"
              >
                <HiArrowLeft className="mr-2 h-4 w-4" />

                Kembali
              </Button>

            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}