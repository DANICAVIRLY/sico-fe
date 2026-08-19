import { Button, Label, TextInput } from "flowbite-react";
import logo from "../assets/logo_ipb.png";
import ipb from "../assets/ipb.jpeg";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Password dan Confirm Password tidak sama!");
      return;
    }

    if (!nama || !nim || !email || !password || !confirmPassword) {
      alert("Semua data harus diisi!");
      return;
    }

    try {
      const response = await axios.post(
        "http://10.59.92.251:8000/api/auth/register",
        {
          nama: nama,
          nim: nim,
          email: email,
          password: password,
          password_confirmation: confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("REGISTER BERHASIL:", response.data);

      localStorage.setItem("nama", nama);
      localStorage.setItem("nim", nim);

      navigate("/login-admin");
    } catch (error) {
      console.log("STATUS:", error.response?.status);
      console.log("ERROR:", error.response?.data);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0][0];

        alert(firstError);
      } else {
        alert(
          error.response?.data?.message || "Registrasi gagal."
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#b8b1b1]">
      <div className="min-h-screen w-full bg-white grid md:grid-cols-2">
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

              {/* Email */}
              <div>
                <Label
                  htmlFor="email"
                  value="Email"
                  className="text-sm font-semibold"
                >Email</Label>

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

              {/* NIM */}
              <div>
                <Label
                  htmlFor="nim"
                  value="NIM"
                  className="text-sm font-semibold"
                > NIM</Label>

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

              {/* Password */}
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

              {/* Confirm Password */}
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
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
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

              {/* Login */}
              <div className="text-center mt-5">
                <Link
                  to="/login-admin"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Login sebagai Admin / Atasan / Pustakawan
                </Link>
              </div>
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