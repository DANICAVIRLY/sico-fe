import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= MAHASISWA =================
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import DashboardMahasiswa from "../pages/DashboardMahasiswa";
import PengajuanPerpustakaan from "../pages/PengajuanPerpustakaan";
import PengajuanSaya from "../pages/PengajuanSaya";

// ================= ADMIN =================
import DashboardAdmin from "../pages/DashboardAdmin";
import DataMahasiswa from "../pages/DataMahasiswa";
import VerifikasiMahasiswa from "../pages/VerifikasiMahasiswa";
import Selesai from "../pages/Selesai";
import DetailSelesai from "../pages/DetailSelesai";

// ================= PUSTAKAWAN =================
import PustakawanDashboard from "../pages/PustakawanDashboard";
import DataPengajuan from "../pages/DataPengajuan";
import DetailVerifikasi from "../pages/DetailVerifikasi";
import VerifikasiBerhasil from "../pages/VerifikasiBerhasil";

// Layout pustakawan
import PustakawanLayout from "../layouts/PustakawanLayout";

// ================= ATASAN =================
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

        {/* ================= ADMIN ================= */}

        <Route
          path="/dashboard-admin"
          element={<DashboardAdmin />}
        />

        <Route
          path="/data-mahasiswa"
          element={<DataMahasiswa />}
        />

        <Route
          path="/verifikasi-mahasiswa/:id"
          element={<VerifikasiMahasiswa />}
        />

        <Route
          path="/selesai"
          element={<Selesai />}
        />

        <Route
          path="/detail-selesai/:id"
          element={<DetailSelesai />}
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