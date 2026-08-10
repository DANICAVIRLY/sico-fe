import { Button, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo_ipb.png";
import ipb from "../assets/ipb.jpeg";

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        // Ambil data mahasiswa dari localStorage
        const nama = localStorage.getItem("nama");
        const nim = localStorage.getItem("nim");
        const savedPassword = localStorage.getItem("password");

        // =========================
        // LOGIN ADMIN
        // =========================
        if (
            username === "admin" &&
            password === "admin123"
        ) {
            localStorage.setItem("role", "admin");

            navigate("/dashboard-admin");
            return;
        }

        // =========================
        // LOGIN MAHASISWA
        // =========================
        if (
            (username === nim || username === nama) &&
            password === savedPassword
        ) {
            localStorage.setItem("role", "mahasiswa");

            navigate("/dashboard");
            return;
        }

        // Jika login gagal
        alert("Username/NIM atau password salah!");
    };

    return (
        <div className="min-h-screen bg-[#b8b1b1]">

            <div className="min-h-screen w-full bg-white grid md:grid-cols-2">

                {/* ================= BAGIAN KIRI ================= */}
                <div className="flex items-center justify-center p-8 md:p-12">

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

                            <h1 className="text-2xl font-bold text-gray-900 mt-5">
                                Sistem Informasi
                            </h1>

                            <h1 className="text-2xl font-bold text-gray-900">
                                Clearing Online
                            </h1>

                            <p className="text-xs text-gray-500 mt-3">
                                Silahkan masuk dan melanjutkan
                            </p>

                        </div>

                        {/* ================= FORM LOGIN ================= */}
                        <form
                            onSubmit={handleLogin}
                            className="space-y-5"
                        >

                            {/* Username */}
                            <div>

                                <Label
                                    htmlFor="username"
                                    value="Username / NIM"
                                    className="text-sm font-semibold"
                                />

                                <TextInput
                                    id="username"
                                    type="text"
                                    placeholder="Masukkan username atau NIM"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
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
                                />

                                <TextInput
                                    id="password"
                                    type="password"
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    shadow
                                    className="mt-1"
                                />

                            </div>

                            {/* Link */}
                            <div className="flex justify-between text-xs">

                                <button
                                    type="button"
                                    className="text-indigo-600 hover:underline"
                                >
                                    Masuk sebagai Atasan
                                </button>

                                <button
                                    type="button"
                                    className="text-indigo-600 hover:underline"
                                >
                                    Lupa password?
                                </button>

                            </div>

                            <div className="flex justify-between text-xs">

                                <button
                                    type="button"
                                    className="text-indigo-600 hover:underline"
                                >
                                    Masuk sebagai Pustakawan
                                </button>

                                <button
                                    type="button"
                                    className="text-indigo-600 hover:underline"
                                >
                                    Masuk sebagai Mahasiswa
                                </button>

                            </div>

                            {/* Login Button */}
                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 mt-5"
                            >
                                Login
                            </Button>

                        </form>

                    </div>

                </div>

                {/* ================= BAGIAN KANAN ================= */}
                <div className="hidden md:block h-screen">

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