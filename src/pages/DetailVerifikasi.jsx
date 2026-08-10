import { Button, Card, Textarea, Select, Badge } from "flowbite-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { useState } from "react";

export default function DetailVerifikasi() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State untuk menampung Catatan Pustakawan
  const [catatan, setCatatan] = useState("");

  // Fungsi saat tombol Verifikasi Lulus ditekan
  const handleVerifikasiLulus = () => {
    // Pindah ke halaman berhasil, sambil membawa data catatan
    navigate('/verifikasi-berhasil', { 
      state: { 
        catatanPustakawan: catatan 
      } 
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Judul Halaman */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Hasil Verifikasi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Data mahasiswa - detail - surat bebas clearing
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Kartu 1: Data Mahasiswa (Sama seperti sebelumnya) */}
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Amira Thudzahra</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge color="success" className="text-xs">tahap akhir</Badge>
                <Badge color="indigo" className="text-xs">verifikasi perpustakaan</Badge>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>pengajuan clearing</p>
              <p className="text-xs">10 mei 1982, 10:30 wib</p>
            </div>
          </div>
        </Card>

        {/* Kartu 2: Syarat - Syarat */}
        <Card>
          <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Syarat-Syarat Untuk Bebas Pustaka</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Tidak ada peminjaman buku</span>
              <Select className="w-32">
                <option>Tidak ada</option>
              </Select>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Tidak ada denda</span>
              <Select className="w-32">
                <option>Ada</option>
                <option>Tidak ada</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Kartu 3: Catatan Pustakawan (DENGAN STATE) */}
        <Card>
          <h3 className="font-bold text-gray-800 mb-2">Catatan Pustakawan</h3>
          <Textarea
            id="catatan"
            placeholder="Tulis catatan jika ada..."
            rows={3}
            className="w-full"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)} // Simpan input ke state
          />
        </Card>

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-4 mt-2">
          <Link to="/data-pengajuan">
            <Button color="gray" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              <HiArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>
          <Button color="failure" className="bg-red-500 hover:bg-red-600">
            Tolak
          </Button>
          
          {/* TOMBOL VERIFIKASI LULUS DENGAN NAVIGATE */}
          <Button 
            className="bg-blue-800 hover:bg-blue-900"
            onClick={handleVerifikasiLulus}
          >
            Verifikasi Lulus
          </Button>
        </div>
      </div>
    </div>
  );
}