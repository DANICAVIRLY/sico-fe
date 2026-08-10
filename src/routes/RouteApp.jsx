import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "../pages/Signup";
import Login from "../pages/Login";
import DashboardMahasiswa from "../pages/DashboardMahasiswa";
import PengajuanPerpustakaan from "../pages/PengajuanPerpustakaan";
import PengajuanSaya from "../pages/PengajuanSaya";

export default function RouteApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Signup />}
        />
        <Route
          path="/login-admin"
          element={<Login />}
        />
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

      </Routes>
    </BrowserRouter>
  );
}