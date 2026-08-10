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

export default function DataMahasiswaAtasan() {
  // Data Asli Atasan
  const allData = [
    { id: 1, nama: "Rizki Maulana", nim: "1234567890", tanggal: "2026-05-20", departemen: "Hasil Hutan", status: "Belum Ditandatangani" },
    { id: 2, nama: "Sodikmomoko", nim: "2345678901", tanggal: "2026-04-20", departemen: "Hasil Hutan", status: "Selesai Ditandatangani" },
    { id: 3, nama: "Mursalino Abroho", nim: "3456789012", tanggal: "2026-05-20", departemen: "Hasil Hutan", status: "Belum Ditandatangani" },
    { id: 4, nama: "Peter Kovinsky", nim: "4567890123", tanggal: "2026-04-20", departemen: "Hasil Hutan", status: "Selesai Ditandatangani" },
    { id: 5, nama: "Oghi Hoidi", nim: "5678901234", tanggal: "2026-05-20", departemen: "Hasil Hutan", status: "Belum Ditandatangani" },
    { id: 6, nama: "Justin Bieber", nim: "6789012345", tanggal: "2026-04-20", departemen: "Hasil Hutan", status: "Selesai Ditandatangani" },
    { id: 7, nama: "Martin Edwards", nim: "7890123456", tanggal: "2026-05-20", departemen: "Hasil Hutan", status: "Belum Ditandatangani" },
    { id: 8, nama: "Ello Bright", nim: "8901234567", tanggal: "2026-05-20", departemen: "Hasil Hutan", status: "Belum Ditandatangani" },
  ];

  const [filteredData, setFilteredData] = useState(allData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua status");
  const [selectedDate, setSelectedDate] = useState("");

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
  }, [searchTerm, selectedStatus, selectedDate]);

  const getStatusColor = (status) => {
    if (status === "Belum Ditandatangani") return "failure";
    if (status === "Selesai Ditandatangani") return "success";
    return "gray";
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Mahasiswa</h1>
        <p className="text-sm text-gray-500 mt-1">
          Berikut adalah data mahasiswa yang mengajukan untuk meminta tanda tangan
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/4">
          <Select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option>Semua status</option>
            <option>Belum Ditandatangani</option>
            <option>Selesai Ditandatangani</option>
          </Select>
        </div>
        <div className="w-full md:w-1/4">
          <TextInput 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="flex-1 relative">
          <TextInput
            type="text"
            placeholder="Cari Nama, NIM, atau Departemen..."
            rightIcon={HiSearch}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

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
            {filteredData.length > 0 ? (
              filteredData.map((data, index) => (
                <TableRow key={data.id}>
                  <TableCell>{index + 1}</TableCell>
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
                    <Link to={`/tanda-tangan/${data.id}`}>
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
    </div>
  );
}