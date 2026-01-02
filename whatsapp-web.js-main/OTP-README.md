# WhatsApp OTP untuk Forgot Password

Sistem forgot password dengan OTP yang dikirim via WhatsApp menggunakan whatsapp-web.js.

## 📋 Arsitektur

```
Web Ticketing (Frontend)          WhatsApp API Server (Backend)
┌─────────────────────┐           ┌──────────────────────────┐
│                     │           │                          │
│  forgot-password    │  HTTP     │    otp-server.js         │
│  .html + .js        │ ────────> │    (Express API)         │
│                     │  Request  │                          │
│                     │           │  ┌────────────────────┐  │
│  1. Input HP        │           │  │ WhatsApp Client    │  │
│  2. Verifikasi OTP  │           │  │ (whatsapp-web.js)  │  │
│  3. Reset Password  │           │  └────────────────────┘  │
│                     │           │           │              │
└─────────────────────┘           └───────────┼──────────────┘
                                              │
                                              ▼
                                    WhatsApp User (HP)
```

## 🚀 Cara Menjalankan

### 1. Jalankan WhatsApp OTP Server

```bash
# Buka terminal di folder whatsapp-web.js-main
cd "D:\PROJECT PKL\whatsapp-web.js-main"

# Jalankan server
node otp-server.js
```

**Output yang diharapkan:**
```
Menginisialisasi WhatsApp Client...

=== OTP SERVER ===
Server berjalan di http://localhost:3000

Endpoints:
POST /api/send-otp      - Kirim OTP
POST /api/verify-otp    - Verifikasi OTP
POST /api/reset-password - Reset password
GET  /api/status        - Cek status server

=== SCAN QR CODE DENGAN WHATSAPP ===
QR Code: [QR code muncul]

Buka WhatsApp > Perangkat Tertaut > Scan QR
```

### 2. Scan QR Code

- Buka WhatsApp di HP
- Klik **Perangkat Tertaut** atau **Linked Devices**
- Scan QR Code yang muncul di terminal

### 3. Tunggu Sampai Siap

Setelah scan, tunggu sampai muncul:
```
✓ WhatsApp berhasil terautentikasi
✓ WhatsApp Client siap!
✓ API Server berjalan di http://localhost:3000
```

### 4. Buka Web Ticketing

- Buka browser
- Akses: `file:///D:/PROJECT%20PKL/web_ticketing/forgot-password.html`
- Atau buka `forgot-password.html` dari file explorer

## 📝 Cara Menggunakan

### Flow Lengkap:

**1. Halaman Login → Klik "Lupa Password"**

Update file `index.html` untuk tambah link:
```html
<a href="forgot-password.html">Lupa Password?</a>
```

**2. Input Nomor WhatsApp**
- Masukkan nama
- Masukkan nomor HP (format: 08xxx atau 628xxx)
- Klik "Kirim Kode OTP"

**3. Cek WhatsApp di HP**
- Pesan OTP masuk otomatis
- Format: "Kode OTP: 123456"
- Berlaku 5 menit

**4. Input Kode OTP**
- Ketik 6 digit OTP
- Auto-focus antar input
- Support paste dari clipboard

**5. Reset Password**
- Input password baru (min 6 karakter)
- Konfirmasi password
- Klik "Reset Password"

**6. Redirect ke Login**
- Otomatis redirect ke halaman login
- Login dengan password baru

## 🔧 API Endpoints

### 1. Kirim OTP
```
POST http://localhost:3000/api/send-otp

Body:
{
  "phoneNumber": "628123456789",
  "name": "John Doe"
}

Response:
{
  "success": true,
  "message": "Kode OTP berhasil dikirim ke WhatsApp Anda",
  "expiresIn": 300
}
```

### 2. Verifikasi OTP
```
POST http://localhost:3000/api/verify-otp

Body:
{
  "phoneNumber": "628123456789",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "Kode OTP berhasil diverifikasi",
  "verified": true
}
```

### 3. Reset Password
```
POST http://localhost:3000/api/reset-password

Body:
{
  "phoneNumber": "628123456789",
  "newPassword": "newpass123"
}

Response:
{
  "success": true,
  "message": "Password berhasil direset"
}
```

### 4. Check Status
```
GET http://localhost:3000/api/status

Response:
{
  "success": true,
  "server": "running",
  "whatsapp": "connected",
  "activeOTPs": 2
}
```

## 📁 File Structure

```
D:\PROJECT PKL\
│
├── web_ticketing\               ← Frontend
│   ├── forgot-password.html     ← Halaman forgot password (BARU)
│   └── js\
│       └── forgot-password.js   ← Logic forgot password (BARU)
│
└── whatsapp-web.js-main\        ← Backend API
    ├── otp-server.js            ← Express server untuk OTP (BARU)
    ├── index.js                 ← WhatsApp client library
    └── package.json
```

## ⚙️ Konfigurasi

### Ubah Waktu Expired OTP

Edit `otp-server.js` baris 54:
```javascript
// Default: 5 menit
const expiryTime = Date.now() + (5 * 60 * 1000);

// Ubah jadi 10 menit:
const expiryTime = Date.now() + (10 * 60 * 1000);
```

### Ubah Template Pesan OTP

Edit `otp-server.js` baris 63-71:
```javascript
const message = `Custom template Anda disini...
Kode: ${otp}`;
```

### Ubah Port Server

Edit `otp-server.js` baris 7:
```javascript
const PORT = 3000; // Ganti sesuai kebutuhan
```

Jangan lupa update di `forgot-password.js` baris 2:
```javascript
const API_BASE_URL = 'http://localhost:0701/api';
```

## 🔒 Keamanan

### Current Implementation (Basic):
- ✓ OTP 6 digit random
- ✓ Expired setelah 5 menit
- ✓ Auto-delete OTP setelah digunakan
- ✓ Rate limiting via delay WhatsApp

### Recommended untuk Production:
- [ ] Rate limiting API (max 3 request/menit per nomor)
- [ ] CAPTCHA sebelum kirim OTP
- [ ] Simpan OTP di database (Redis/MongoDB)
- [ ] Hash password sebelum simpan
- [ ] HTTPS untuk API
- [ ] JWT token untuk session
- [ ] Logging aktivitas

## 🐛 Troubleshooting

### 1. Server tidak bisa connect

**Error:** `ECONNREFUSED localhost:3000`

**Solusi:**
- Pastikan server sudah jalan: `node otp-server.js`
- Cek port tidak dipakai aplikasi lain

### 2. OTP tidak terkirim

**Error:** `Error: No LID for user`

**Solusi:**
- Nomor tidak terdaftar di WhatsApp
- Format nomor salah (harus 628xxx)
- WhatsApp belum scan QR / disconnect

### 3. QR Code tidak muncul

**Solusi:**
- Restart server
- Hapus folder `.wwebjs_auth/`
- Scan ulang

### 4. Session expired

**Solusi:**
- Scan ulang QR Code
- Session otomatis tersimpan, tidak perlu scan tiap restart

### 5. CORS Error di browser

**Solusi:**
- Pastikan server sudah install `cors`
- Restart server setelah install

## 📊 Testing dengan Postman

### Test Send OTP:
```
POST http://localhost:3000/api/send-otp
Headers: Content-Type: application/json
Body (raw JSON):
{
  "phoneNumber": "628123456789",
  "name": "Test User"
}
```

### Test Verify OTP:
```
POST http://localhost:3000/api/verify-otp
Headers: Content-Type: application/json
Body (raw JSON):
{
  "phoneNumber": "628123456789",
  "otp": "123456"
}
```

## 🎯 Next Steps (Integrasi Database)

Saat ini OTP disimpan di **memory (Map)**. Untuk production, integrasikan dengan database:

### Contoh dengan MongoDB:
```javascript
// Install: npm install mongodb

const otpCollection = db.collection('otps');

// Simpan OTP
await otpCollection.insertOne({
    phoneNumber: phoneNumber,
    otp: otp,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    verified: false
});

// Verifikasi OTP
const otpDoc = await otpCollection.findOne({
    phoneNumber: phoneNumber,
    otp: otp,
    expiresAt: { $gt: new Date() }
});
```

## 📞 Support

Jika ada masalah:
1. Cek log di terminal server
2. Cek console browser (F12)
3. Cek WhatsApp Web masih connect
4. Restart server kalau perlu

---

**Dibuat untuk project PKL Web Ticketing**
**Last updated: 30 Desember 2025**
