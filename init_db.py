import sqlite3

def init_db():
    conn = sqlite3.connect('mahasiswa.db')
    cursor = conn.cursor()
    
    # Membuat tabel sesuai spesifikasi soal UTS
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mahasiswa (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nim INTEGER UNIQUE NOT NULL,
            nama TEXT NOT NULL,
            program_studi TEXT NOT NULL,
            angkatan INTEGER NOT NULL,
            ipk REAL NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database mahasiswa.db dan tabel berhasil dibuat!")

if __name__ == '__main__':
    init_db()
