import { Button, Label, TextInput } from "flowbite-react";
import logo from "../assets/logo_ipb.png";
import ipb from "../assets/ipb.png";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const capitalizeWords = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Aturan NIM: 1 huruf + 10 angka = 11 karakter, awalan E441-E444
const NIM_LENGTH = 11;
const NIM_PREFIX_REGEX = /^E44[1-4]/;
const NIM_FULL_REGEX = /^E44[1-4][0-9]{7}$/;

const FormField = ({ id, label, error, ...props }) => (
  <div>
    <Label
      htmlFor={id}
      color={error ? "failure" : undefined}
      className="text-sm font-semibold"
    >
      {label}
    </Label>
    <TextInput
      id={id}
      color={error ? "failure" : "gray"}
      shadow
      className="mt-1"
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default function Signup() {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: "", general: "" }));

  const validate = () => {
    const newErrors = {};

    if (!nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi.";
    }

    if (!email.trim()) {
      newErrors.email = "Email wajib diisi.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Format email tidak valid.";
    }

    if (!nim.trim()) {
      newErrors.nim = "NIM wajib diisi.";
    } else if (!NIM_PREFIX_REGEX.test(nim)) {
      newErrors.nim =
        "NIM harus diawali E dan menggunakan kode departemen yang valid (E441, E442, E443, atau E444).";
    } else if (!NIM_FULL_REGEX.test(nim)) {
      newErrors.nim = "NIM harus 11 karakter: 1 huruf diikuti 10 angka.";
    }

    if (!password) {
      newErrors.password = "Password wajib diisi.";
    } else if (password.length < 8) {
      newErrors.password = "Password minimal 8 karakter.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi.";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Konfirmasi password tidak cocok.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await axios.post(
        "http://172.18.160.91:8000/api/auth/register",
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

      localStorage.setItem("nama", nama);
      localStorage.setItem("nim", nim);

      navigate("/login");
    } catch (error) {
      const serverErrors = error.response?.data?.errors;

      if (serverErrors) {
        const mapped = {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          const key =
            field === "password_confirmation" ? "confirmPassword" : field;
          mapped[key] = messages[0];
        });
        setErrors(mapped);
      } else {
        setErrors({
          general: error.response?.data?.message || "Registrasi gagal.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#b8b1b1]">
      <div className="min-h-screen w-full bg-white grid md:grid-cols-2">
        <div className="min-h-screen overflow-y-auto flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-3">
              <img
                src={logo}
                alt="Logo IPB"
                className="w-14 h-14 object-contain"
              />
            </div>
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

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <FormField
                id="nama"
                label="Nama Lengkap"
                type="text"
                placeholder="Masukkan Nama"
                value={nama}
                error={errors.nama}
                onChange={(e) => {
                  setNama(capitalizeWords(e.target.value));
                  clearError("nama");
                }}
              />

              <FormField
                id="email"
                label="Email"
                type="email"
                placeholder="Masukkan Email"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
              />

              <FormField
                id="nim"
                label="NIM"
                type="text"
                placeholder="Masukkan NIM"
                maxLength={NIM_LENGTH}
                value={nim}
                error={errors.nim}
                onChange={(e) => {
                  setNim(capitalizeFirstLetter(e.target.value));
                  clearError("nim");
                }}
              />

              <FormField
                id="password"
                label="Password"
                type="password"
                placeholder="Masukkan Password"
                value={password}
                error={errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
              />

              <FormField
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Ulangi Password"
                value={confirmPassword}
                error={errors.confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError("confirmPassword");
                }}
              />

              {errors.general && (
                <p className="text-sm text-red-600 text-center">
                  {errors.general}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 mt-6"
              >
                Sign Up
              </Button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Sudah punya akun?{" "}
                <Link to="/login" className="text-indigo-600 hover:underline">
                  Login di sini
                </Link>
              </p>
            </form>
          </div>
        </div>

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