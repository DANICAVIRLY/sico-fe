import SidebarAdminComp from "../components/SidebarAdminComp";

export default function DashboardAdmin() {
  return (
    <div className="min-h-screen bg-gray-100">

      <SidebarAdminComp />

      <main className="ml-64 min-h-screen p-8">

        <h1 className="text-3xl font-bold">
          Dashboard Admin
        </h1>

        <p className="text-gray-500 mt-2">
          Ringkasan pengajuan
        </p>

        {/* Card statistik */}
        <div className="grid grid-cols-4 gap-5 mt-8">

          <div className="bg-white rounded-xl p-5">
            <p className="text-gray-500">Pengajuan</p>
            <h2 className="text-3xl font-bold text-indigo-600 mt-2">
              15
            </h2>
          </div>

          <div className="bg-white rounded-xl p-5">
            <p className="text-gray-500">Menunggu Verifikasi</p>
            <h2 className="text-3xl font-bold text-orange-500 mt-2">
              12
            </h2>
          </div>

          <div className="bg-white rounded-xl p-5">
            <p className="text-gray-500">Perlu Perbaikan</p>
            <h2 className="text-3xl font-bold text-red-500 mt-2">
              8
            </h2>
          </div>

          <div className="bg-white rounded-xl p-5">
            <p className="text-gray-500">Selesai</p>
            <h2 className="text-3xl font-bold text-green-500 mt-2">
              45
            </h2>
          </div>

        </div>

      </main>

    </div>
  );
}