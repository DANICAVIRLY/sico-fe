import {
  TextInput,
  Select,
  Button,
  Badge,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function DataPengajuan() {
  // 1. DATA ASLI (Sumber data)
  const allData = [
    { id: 1, nama: "Rizki Maulana", nim: "1234567890", tanggal: "20 Mei 2026", departemen: "Hasil Hutan", status: "Menunggu Verifikasi" },
    { id: 2, nama: "Sodikmomoko", nim: "2345678901", tanggal: "20 Mei 2026", departemen: "Hasil Hutan", status: "Disetujui" },
    { id: 3, nama: "Mursalino Abroho", nim: "3456789012", tanggal: "20 Mei 2026", departemen: "Hasil Hutan", status: "Perlu Perbaikan" },
    { id: 4, nama: "Peter Kounaloy", nim: "4567890123", tanggal: "20 Mei 2026", departemen: "Hasil Hutan", status: "Disetujui" },
    { id: 5, nama: "Oghi Hooja", nim: "5678901234", tanggal: "20 Mei 2026", departemen: "Hasil Hutan", status: "Perlu Perbaikan" },
    { id: 6, nama: "Justin Bieber", nim: "6789012345", tanggal: "20 Mei 2026", departemen: "Hasil Hutan", status: "Disetujui" },
    { id: 7, nama: "Martin Edwards", nim: "7890123456", tanggal: "20 Mei 2026", departemen: "Hasil Hutan", status: "Perlu Perbaikan" },
    { id: 8, nama: "Ello Bright", nim: "8901234567", tanggal: "20 Mei 2026", departemen: "Hasil Hutan", status: "Menunggu Verifikasi" },
    // Tambah data dummy agar pagination terlihat efeknya
    { id: 9, nama: "Budi Santoso", nim: "1231111111", tanggal: "21 Mei 2026", departemen: "Agronomi", status: "Menunggu Verifikasi" },
    { id: 10, nama: "Ani Wijaya", nim: "2222222222", tanggal: "22 Mei 2026", departemen: "Pasca Panen", status: "Disetujui" },
    { id: 11, nama: "Citra Dewi", nim: "3333333333", tanggal: "23 Mei 2026", departemen: "Hasil Hutan", status: "Perlu Perbaikan" },
    { id: 12, nama: "Dodi Iskandar", nim: "4444444444", tanggal: "24 Mei 2026", departemen: "Teknologi Pangan", status: "Disetujui" },
  ];

  // 2. STATE UNTUK FILTER & PAGINATION
  const [filteredData, setFilteredData] = useState(allData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua status");
  const [selectedDate, setSelectedDate] = useState("");
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Tampilkan 5 data per halaman

  // 3. LOGIKA FILTER
  useEffect(() => {
    let result = allData;

    if (selectedStatus !== "Semua status") {
      result = result.filter((item) => item.status === selectedStatus);
    }

    if (selectedDate) {
      result = result.filter((item) => item.tanggal === selectedDate);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) => 
        item.nama.toLowerCase().includes(lowerSearch) ||
        item.nim.includes(lowerSearch) ||
        item.departemen.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredData(result);
    setCurrentPage(1); // Reset ke halaman 1 setiap kali filter berubah
  }, [searchTerm, selectedStatus, selectedDate]);

  // 4. LOGIKA PAGINATION (Memotong data untuk halaman saat ini)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // 5. FUNGSI PEMBANTU
  const getStatusColor = (status) => {
    if (status === "Menunggu Verifikasi") return "warning";
    if (status === "Disetujui") return "success";
    if (status === "Perlu Perbaikan") return "failure";
    return "gray";
  };

  return (
    <div className="w-full">
      {/* Judul Halaman */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Pengajuan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola data pengajuan mahasiswa untuk pembersihan clearing
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/4">
          <Select 
            id="status" 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option>Semua status</option>
            <option>Menunggu Verifikasi</option>
            <option>Disetujui</option>
            <option>Perlu Perbaikan</option>
          </Select>
        </div>
        <div className="w-full md:w-1/4">
          <TextInput 
            id="tanggal" 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="flex-1 relative">
          <TextInput
            id="search"
            type="text"
            placeholder="Cari Nama, NIM, atau Departemen..."
            rightIcon={HiSearch}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Data */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <Table striped>
          <TableHead>
            <TableRow>
              <TableHeadCell>No</TableHeadCell>
              <TableHeadCell>Nama</TableHeadCell>
              <TableHeadCell>NIM</TableHeadCell>
              <TableHeadCell>Tanggal</TableHeadCell>
              <TableHeadCell>Departemen</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Aksi</TableHeadCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((data, index) => (
                <TableRow key={data.id}>
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell className="font-medium text-gray-900">{data.nama}</TableCell>
                  <TableCell>{data.nim}</TableCell>
                  <TableCell>{data.tanggal}</TableCell>
                  <TableCell>{data.departemen}</TableCell>
                  <TableCell>
                    <Badge color={getStatusColor(data.status)}>
                      {data.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link to={`/detail-verifikasi/${data.id}`}>
                      <Button size="xs" className="rounded-full bg-[#F3F4FF] text-blue-700 hover:bg-blue-100 border-none px-4 py-1.5 font-medium">
                        Lihat Detail
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  Tidak ada data yang ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (Berfungsi Penuh!) */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-700">
          Showing <span className="font-bold">{startIndex + 1}</span> to <span className="font-bold">{Math.min(endIndex, filteredData.length)}</span> of <span className="font-bold">{filteredData.length}</span> Entries
        </span>
        <div className="flex gap-2">
          {/* Tombol Previous */}
          <Button 
            size="xs" 
            color="gray" 
            className="bg-gray-100 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>

          {/* Angka Halaman */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              size="xs"
              color={currentPage === pageNum ? "dark" : "gray"}
              className={currentPage === pageNum ? "bg-black text-white" : "bg-gray-100"}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </Button>
          ))}

          {/* Tombol Next */}
          <Button 
            size="xs" 
            color="gray" 
            className="bg-gray-100 disabled:opacity-50"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}