import { Button, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // =========================
    // LOGIN ATASAN
    // =========================
    if (username === "atasan@ipb.ac.id" && password === "123456") {
      localStorage.setItem("role", "atasan");
      navigate("/dashboard-atasan");
      return;
    }

    // =========================
    // LOGIN PUSTAKAWAN
    // =========================
    if (username === "pustakawan@ipb.ac.id" && password === "123456") {
      localStorage.setItem("role", "pustakawan");
      navigate("/pustakawan-dashboard");
      return;
    }

    // =========================
    // LOGIN ADMIN
    // =========================
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("role", "admin");
      navigate("/dashboard-admin");
      return;
    }

    // =========================
    // LOGIN MAHASISWA
    // =========================
    const nama = localStorage.getItem("nama");
    const nim = localStorage.getItem("nim");
    const savedPassword = localStorage.getItem("password");

    if (
      (username === nim || username === nama) &&
      password === savedPassword
    ) {
      localStorage.setItem("role", "mahasiswa");
      navigate("/dashboard-mahasiswa");
      return;
    }

    setError("Username/NIM atau password salah!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            IPB University
          </h1>

          <h2 className="text-xl font-bold text-gray-800 mt-2">
            Sistem Informasi
          </h2>

          <h2 className="text-xl font-bold text-gray-800">
            Clearing Online
          </h2>

          <p className="text-sm text-gray-500 mt-3">
            Silahkan masuk untuk melanjutkan
          </p>
        </div>

        {error && (
          <div className="mb-4 text-red-600 text-sm bg-red-100 p-3 rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <Label
              htmlFor="username"
              value="Username / Email / NIM"
            />

            <TextInput
              id="username"
              type="text"
              placeholder="Masukkan username, email, atau NIM"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              shadow
              className="mt-1"
            />
          </div>

          <div>
            <Label
              htmlFor="password"
              value="Password"
            />

            <TextInput
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              shadow
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Login
          </Button>

        </form>

      </div>
    </div>
  );
}