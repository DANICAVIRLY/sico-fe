import { HiDocumentText, HiCheckCircle, HiClock, HiPencil } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PustakawanDashboard() {
  const [data, setData] = useState({
    total: 0,
    diverifikasi: 0,
    menunggu: 0,
    revisi: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://10.6.65.73:8000/api/bebas-pustaka",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        console.log("RESPONSE DASHBOARD PUSTAKAWAN:", response.data);

        const items = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.data?.data || [];

        if (!Array.isArray(items)) {
          console.error("Data dari backend bukan array:", response.data);

          setData({
            total: 0,
            diverifikasi: 0,
            menunggu: 0,
            revisi: 0,
          });

          return;
        }

        console.log("DATA PENGAJUAN:", items);

        // Value ini persis sesuai App\Enums\BebasPustakaStatus:
        // DIAJUKAN = 'menunggu', DISETUJUI = 'disetujui', REVISI = 'revisi'
        setData({
          total: items.length,

          diverifikasi: items.filter(
            (item) => item.status?.toLowerCase() === "disetujui"
          ).length,

          menunggu: items.filter(
            (item) => item.status?.toLowerCase() === "menunggu"
          ).length,

          revisi: items.filter(
            (item) => item.status?.toLowerCase() === "revisi"
          ).length,
        });

      } catch (error) {
        console.error("Error fetching data:", error);

        if (error.response) {
          console.error("STATUS:", error.response.status);
          console.error("RESPONSE:", error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Judul Halaman */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Pustakawan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola dan verifikasi bebas pustaka mahasiswa
        </p>
      </div>

      {/* Card statistik dengan border di ATAS - sama persis gaya Dashboard Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
        {/* Total Pengajuan */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Pengajuan</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.total}</h2>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
              <HiDocumentText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Menunggu Verifikasi */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Menunggu Verifikasi</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.menunggu}</h2>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
              <HiClock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Revisi */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Revisi</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.revisi}</h2>
            </div>
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <HiPencil className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Selesai / Diverifikasi */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Diverifikasi</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.diverifikasi}</h2>
            </div>
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <HiCheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}