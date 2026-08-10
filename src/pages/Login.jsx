import { Button, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; //

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // logic dummy
    if (email === "atasan@ipb.ac.id" && password === "123456") {
      navigate("/dashboard-atasan");
    } else if (email === "pustakawan@ipb.ac.id" && password === "123456") {
      navigate("/pustakawan-dashboard");
    } else {
      setError("Email atau Password salah! Coba lagi.");
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
            <h1 className="text-2xl font-bold text-gray-900">IPB University</h1>
            <h2 className="text-xl font-bold text-gray-800 mt-1">
              Sistem Informasi
            </h2>
            <h2 className="text-xl font-bold text-gray-800">Clearing Online</h2>
            <p className="text-xs text-gray-500 mt-3">
              Silahkan masuk dan melaporkan
            </p>
          </div>

          <form className="flex max-w-md flex-col gap-4" onSubmit={handleLogin}>
            {error && (
              <div className="text-red-500 text-sm bg-red-100 p-2 rounded text-center">
                {error}
              </div>
            )}

            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Email" />
              </div>
              <TextInput
                id="email"
                type="email"
                placeholder="Masukan username"
                required
                shadow
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Password" />
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
              className="w-full mt-2 bg-blue-800 hover:bg-blue-900"
            >
              Login
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
