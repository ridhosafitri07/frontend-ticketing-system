# 📁 Folder Images - Panduan Menambahkan Gambar Event

Folder ini untuk menyimpan **gambar poster/banner event** yang akan ditampilkan di dashboard.

---

## 🖼️ **Cara Menambahkan Gambar Event:**

### **1. Siapkan Gambar**
- Format: **JPG, PNG, atau WEBP**
- Ukuran rekomendasi: **800x600px** atau **1200x900px**
- Aspect ratio: **4:3** atau **16:9**
- File size: **< 500KB** (agar loading cepat)

### **2. Rename Gambar**
Beri nama file sesuai event, contoh:
- `java-jazz.jpg`
- `dewa19.jpg`
- `standup-comedy.jpg`
- `seminar-tech.jpg`
- `festival-kuliner.jpg`
- `theater-laskar.jpg`

### **3. Taruh di Folder Ini**
Copy/paste gambar ke folder:
```
D:\PROJECT PKL\web_ticketing\images\
```

### **4. Update Data Event**
Edit file `dashboard.html`, bagian data event (sekitar line 140):

```javascript
{
    id: 1,
    title: "Java Jazz Festival 2025",
    date: "15-17 Maret 2025",
    location: "JIExpo Kemayoran, Jakarta",
    price: 750000,
    category: "musik",
    icon: "🎵",
    image: "images/java-jazz.jpg"  // ← Path ke gambar kamu
}
```

### **5. Refresh Browser**
Tekan `Ctrl + F5` untuk reload halaman dan lihat hasilnya!

---

## 🎨 **Tips Gambar Bagus:**

✅ **DO:**
- Gunakan gambar berkualitas tinggi
- Crop gambar agar fokus pada event
- Compress gambar pakai tools online (TinyPNG, Squoosh)
- Gunakan aspect ratio konsisten (semua 4:3 atau semua 16:9)

❌ **DON'T:**
- Jangan pakai gambar terlalu besar (> 1MB)
- Jangan pakai gambar blur/pecah
- Jangan pakai screenshot dengan watermark

---

## 🔗 **Sumber Gambar Gratis:**

Kalau belum punya gambar, download di:
- **Unsplash**: https://unsplash.com
- **Pexels**: https://pexels.com
- **Pixabay**: https://pixabay.com
- **Freepik**: https://freepik.com (butuh akun)

Keyword pencarian:
- "concert poster"
- "music festival"
- "event banner"
- "comedy show"
- "seminar technology"

---

## 📝 **Contoh Struktur File:**

```
images/
├── java-jazz.jpg          (poster Java Jazz)
├── dewa19.jpg             (poster Dewa 19)
├── standup-comedy.jpg     (poster Stand Up Comedy)
├── seminar-tech.jpg       (poster Seminar)
├── festival-kuliner.jpg   (poster Festival Kuliner)
├── theater-laskar.jpg     (poster Theater)
└── README.md              (file ini)
```

---

## 🐛 **Troubleshooting:**

**Gambar tidak muncul?**
1. Cek path gambar benar: `images/nama-file.jpg`
2. Cek nama file tidak ada spasi (pakai `-` atau `_`)
3. Cek extension file (.jpg bukan .JPG)
4. Refresh browser dengan `Ctrl + F5`

**Gambar muncul tapi rusak?**
1. Cek ukuran file tidak terlalu besar
2. Cek format gambar (JPG/PNG/WEBP)
3. Cek gambar tidak corrupt (buka manual di Windows)

**Gambar terlalu kecil/besar?**
- Sistem auto-crop dengan `object-fit: cover`
- Tidak perlu resize manual, tapi lebih baik jika aspect ratio sama

---

## ✨ **Fallback System:**

Jika gambar gagal load (file tidak ada/error), sistem otomatis tampilkan **icon emoji** sebagai fallback.

Jadi tenang, halaman tidak akan error meski gambar hilang! 😊

---

**Happy Coding!** 🚀
