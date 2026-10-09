import React, { useState, useEffect } from 'react';

const API_URL = 'http://127.0.0.1:5000/api/mahasiswa';

export default function StudentManagementApp() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    nim: '',
    nama: '',
    program_studi: '',
    angkatan: '',
    ipk: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // UI State
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Gagal mengambil data');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Gagal memuat data dari server. Pastikan backend Python sudah berjalan!' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Konversi tipe data sebelum dikirim ke backend
    const payload = {
      nim: parseInt(formData.nim),
      nama: formData.nama,
      program_studi: formData.program_studi,
      angkatan: parseInt(formData.angkatan),
      ipk: parseFloat(formData.ipk)
    };

    try {
      const url = isEditing ? `${API_URL}/${editId}` : API_URL;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        // Akan menangkap error dari backend (contoh: IPK salah, NIM duplikat)
        setMessage({ type: 'error', text: data.error });
        return;
      }

      setMessage({ type: 'success', text: data.message });
      resetForm();
      fetchStudents(); // Refresh tabel
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Koneksi ke server terputus.' });
    }
  };

  const handleEdit = (student) => {
    setFormData({
      nim: student.nim.toString(),
      nama: student.nama,
      program_studi: student.program_studi,
      angkatan: student.angkatan.toString(),
      ipk: student.ipk.toString()
    });
    setIsEditing(true);
    setEditId(student.id);
    setMessage({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus ${nama}?`)) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: data.message });
      fetchStudents();
      
      if (isEditing && editId === id) resetForm();
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Gagal menghapus data.' });
    }
  };

  const resetForm = () => {
    setFormData({ nim: '', nama: '', program_studi: '', angkatan: '', ipk: '' });
    setIsEditing(false);
    setEditId(null);
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">Sistem Manajemen Mahasiswa</h1>
          <p className="text-gray-500 mt-2">Terhubung ke Python Flask + SQLite</p>
        </header>

        {message.text && (
          <div className={`p-4 rounded-md font-medium ${message.type === 'error' ? 'bg-red-100 text-red-700 border-red-400' : 'bg-green-100 text-green-700 border-green-400'} border`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bagian Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {isEditing ? 'Ubah Data' : 'Tambah Mahasiswa'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                  <input required type="number" name="nim" value={formData.nim} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input required type="text" name="nama" value={formData.nama} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                  <input required type="text" name="program_studi" value={formData.program_studi} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Angkatan</label>
                    <input required type="number" name="angkatan" value={formData.angkatan} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IPK (0.0 - 4.0)</label>
                    <input required type="number" step="0.01" name="ipk" value={formData.ipk} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
                    {isEditing ? 'Simpan' : 'Tambah'}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={resetForm} className="bg-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 font-medium">Batal</button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Bagian Tabel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Daftar Mahasiswa</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">NIM</th>
                      <th className="px-6 py-3">Nama</th>
                      <th className="px-6 py-3">Prodi</th>
                      <th className="px-6 py-3 text-center">IPK</th>
                      <th className="px-6 py-3 text-center">Lama Studi</th>
                      <th className="px-6 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                       <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Memuat data dari database...</td></tr>
                    ) : students.length === 0 ? (
                      <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Belum ada data di database.</td></tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{student.nim}</td>
                          <td className="px-6 py-4">{student.nama}</td>
                          <td className="px-6 py-4">{student.program_studi}</td>
                          <td className="px-6 py-4 text-center font-medium">{Number(student.ipk).toFixed(2)}</td>
                          <td className="px-6 py-4 text-center">
                             {/* Lama studi sudah dihitung dari backend python! */}
                             <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">{student.lama_studi} Tahun</span>
                             <div className="text-xs text-gray-400 mt-1">Angk: {student.angkatan}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleEdit(student)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded">Edit</button>
                              <button onClick={() => handleDelete(student.id, student.nama)} className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded">Hapus</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}