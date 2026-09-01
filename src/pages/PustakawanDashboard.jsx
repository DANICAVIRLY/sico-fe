import { Card } from 'flowbite-react';
import { HiDocumentText, HiCheckCircle, HiClock, HiXCircle } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PustakawanDashboard() {
  const [data, setData] = useState({
    total: 0,
    diverifikasi: 0,
    menunggu: 0,
    ditolak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://10.6.64.238:8000/api/bebas-pustaka",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        console.log("RESPONSE DASHBOARD PUSTAKAWAN:", response.data);

        // Ambil array dari response.data.data maupun pagination response.data.data.data
        const items = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.data?.data || [];

        // Pastikan data memang array
        if (!Array.isArray(items)) {
          console.error(
            "Data dari backend bukan array:",
            response.data
          );

          setData({
            total: 0,
            diverifikasi: 0,
            menunggu: 0,
            ditolak: 0,
          });

          return;
        }

        console.log("DATA PENGAJUAN:", items);

        setData({
          total: items.length,

          diverifikasi: items.filter(
            (item) =>
              item.status === "diverifikasi" ||
              item.status === "disetujui" ||
              item.status === "approved" ||
              item.status === "verified"
          ).length,

          menunggu: items.filter(
            (item) =>
              item.status === "menunggu" ||
              item.status === "pending" ||
              !item.status
          ).length,

          ditolak: items.filter(
            (item) =>
              item.status === "ditolak" ||
              item.status === "rejected"
          ).length,
        });

      } catch (error) {
        console.error("Error fetching data:", error);

        if (error.response) {
          console.error(
            "STATUS:",
            error.response.status
          );

          console.error(
            "RESPONSE:",
            error.response.data
          );
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
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Judul Halaman */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Pustakawan</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">Kelola dan verifikasi bebas pustaka mahasiswa</p>
      </div>

      {/* Grid Kartu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Kartu 1 - Total Pengajuan */}
        <Card className="border-t-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <HiDocumentText className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-end">
              <p className="text-xs md:text-sm text-gray-500 font-medium">Total Pengajuan</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{data.total}</p>
            </div>
          </div>
        </Card>

        {/* Kartu 2 - Sudah Diverifikasi */}
        <Card className="border-t-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <HiCheckCircle className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-end">
              <p className="text-xs md:text-sm text-gray-500 font-medium">Sudah Diverifikasi</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{data.diverifikasi}</p>
            </div>
          </div>
        </Card>

        {/* Kartu 3 - Menunggu Verifikasi */}
        <Card className="border-t-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
              <HiClock className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-end">
              <p className="text-xs md:text-sm text-gray-500 font-medium">Menunggu Verifikasi</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{data.menunggu}</p>
            </div>
          </div>
        </Card>

        {/* Kartu 4 - Ditolak */}
        <Card className="border-t-4 border-red-500">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <HiXCircle className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-end">
              <p className="text-xs md:text-sm text-gray-500 font-medium">Ditolak</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{data.ditolak}</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}