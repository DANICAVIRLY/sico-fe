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
import axios from "axios";

export default function DataPengajuan() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua status");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const extractArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return null;

    const commonKeys = ["data", "items", "result", "results", "bebas_pustaka", "pengajuan", "list"];

    for (const key of commonKeys) {
      if (Array.isArray(payload[key])) return payload[key];
    }

    for (const key of commonKeys) {
      if (payload[key] && typeof payload[key] === "object") {
        const nested = extractArray(payload[key]);
        if (Array.isArray(nested)) return nested;
      }
    }

    for (const value of Object.values(payload)) {
      if (Array.isArray(value)) return value;
    }

    return null;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get("http://10.6.65.141:8000/api/bebas-pustaka", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("RESPONSE DATA PENGAJUAN:", response.data);

      const responseData = extractArray(response.data?.data);

      if (!Array.isArray(responseData)) {
        console.error("Data pengajuan bukan array:", response.data);
        setAllData([]);
        setFilteredData([]);
        return;
      }

      const data = responseData.map((item) => ({
        id: item.id,
        nama: item.nama || item.user?.nama || item.mahasiswa?.nama || "-",
        nim: item.nim || item.user?.nim || item.mahasiswa?.nim || "-",
        tanggalRaw: item.created_at ? item.created_at.substring(0, 10) : "",
        tanggal: item.created_at
          ? new Date(item.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "-",
        departemen: item.departemen || item.user?.departemen || item.mahasiswa?.departemen || "-",
        status: item.status || "Menunggu Verifikasi",
      }));

      setAllData(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response) {
        console.error("STATUS:", error.response.status);
        console.error("RESPONSE:", error.response.data);
      }
      setAllData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...allData];

    if (selectedStatus !== "Semua status") {
      result = result.filter((item) => formatStatus(item.status) === selectedStatus);
    }

    if (selectedDate) {
      result = result.filter((item) => item.tanggalRaw === selectedDate);
    }

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          String(item.nama || "").toLowerCase().includes(lowerSearch) ||
          String(item.nim || "").toLowerCase().includes(lowerSearch) ||
          String(item.departemen || "").toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredData(result);
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedDate, allData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    const normalized = String(status || "").toLowerCase();
    const statusMap = {
      "menunggu verifikasi": "warning",
      disetujui: "success",
      "perlu perbaikan": "failure",
      ditolak: "failure",
      diverifikasi: "success",
      approved: "success",
      menunggu: "warning",
      pending: "warning",
      rejected: "failure",
      perbaikan: "failure",
      revision: "failure",
    };
    return statusMap[normalized] || "gray";
  };

  const formatStatus = (status) => {
    const normalized = String(status || "").toLowerCase();
    const statusMap = {
      menunggu: "Menunggu Verifikasi",
      pending: "Menunggu Verifikasi",
      diverifikasi: "Disetujui",
      approved: "Disetujui",
      ditolak: "Ditolak",
      rejected: "Ditolak",
      perbaikan: "Perlu Perbaikan",
      revision: "Perlu Perbaikan",
    };
    return statusMap[normalized] || status;
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Data Pengajuan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data pengajuan mahasiswa untuk pembersihan clearing
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Pengajuan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola data pengajuan mahasiswa untuk pembersihan clearing
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/4">
          <Select id="status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option>Semua status</option>
            <option>Menunggu Verifikasi</option>
            <option>Disetujui</option>
            <option>Perlu Perbaikan</option>
            <option>Ditolak</option>
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
                    <Badge color={getStatusColor(data.status)}>{formatStatus(data.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link to={`/detail-verifikasi/${data.id}`}>
                      <Button
                        size="xs"
                        className="rounded-full bg-[#F3F4FF] text-blue-700 hover:bg-blue-100 border-none px-4 py-1.5 font-medium"
                      >
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

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-700">
          Showing <span className="font-bold">{filteredData.length > 0 ? startIndex + 1 : 0}</span> to{" "}
          <span className="font-bold">{Math.min(endIndex, filteredData.length)}</span> of{" "}
          <span className="font-bold">{filteredData.length}</span> Entries
        </span>

        <div className="flex gap-2">
          <Button
            size="xs"
            color="gray"
            className="bg-gray-100 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>

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