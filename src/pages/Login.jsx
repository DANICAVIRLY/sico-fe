import { Button, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    const payload = {
      login: email.trim(),
      password: password,
    };

    console.log("DATA YANG DIKIRIM:", payload);

    const response = await axios.post(
      "http://127.0.0.1:8000/api/auth/login",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("LOGIN BERHASIL:", response.data);

    const data = response.data.data;
    const user = data.user;
    const token = data.token;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    const roles = user.roles || [];

    if (roles.includes("atasan")) {
      navigate("/dashboard-atasan");
    } else if (roles.includes("pustakawan")) {
      navigate("/pustakawan-dashboard");
    } else if (roles.includes("admin")) {
      navigate("/dashboard-admin");
    } else if (roles.includes("mahasiswa")) {
      navigate("/dashboard-mahasiswa");
    } else {
      setError("Role akun tidak dikenali.");
    }

  } catch (error) {
    console.log("STATUS:", error.response?.status);
    console.log("RESPONSE ERROR:", error.response?.data);
    console.log("VALIDATION ERROR:", error.response?.data?.errors);

    const errors = error.response?.data?.errors;

    if (errors?.login) {
      setError(errors.login[0]);
    } else {
      setError(
        error.response?.data?.message ||
        "Email atau password salah."
      );
    }

  } finally {
    setLoading(false);
  


  setError(
    error.response?.data?.message ||
    "Validasi gagal."
  );

    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 lg:p-20 bg-white">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img
              src="https://upload.wikimedia.org/wikipedia/id/0/0f/Logo_IPB.png"
              className="h-16 mx-auto mb-4 object-contain"
              alt="Logo IPB University"
            />

            <h1 className="text-2xl font-bold text-gray-900">
              IPB University
            </h1>

            <h2 className="text-xl font-bold text-gray-800 mt-1">
              Sistem Informasi
            </h2>

            <h2 className="text-xl font-bold text-gray-800">
              Clearing Online
            </h2>

            <p className="text-xs text-gray-500 mt-3">
              Silahkan masuk dan melaporkan
            </p>
          </div>

          <form
            className="flex max-w-md flex-col gap-4"
            onSubmit={handleLogin}
          >
            {error && (
              <div className="text-red-500 text-sm bg-red-100 p-2 rounded text-center">
                {error}
              </div>
            )}

            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="email" > Email</Label>
              </div>

              <TextInput
                id="email"
                type="email"
                placeholder="Masukkan email"
                required
                shadow
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Password" >Password </Label>
              </div>

              <TextInput
                id="password"
                type="password"
                placeholder="Masukan password"
                required
                shadow
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end mt-1">
              <Link
                to="/lupa-password"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-800 hover:bg-blue-900"
            >
              {loading ? "Sedang Login..." : "Login"}
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop"
          alt="Gerbang IPB University"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/10"></div>
      </div>
    </div>
  );
}