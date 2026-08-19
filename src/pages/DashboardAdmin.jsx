import SidebarAdminComp from "../components/SidebarAdminComp";
import { useEffect, useState } from "react";
import axios from "axios";
import { HiDocumentText, HiClock, HiPencil, HiCheckCircle } from "react-icons/hi";

export default function DashboardAdmin() {
  const [data, setData] = useState({
    total: 0,
    menunggu: 0,
    perbaikan: 0,
    selesai: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const token = localStorage.getItem('token');
    
    axios.get('/api/pengajuan-clearing', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      const items = response.data;
      setData({
        total: items.length,
        menunggu: items.filter(item => 
          item.status === 'menunggu' || item.status === 'pending'
        ).length,
        perbaikan: items.filter(item => 
          item.status === 'perbaikan' || item.status === 'revision'
        ).length,
        selesai: items.filter(item => 
          item.status === 'diverifikasi' || item.status === 'approved' || item.status === 'selesai'
        ).length
      });
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      setLoading(false);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <SidebarAdminComp />
        <main className="ml-64 min-h-screen p-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-500">Loading...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <SidebarAdminComp />

      <main className="ml-64 min-h-screen p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan pengajuan</p>
        </div>

        {/* Card statistik dengan border di ATAS */}
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

          {/* Perlu Perbaikan */}
          <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Perlu Perbaikan</p>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.perbaikan}</h2>
              </div>
              <div className="p-3 bg-red-100 rounded-full text-red-600">
                <HiPencil className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Selesai */}
          <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Selesai</p>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">{data.selesai}</h2>
              </div>
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <HiCheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}