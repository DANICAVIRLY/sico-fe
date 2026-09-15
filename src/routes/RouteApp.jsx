import { BrowserRouter, Routes, Route } from "react-router-dom";

//  MAHASISWA
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import DashboardMahasiswa from "../pages/DashboardMahasiswa";
import PengajuanPerpustakaan from "../pages/PengajuanPerpustakaan";
import PengajuanSaya from "../pages/PengajuanSaya";

//  ADMIN 
import DashboardAdmin from "../pages/DashboardAdmin";
import DataMahasiswa from "../pages/DataMahasiswa";
import VerifikasiMahasiswa from "../pages/VerifikasiMahasiswa";
import Selesai from "../pages/Selesai";
import DetailSelesai from "../pages/DetailSelesai";

//  PUSTAKAWAN 
import PustakawanDashboard from "../pages/PustakawanDashboard";
import DataPengajuan from "../pages/DataPengajuan";
import DetailVerifikasi from "../pages/DetailVerifikasi";
import VerifikasiBerhasil from "../pages/VerifikasiBerhasil";

// Layout pustakawan
import PustakawanLayout from "../layouts/PustakawanLayout";

//  ATASAN 
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

        {/* Halaman ini sudah punya sidebar & layout (lg:ml-64) sendiri di
            dalam komponennya, jadi TIDAK dibungkus PustakawanLayout lagi.
            Kalau tetap dibungkus, sidebar & margin jadi dobel (itu penyebab
            tampilan "berjarak"/kepotong yang dilaporkan). */}
        <Route
          path="/pustakawan-dashboard"
          element={<PustakawanDashboard />}
        />
        <Route
          path="/data-pengajuan"
          element={<DataPengajuan />}
        />

        {/* Halaman di bawah ini masih pakai PustakawanLayout (asumsi mereka
            BELUM punya sidebar sendiri). Kalau ternyata DetailVerifikasi
            atau VerifikasiBerhasil juga sudah punya sidebar sendiri
            (mirip DataPengajuan), keluarkan juga route-nya dari sini
            seperti dua route di atas. */}
        <Route element={<PustakawanLayout />}>
          <Route
            path="/detail-verifikasi/:id"
            element={<DetailVerifikasi />}
          />
          <Route
            path="/verifikasi-berhasil"
            element={<VerifikasiBerhasil />}
          />
        </Route>

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