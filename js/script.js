/* ========================================
   GLOBAL FUNCTIONS
   File ini berisi fungsi-fungsi yang dipakai 
   di semua halaman (login, register, dashboard)
   ======================================== */

// ========================================
// TOGGLE PASSWORD VISIBILITY
// ========================================
/**
 * Fungsi untuk show/hide password
 * @param {string} inputId - ID dari input password
 */
function togglePassword(inputId) {
    // Ambil element input berdasarkan ID
    const input = document.getElementById(inputId);
    
    // Toggle tipe input antara 'password' dan 'text'
    // Jika sekarang 'password', ubah jadi 'text' (keliatan)
    // Jika sekarang 'text', ubah jadi 'password' (tersembunyi)
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}


// ========================================
// ALERT FUNCTIONS
// ========================================
/**
 * Fungsi untuk menampilkan alert message
 * @param {string} message - Pesan yang mau ditampilkan
 * @param {string} type - Tipe alert: 'success' atau 'error'
 */
function showAlert(message, type) {
    // Ambil element alert box
    const alertBox = document.getElementById('alertBox');
    
    // Set text pesan
    alertBox.textContent = message;
    
    // Set class berdasarkan tipe (success = hijau, error = merah)
    alertBox.className = `alert alert-${type} show`;
    
    // Auto hide setelah 5 detik
    setTimeout(() => {
        hideAlert();
    }, 5000);
}

/**
 * Fungsi untuk menyembunyikan alert
 */
function hideAlert() {
    const alertBox = document.getElementById('alertBox');
    alertBox.classList.remove('show');
}


// ========================================
// LOCALSTORAGE HELPER FUNCTIONS
// ========================================
/**
 * Fungsi untuk ambil semua user dari localStorage
 * @returns {Array} Array berisi semua user yang terdaftar
 */
function getUsers() {
    // Ambil data users dari localStorage
    // Jika tidak ada, return array kosong []
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

/**
 * Fungsi untuk simpan array users ke localStorage
 * @param {Array} users - Array user yang mau disimpan
 */
function saveUsers(users) {
    // Convert array ke string JSON dan simpan
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * Fungsi untuk ambil data user yang sedang login
 * @returns {Object|null} Data user atau null jika belum login
 */
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

/**
 * Fungsi untuk simpan data user yang sedang login
 * @param {Object} user - Data user yang login
 */
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Fungsi untuk hapus data user yang sedang login (logout)
 */
function removeCurrentUser() {
    localStorage.removeItem('currentUser');
}


// ========================================
// VALIDATION FUNCTIONS
// ========================================
/**
 * Fungsi untuk validasi email format
 * @param {string} email - Email yang mau divalidasi
 * @returns {boolean} True jika format email benar
 */
function isValidEmail(email) {
    // Regex pattern untuk validasi email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

/**
 * Fungsi untuk validasi nomor telepon (Indonesia)
 * @param {string} phone - Nomor telepon yang mau divalidasi
 * @returns {boolean} True jika format nomor benar
 */
function isValidPhone(phone) {
    // Nomor harus diawali 08 dan minimal 10 digit
    const phonePattern = /^08[0-9]{8,11}$/;
    return phonePattern.test(phone);
}

/**
 * Fungsi untuk validasi password
 * @param {string} password - Password yang mau divalidasi
 * @returns {Object} Object berisi valid (true/false) dan message
 */
function validatePassword(password) {
    // Password minimal 6 karakter
    if (password.length < 6) {
        return {
            valid: false,
            message: 'Password minimal 6 karakter'
        };
    }
    
    // Bisa ditambah validasi lain seperti:
    // - Harus ada huruf besar
    // - Harus ada angka
    // - Harus ada karakter spesial
    // dll
    
    return {
        valid: true,
        message: 'Password valid'
    };
}


// ========================================
// FORMAT HELPER FUNCTIONS
// ========================================
/**
 * Fungsi untuk format angka ke format Rupiah
 * @param {number} number - Angka yang mau diformat
 * @returns {string} Angka dalam format Rupiah (ex: Rp 750.000)
 */
function formatRupiah(number) {
    return 'Rp ' + number.toLocaleString('id-ID');
}

/**
 * Fungsi untuk format tanggal ke format Indonesia
 * @param {Date} date - Object Date
 * @returns {string} Tanggal dalam format Indonesia
 */
function formatDate(date) {
    return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}


// ========================================
// DEBUG FUNCTIONS (untuk testing)
// ========================================
/**
 * Fungsi untuk reset semua data (hapus semua user dan logout)
 * Berguna untuk testing
 */
function resetAllData() {
    if (confirm('Yakin ingin menghapus semua data? (untuk testing)')) {
        localStorage.clear(); // Hapus semua data di localStorage
        alert('Semua data telah dihapus!');
        window.location.reload(); // Reload halaman
    }
}

/**
 * Fungsi untuk lihat semua user yang terdaftar (console)
 * Berguna untuk debugging
 */
function showAllUsers() {
    const users = getUsers();
    console.table(users); // Tampilkan dalam bentuk tabel di console
}


// ========================================
// UTILITY FUNCTIONS
// ========================================
/**
 * Fungsi untuk generate ID unik
 * @returns {string} ID unik berdasarkan timestamp
 */
function generateId() {
    return Date.now().toString();
}

/**
 * Fungsi untuk sanitize input (bersihkan dari karakter berbahaya)
 * @param {string} input - String yang mau dibersihkan
 * @returns {string} String yang sudah aman
 */
function sanitizeInput(input) {
    // Hapus karakter HTML untuk mencegah XSS attack
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}


// ========================================
// CONSOLE INFO
// ========================================
// Pesan di console saat script loaded
console.log('%c🎫 EventKu Ticketing System', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cDeveloped for PKL Project', 'color: #666; font-size: 12px;');
console.log('');
console.log('Available debug commands:');
console.log('- resetAllData()    : Hapus semua data');
console.log('- showAllUsers()    : Lihat semua user terdaftar');
console.log('- getCurrentUser()  : Lihat user yang sedang login');


// ========================================
// NOTES UNTUK DEVELOPER
// ========================================
/*
STRUKTUR DATA USER:
{
    id: "timestamp",
    name: "Nama Lengkap",
    email: "email@example.com",
    phone: "08123456789",
    password: "password123",
    registeredAt: "23/12/2024 10:30:00"
}

STRUKTUR DATA EVENT:
{
    id: 1,
    title: "Nama Event",
    date: "15-17 Maret 2025",
    location: "Lokasi Event",
    price: 750000,
    icon: "🎵"
}

LOCALSTORAGE KEYS:
- users          : Array semua user yang terdaftar
- currentUser    : Object user yang sedang login

FLOW APLIKASI:
1. User buka index.html (login page)
2. Jika belum punya akun, klik link ke register.html
3. Setelah register, redirect ke index.html untuk login
4. Setelah login, redirect ke dashboard.html
5. Di dashboard bisa pilih event dan pesan tiket
6. Klik logout untuk keluar dan kembali ke index.html
*/