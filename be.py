from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app) # Mengizinkan Frontend terhubung ke Backend ini

def get_db_connection():
    conn = sqlite3.connect('mahasiswa.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/mahasiswa', methods=['GET', 'POST'])
def kelola_mahasiswa():
    conn = get_db_connection()
    cursor = conn.cursor()

    # GET: Mengambil seluruh data mahasiswa
    if request.method == 'GET':
        cursor.execute('SELECT * FROM mahasiswa')
        mahasiswa_list = cursor.fetchall()
        
        hasil = []
        tahun_sekarang = datetime.now().year
        
        for mhs in mahasiswa_list:
            mhs_dict = dict(mhs)
            # Menghitung Lama Studi = Tahun Sekarang - Angkatan
            mhs_dict['lama_studi'] = tahun_sekarang - mhs_dict['angkatan']
            hasil.append(mhs_dict)
            
        conn.close()
        return jsonify(hasil)

    # POST: Menambah mahasiswa baru
    if request.method == 'POST':
        data = request.json or {}
        nim = data.get('nim')
        nama = data.get('nama')
        prodi = data.get('program_studi')
        angkatan = data.get('angkatan')
        ipk = data.get('ipk')

        # Validasi 1: Field tidak boleh kosong
        if not all([nim, nama, prodi, angkatan, ipk]):
            return jsonify({'error': 'Semua field wajib diisi!'}), 400

        # Validasi 2: Rentang IPK 0.00 - 4.00
        try:
            ipk_float = float(ipk)
            if not (0.00 <= ipk_float <= 4.00):
                return jsonify({'error': 'IPK harus berada dalam rentang 0.00 hingga 4.00!'}), 400
        except ValueError:
            return jsonify({'error': 'IPK harus berupa angka!'}), 400

        # Simpan ke Database
        try:
            cursor.execute(
                'INSERT INTO mahasiswa (nim, nama, program_studi, angkatan, ipk) VALUES (?, ?, ?, ?, ?)',
                (int(nim), str(nama), str(prodi), int(angkatan), ipk_float)
            )
            conn.commit()
            return jsonify({'message': 'Mahasiswa berhasil ditambahkan!'}), 201
        except sqlite3.IntegrityError:
            # Validasi 3: NIM Unik
            return jsonify({'error': f'NIM {nim} sudah terdaftar!'}), 400
        finally:
            conn.close()

@app.route('/api/mahasiswa/<int:id>', methods=['PUT', 'DELETE'])
def kelola_mahasiswa_detail(id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # PUT: Mengubah data mahasiswa
    if request.method == 'PUT':
        data = request.json or {}
        
        try:
            ipk_float = float(data.get('ipk', 0))
            if not (0.00 <= ipk_float <= 4.00):
                return jsonify({'error': 'IPK harus berada dalam rentang 0.00 hingga 4.00!'}), 400
        except ValueError:
            return jsonify({'error': 'IPK harus berupa angka!'}), 400

        try:
            cursor.execute(
                'UPDATE mahasiswa SET nim = ?, nama = ?, program_studi = ?, angkatan = ?, ipk = ? WHERE id = ?',
                (int(data['nim']), str(data['nama']), str(data['program_studi']), int(data['angkatan']), ipk_float, id)
            )
            conn.commit()
            return jsonify({'message': 'Data mahasiswa berhasil diperbarui!'})
        except sqlite3.IntegrityError:
            return jsonify({'error': 'NIM sudah digunakan oleh mahasiswa lain!'}), 400
        finally:
            conn.close()

    # DELETE: Menghapus mahasiswa
    if request.method == 'DELETE':
        cursor.execute('DELETE FROM mahasiswa WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Data mahasiswa berhasil dihapus!'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
