# Information Board — Panduan Lengkap

Panduan lengkap untuk menjalankan proyek ini di komputer lokal dan meng-upload ke hosting Anda sendiri menggunakan database PostgreSQL.

---

## Daftar Isi

1. [Persiapan](#1-persiapan)
2. [Menjalankan di Komputer Lokal](#2-menjalankan-di-komputer-lokal)
3. [Menjalankan di Production / Hosting](#3-menjalankan-di-production--hosting)
4. [File yang Perlu Disertakan](#4-file-yang-perlu-disertakan)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Persiapan

### Yang perlu di-install di komputer Anda:

| Software | Versi Minimum | Download |
|----------|--------------|----------|
| Node.js | v18 atau lebih baru | https://nodejs.org |
| PostgreSQL | v14 atau lebih baru | https://www.postgresql.org/download/ |
| Git | versi terbaru | https://git-scm.com |

### Cek instalasi:
```bash
node --version       # harus v18+
psql --version       # harus v14+
git --version
```

---

## 2. Menjalankan di Komputer Lokal

### Langkah 1: Install PostgreSQL (jika belum)

Saat install PostgreSQL, Anda akan diminta membuat password untuk user `postgres`. **Ingat password ini** — Anda akan membutuhkannya untuk konfigurasi.

### Langkah 2: Buat Database

Buka **pgAdmin** (GUI) atau **psql** (terminal):

**Menggunakan pgAdmin:**
1. Buka pgAdmin
2. Klik kanan pada "Databases" → "Create" → "Database"
3. Nama database: `infoboard`
4. Klik "Save"

**Menggunakan psql (terminal):**
```bash
psql -U postgres
```
```sql
CREATE DATABASE infoboard;
\q
```

### Langkah 3: Buat Tabel Database

Jalankan file SQL yang sudah disediakan:

```bash
psql -U postgres -d infoboard -f database/setup.sql
```

Atau melalui pgAdmin:
1. Buka pgAdmin → pilih database `infoboard`
2. Klik "Query Tool"
3. Buka file `database/setup.sql`
4. Klik "Execute" (tombol play)

File ini akan membuat semua tabel yang dibutuhkan:
- `users` — untuk login admin
- `board_content` — konten slider utama
- `running_text` — teks berjalan di bawah
- `sidebar_content` — konten 4 sidebar
- `panel_settings` — judul custom sidebar

### Langkah 4: Konfigurasi Environment

File `.env` sudah ada dengan konfigurasi default. **Ubah password PostgreSQL** sesuai dengan yang Anda buat:

```env
# .env
DATABASE_URL=postgresql://postgres:PASSWORD_ANDA@localhost:5432/infoboard
JWT_SECRET=ubah-ini-dengan-string-acak-yang-panjang
NODE_ENV=development
```

**Generate JWT_SECRET yang aman:**
```bash
openssl rand -base64 32
``` 

### Langkah 5: Install Dependencies

```bash
npm install
```

### Langkah 6: Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di:
- **Display TV:** http://localhost:3000
- **Login Admin:** http://localhost:3000/login
- **Register Admin:** http://localhost:3000/register

### Langkah 7: Buat Akun Admin Pertama

1. Buka http://localhost:3000/register
2. Isi nama, email, dan password
3. Klik "Create Account"
4. Anda akan otomatis masuk ke dashboard admin

Setelah ada akun admin pertama, Anda bisa membuat admin lain melalui menu "Users" di dashboard.

---

## 3. Menjalankan di Production / Hosting

### Pilihan Hosting yang Direkomendasikan

| Hosting | Tipe | Harga | Cocok untuk |
|--------|------|-------|-------------|
| **Render** | Full-stack | Gratis mulai | Paling mudah, ada PostgreSQL gratis |
| **Railway** | Full-stack | $5/bulan | Mudah, PostgreSQL terintegrasi |
| **DigitalOcean** | VPS | $4/bulan | Kontrol penuh, install sendiri |
| **VPS (any)** | VPS | bervariasi | Kontrol penuh |

### Opsi A: Deploy ke Render (Paling Mudah)

#### A1. Push ke GitHub
```bash
git init
git add .
git commit -m "Information Board"
git remote add origin https://github.com/USERNAME/infoboard.git
git push -u origin main
```

#### A2. Buat PostgreSQL Database di Render
1. Buka https://render.com → buat akun
2. Klik "New" → "PostgreSQL"
3. Nama: `infoboard-db`
4. Klik "Create Database"
5. **Catat "Internal Database URL"** — Anda akan membutuhkannya

#### A3. Buat Web Service di Render
1. Klik "New" → "Web Service"
2. Hubungkan repository GitHub Anda
3. Settings:
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Environment Variables:
   ```
   DATABASE_URL=<paste Internal Database URL dari Render>
   JWT_SECRET=<generate dengan openssl rand -base64 32>
   NODE_ENV=production
   PGSSL=true
   ```
5. Klik "Create Web Service"

#### A4. Jalankan Migration di Database Production

Buka "Shell" tab di database Render Anda, lalu jalankan:

```sql
-- Copy paste isi file database/setup.sql di sini
```

Atau jika Render menyediakan psql access:
```bash
psql "<External Database URL>" -f database/setup.sql
```

#### A5. Buat Akun Admin Pertama
1. Buka URL aplikasi Anda (misal: https://infoboard.onrender.com/register)
2. Daftar akun admin pertama
3. Selesai!

### Opsi B: Deploy ke VPS (DigitalOcean / VPS Sendiri)

#### B1. Siapkan VPS
```bash
# Connect ke VPS via SSH
ssh root@IP_VPS_ANDA

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Install PM2 (untuk menjalankan aplikasi secara background)
npm install -g pm2

# Install Nginx (reverse proxy)
apt-get install -y nginx
```

#### B2. Setup Database di VPS
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE infoboard;
CREATE USER infoboard_user WITH ENCRYPTED PASSWORD 'password_aman_disini';
GRANT ALL PRIVILEGES ON DATABASE infoboard TO infoboard_user;
\q
```

#### B3. Clone dan Build Aplikasi
```bash
cd /var/www
git clone https://github.com/USERNAME/infoboard.git
cd infoboard
npm install
npm run build
```

#### B4. Konfigurasi Environment
```bash
nano .env
```
```env
DATABASE_URL=postgresql://infoboard_user:password_aman_disini@localhost:5432/infoboard
JWT_SECRET=string_acak_yang_sangat_panjang_disini
NODE_ENV=production
PGSSL=false
```

#### B5. Jalankan Migration
```bash
psql -U infoboard_user -d infoboard -f database/setup.sql
```

#### B6. Jalankan dengan PM2
```bash
pm2 start npm --name "infoboard" -- start
pm2 save
pm2 startup
```

#### B7. Konfigurasi Nginx
```bash
nano /etc/nginx/sites-available/infoboard
```
```nginx
server {
    listen 80;
    server_name domain-anda.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
ln -s /etc/nginx/sites-available/infoboard /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### B8. (Opsional) Install SSL dengan Certbot
```bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d domain-anda.com
```

---

## 4. File yang Perlu Disertakan

### File yang WAJIB di-upload ke hosting:

```
project/
├── app/                          # Semua kode aplikasi
│   ├── api/                      # API routes (backend)
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── register/route.ts
│   │   ├── board-content/
│   │   │   ├── route.ts
│   │   │   └── reorder/route.ts
│   │   ├── panel-settings/route.ts
│   │   ├── running-text/route.ts
│   │   ├── sidebar-content/
│   │   │   ├── route.ts
│   │   │   └── reorder/route.ts
│   │   └── users/route.ts
│   ├── admin/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                   # Semua komponen UI
│   ├── admin/
│   ├── display/
│   └── ui/
├── lib/                          # Library dan utility
│   ├── auth.ts                   # Sistem auth (JWT)
│   ├── auth-client.tsx           # Auth context untuk browser
│   ├── db.ts                     # Koneksi PostgreSQL
│   ├── types.ts
│   └── utils.ts
├── hooks/
│   └── use-toast.ts
├── database/
│   └── setup.sql                 # File SQL untuk buat tabel
├── public/
│   └── uploads/                  # Folder upload file (auto-created)
├── package.json
├── package-lock.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── components.json
├── .env.example                  # Template konfigurasi
└── .gitignore
```

### File yang TIDAK perlu di-upload:

```
node_modules/          # Di-install otomatis oleh hosting
.next/                 # Di-generate saat build
.env                   # Di-set via environment variables di hosting
```

### File yang perlu di-create di hosting:

```
.env                   # Dari .env.example, diisi nilai production
public/uploads/        # Auto-created saat upload pertama kali
```

---

## 5. Troubleshooting

### "Cannot connect to database"
- Cek PostgreSQL berjalan: `sudo systemctl status postgresql`
- Cek DATABASE_URL di `.env` sudah benar
- Cek password PostgreSQL sudah benar
- Untuk Render: gunakan "Internal Database URL" (bukan External)

### "JWT_SECRET error"
- Generate secret baru: `openssl rand -base64 32`
- Pastikan JWT_SECRET di `.env` sudah diisi

### "Upload file tidak berhasil"
- Pastikan folder `public/uploads/` ada dan bisa ditulis
- Di VPS: `mkdir -p public/uploads && chmod 755 public/uploads`

### "Login gagal setelah deploy"
- Pastikan sudah menjalankan `database/setup.sql` di database production
- Pastikan sudah register akun admin pertama via halaman `/register`

### "Port 3000 sudah digunakan"
- Ubah port: `npm run dev -- -p 3001`
- Atau kill process: `lsof -ti:3000 | xargs kill -9`

### "psql command not found"
- Linux: `sudo apt-get install postgresql-client`
- Mac: `brew install libpq && export PATH="/opt/homebrew/opt/libpq/bin:$PATH"`
- Windows: PostgreSQL installer sudah menyertakan psql

---

## Ringkasan Cepat (Quick Start)

```bash
# 1. Install dependencies
npm install

# 2. Buat database di PostgreSQL
psql -U postgres -d infoboard -f database/setup.sql

# 3. Edit .env dengan password PostgreSQL Anda
# 4. Jalankan
npm run dev

# 5. Buka browser
# Display: http://localhost:3000
# Register admin: http://localhost:3000/register
```

<!-- salah commit -->
