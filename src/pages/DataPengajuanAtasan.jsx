import {
  TextInput,
  Select,
  Badge,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import { HiSearch } from "react-icons/hi";

export default function DataPengajuanAtasan() {
  // Data dummy
  const dataDummy = [
    { id: 1, nama: "Rizki Maulana", nim: "1234567890", tanggal: "20 Mei 2026", departemen: "Hasil Hutan", status: "Menunggu Verifikasi" },
    { id: 2, nama: "Sodikmomoko", nim: "2345678901", tanggal: "20 Apr 2026", departemen: "Hasil Hutan", status: "Selesai" },
    { id: 3, nama: "Mursalino Abroho", nim: "3456789012", tanggal: "20 Mei 2026", departemen: "Hasil Hutan", status: "Perlu Perbaikan" },
    { id: 4, nama: "Peter Kounaloy", nim: "4567890123", tanggal: "20 Apr 2026", departemen: "Hasil Hutan", status: "Selesai" },
  ];

  const getStatusColor = (status) => {
    if (status === "Menunggu Verifikasi") return "warning";
    if (status === "Selesai") return "success";
    if (status === "Perlu Perbaikan") return "failure";
    return "gray";
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Pengajuan</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau data pengajuan mahasiswa</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/4">
          <Select id="status" required>
            <option>Semua status</option>
            <option>Menunggu Verifikasi</option>
            <option>Selesai</option>
            <option>Perlu Perbaikan</option>
          </Select>
        </div>
        <div className="w-full md:w-1/4">
          <TextInput id="tanggal" type="date" placeholder="Tanggal / Bulan" />
        </div>
        <div className="flex-1 relative">
          <TextInput
            id="search"
            type="text"
            placeholder="Cari Nama, NIM, atau Departemen..."
            rightIcon={HiSearch}
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
            </TableRow>
          </TableHead>

          <TableBody>
            {dataDummy.map((data, index) => (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}