import { Button, Label, TextInput } from "flowbite-react";
import logo from "../assets/logo_ipb.png";
import ipb from "../assets/ipb.jpeg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Cek password
    if (password !== confirmPassword) {
      alert("Password dan Confirm Password tidak sama!");
      return;
    }

    // Cek semua data
    if (!nama || !nim || !email || !password || !confirmPassword) {
      alert("Semua data harus diisi!");
      return;
    }

    // Simpan data mahasiswa
    localStorage.setItem("nama", nama);
    localStorage.setItem("nim", nim);
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
    localStorage.setItem("role", "mahasiswa");

    // Arahkan ke halaman login
    navigate("/login-admin");
  };

  return (
    <div className="min-h-screen bg-[#b8b1b1]">
      <div className="min-h-screen w-full bg-white grid md:grid-cols-2">

        {/* ================= BAGIAN FORM ================= */}
        <div className="min-h-screen overflow-y-auto flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md">

            {/* Logo */}
            <div className="flex justify-center mb-3">
              <img
                src={logo}
                alt="Logo IPB"
                className="w-14 h-14 object-contain"
              />
            </div>

            {/* Judul */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-800">
                IPB University
              </h2>

              <h1 className="text-2xl font-bold text-gray-900 mt-4">
                Sistem Informasi
              </h1>

              <h1 className="text-2xl font-bold text-gray-900">
                Clearing Online
              </h1>

              <p className="text-xs text-gray-500 mt-3">
                Silahkan daftar untuk melanjutkan
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <Label
                  htmlFor="nama"
                  value="Nama Lengkap"
                  className="text-sm font-semibold"
                >Nama Lengkap</Label>

                <TextInput
                  id="nama"
                  type="text"
                  placeholder="Masukkan Nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                  shadow
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="email"
                  value="Email"
                  className="text-sm font-semibold"
                > Email</Label>

                <TextInput
                  id="email"
                  type="email"
                  placeholder="Masukkan Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  shadow
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="nim"
                  value="NIM"
                  className="text-sm font-semibold"
                >NIM</Label>

                <TextInput
                  id="nim"
                  type="text"
                  placeholder="Masukkan NIM"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  required
                  shadow
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="password"
                  value="Password"
                  className="text-sm font-semibold"
                >Password</Label>

                <TextInput
                  id="password"
                  type="password"
                  placeholder="Masukkan Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  shadow
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="confirmPassword"
                  value="Confirm Password"
                  className="text-sm font-semibold"
                >Confirm Password</Label>

                <TextInput
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  shadow
                  className="mt-1"
                />
              </div>

              {/* Button */}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 mt-6"
              >
                Sign Up
              </Button>

            </form>
          </div>
        </div>

        {/* ================= FOTO FIXED ================= */}
        <div className="hidden md:block fixed right-0 top-0 h-screen w-1/2">
          <img
            src={ipb}
            alt="IPB University"
            className="h-full w-full object-cover"
          />
        </div>

      </div>
    </div>
  );
}