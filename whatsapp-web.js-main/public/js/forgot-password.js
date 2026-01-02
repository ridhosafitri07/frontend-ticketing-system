// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// State management
let currentStep = 1;
let userPhoneNumber = '';
let countdown;
let timeLeft = 300; // 5 menit

// DOM Elements
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const alertBox = document.getElementById('alertBox');
const loadingBox = document.getElementById('loadingBox');

// Forms
const phoneForm = document.getElementById('phoneForm');
const otpForm = document.getElementById('otpForm');
const resetForm = document.getElementById('resetForm');

// Inputs
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phoneNumber');
const otpInputs = document.querySelectorAll('.otp-input');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Buttons
const resendBtn = document.getElementById('resendBtn');

// ===== UTILITY FUNCTIONS =====

function showAlert(message, type = 'info') {
    alertBox.className = `alert alert-${type} show`;
    alertBox.textContent = message;
    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 5000);
}

function showLoading(show = true) {
    loadingBox.classList.toggle('show', show);
}

function goToStep(step) {
    step1.classList.remove('active');
    step2.classList.remove('active');
    step3.classList.remove('active');

    if (step === 1) step1.classList.add('active');
    else if (step === 2) step2.classList.add('active');
    else if (step === 3) step3.classList.add('active');

    currentStep = step;
}

function formatPhoneNumber(phone) {
    // Hapus semua karakter non-digit
    phone = phone.replace(/\D/g, '');
    
    // Jika diawali 0, ganti dengan 62
    if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
    }
    
    // Pastikan diawali 62
    if (!phone.startsWith('62')) {
        phone = '62' + phone;
    }
    
    return phone;
}

function normalizePhoneNumber(phone) {
    // Normalisasi untuk matching
    // Hapus semua non-digit dan awalan 0/62
    phone = phone.replace(/\D/g, '');
    
    // Hapus awalan 62
    if (phone.startsWith('62')) {
        phone = phone.substring(2);
    }
    
    // Hapus awalan 0
    if (phone.startsWith('0')) {
        phone = phone.substring(1);
    }
    
    return phone; // Return: 8123456789
}

function startCountdown() {
    timeLeft = 300; // Reset to 5 menit
    resendBtn.disabled = true;
    
    countdown = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('countdown').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            document.getElementById('countdown').textContent = 'Expired';
            resendBtn.disabled = false;
            showAlert('Kode OTP sudah kadaluarsa. Silakan kirim ulang.', 'error');
        }
    }, 1000);
}

// ===== OTP INPUT HANDLING =====

otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Hanya terima angka
        if (!/^\d$/.test(value)) {
            e.target.value = '';
            return;
        }
        
        // Auto-focus ke input selanjutnya
        if (value && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        // Backspace - pindah ke input sebelumnya
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            otpInputs[index - 1].focus();
        }
    });

    // Paste handling
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/\D/g, '').split('');
        
        digits.forEach((digit, i) => {
            if (index + i < otpInputs.length) {
                otpInputs[index + i].value = digit;
            }
        });
        
        // Focus ke input terakhir yang diisi
        const lastIndex = Math.min(index + digits.length - 1, otpInputs.length - 1);
        otpInputs[lastIndex].focus();
    });
});

// ===== STEP 1: KIRIM OTP =====

phoneForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const phone = formatPhoneNumber(phoneInput.value);
    
    if (!name || !phone) {
        showAlert('Nama dan nomor telepon harus diisi', 'error');
        return;
    }

    if (phone.length < 10) {
        showAlert('Nomor telepon tidak valid', 'error');
        return;
    }

    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: phone,
                name: name
            })
        });

        const data = await response.json();
        showLoading(false);

        if (data.success) {
            userPhoneNumber = phone;
            showAlert(data.message, 'success');
            goToStep(2);
            startCountdown();
        } else {
            showAlert(data.message || 'Gagal mengirim OTP', 'error');
        }

    } catch (error) {
        showLoading(false);
        console.error('Error:', error);
        showAlert('Terjadi kesalahan. Pastikan server sudah berjalan.', 'error');
    }
});

// ===== STEP 2: VERIFIKASI OTP =====

otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Gabungkan semua digit OTP
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    
    if (otp.length !== 6) {
        showAlert('Masukkan kode OTP lengkap (6 digit)', 'error');
        return;
    }

    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: userPhoneNumber,
                otp: otp
            })
        });

        const data = await response.json();
        showLoading(false);

        if (data.success) {
            clearInterval(countdown);
            showAlert(data.message, 'success');
            setTimeout(() => {
                goToStep(3);
            }, 1000);
        } else {
            showAlert(data.message || 'Kode OTP salah', 'error');
            // Clear OTP inputs
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        }

    } catch (error) {
        showLoading(false);
        console.error('Error:', error);
        showAlert('Terjadi kesalahan saat verifikasi OTP', 'error');
    }
});

// Resend OTP
resendBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: userPhoneNumber,
                name: name
            })
        });

        const data = await response.json();
        showLoading(false);

        if (data.success) {
            showAlert('Kode OTP baru telah dikirim', 'success');
            // Clear OTP inputs
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
            startCountdown();
        } else {
            showAlert(data.message || 'Gagal mengirim ulang OTP', 'error');
        }

    } catch (error) {
        showLoading(false);
        console.error('Error:', error);
        showAlert('Terjadi kesalahan saat mengirim ulang OTP', 'error');
    }
});

// ===== STEP 3: RESET PASSWORD =====

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword.length < 6) {
        showAlert('Password minimal 6 karakter', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showAlert('Password tidak sama', 'error');
        return;
    }

    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: userPhoneNumber,
                newPassword: newPassword
            })
        });

        const data = await response.json();

        if (data.success) {
            // Update password di localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Normalisasi nomor HP untuk matching
            const normalizedSearchPhone = normalizePhoneNumber(userPhoneNumber);
            
            // Cari user berdasarkan nomor HP
            const userIndex = users.findIndex(u => {
                if (!u.phone) return false;
                
                // Normalisasi nomor HP dari database
                const normalizedUserPhone = normalizePhoneNumber(u.phone);
                
                // Match berdasarkan nomor yang sudah dinormalisasi
                return normalizedUserPhone === normalizedSearchPhone;
            });

            if (userIndex !== -1) {
                // Update password user
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                
                showLoading(false);
                showAlert('✅ Password berhasil direset! Redirecting...', 'success');
                
                // Redirect ke halaman login setelah 2 detik
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showLoading(false);
                showAlert('⚠️ Nomor HP tidak terdaftar. Pastikan menggunakan nomor yang sama saat registrasi.', 'error');
                console.error('User tidak ditemukan dengan HP:', userPhoneNumber);
                console.log('Registered users:', users.map(u => ({ email: u.email, phone: u.phone })));
            }
        } else {
            showLoading(false);
            showAlert(data.message || 'Gagal reset password', 'error');
        }

    } catch (error) {
        showLoading(false);
        console.error('Error:', error);
        showAlert('Terjadi kesalahan saat reset password', 'error');
    }
});

// Check server status on page load
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        const data = await response.json();
        
        if (!data.success || data.whatsapp !== 'connected') {
            showAlert('Server WhatsApp belum siap. Hubungi administrator.', 'error');
        }
    } catch (error) {
        console.warn('Tidak dapat mengecek status server:', error);
        showAlert('Pastikan server API sudah berjalan di http://localhost:3000', 'error');
    }
});
