import { BrowserRouter, Routes, Route } from "react-router-dom";

// Halaman mahasiswa
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import DashboardMahasiswa from "../pages/DashboardMahasiswa";
import PengajuanPerpustakaan from "../pages/PengajuanPerpustakaan";
import PengajuanSaya from "../pages/PengajuanSaya";

// Halaman pustakawan
import PustakawanDashboard from "../pages/PustakawanDashboard";
import DataPengajuan from "../pages/DataPengajuan";
import DetailVerifikasi from "../pages/DetailVerifikasi";
import VerifikasiBerhasil from "../pages/VerifikasiBerhasil";

// Layout pustakawan
import PustakawanLayout from "../layouts/PustakawanLayout";

// Halaman atasan
import AtasanDashboard from "../pages/AtasanDashboard";
import DataMahasiswaAtasan from "../pages/DataMahasiswaAtasan";
import TandaTanganAtasan from "../pages/TandaTanganAtasan";
import VerifikasiQR from "../pages/VerifikasiQR";

// Layout atasan
import AtasanLayout from "../layouts/AtasanLayout";

export default function RouteApp() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= MAHASISWA ================= */}

        <Route path="/" element={<Signup />} />

        <Route path="/login-admin" element={<Login />} />

        <Route
          path="/dashboard-mahasiswa"
          element={<DashboardMahasiswa />}
        />

        <Route
          path="/bebas-pustaka"
          element={<PengajuanPerpustakaan />}
        />

        <Route
          path="/pengajuan-saya"
          element={<PengajuanSaya />}
        />


        {/* ================= PUSTAKAWAN ================= */}

        <Route element={<PustakawanLayout />}>
          <Route
            path="/pustakawan-dashboard"
            element={<PustakawanDashboard />}
          />

          <Route
            path="/data-pengajuan"
            element={<DataPengajuan />}
          />

          <Route
            path="/detail-verifikasi/:id"
            element={<DetailVerifikasi />}
          />

          <Route
            path="/verifikasi-berhasil"
            element={<VerifikasiBerhasil />}
          />
        </Route>


        {/* ================= ATASAN ================= */}

        <Route element={<AtasanLayout />}>
          <Route
            path="/dashboard-atasan"
            element={<AtasanDashboard />}
          />

          <Route
            path="/data-mahasiswa-atasan"
            element={<DataMahasiswaAtasan />}
          />

          <Route
            path="/tanda-tangan/:id"
            element={<TandaTanganAtasan />}
          />

          <Route
            path="/verifikasi-qr/:id"
            element={<VerifikasiQR />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}