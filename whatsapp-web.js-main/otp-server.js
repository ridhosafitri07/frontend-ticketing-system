const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('./index');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize WhatsApp Client
const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Storage untuk OTP (production: pakai database)
const otpStorage = new Map();

// WhatsApp Events
whatsappClient.on('qr', (qr) => {
    console.log('\n=== SCAN QR CODE DENGAN WHATSAPP ===');
    console.log('QR Code:', qr);
    console.log('\nBuka WhatsApp > Perangkat Tertaut > Scan QR\n');
});

whatsappClient.on('ready', () => {
    console.log('✓ WhatsApp Client siap!');
    console.log(`✓ API Server berjalan di http://localhost:${PORT}`);
});

whatsappClient.on('authenticated', () => {
    console.log('✓ WhatsApp berhasil terautentikasi');
});

whatsappClient.on('auth_failure', (msg) => {
    console.error('✗ Autentikasi gagal:', msg);
});

whatsappClient.on('disconnected', (reason) => {
    console.log('✗ WhatsApp terputus:', reason);
});

// Initialize WhatsApp
console.log('Menginisialisasi WhatsApp Client...');
whatsappClient.initialize();

// ===== API ENDPOINTS =====

// 1. Generate dan kirim OTP
app.post('/api/send-otp', async (req, res) => {
    try {
        const { phoneNumber, name } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Nomor telepon harus diisi'
            });
        }

        // Generate OTP 6 digit
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Format nomor WhatsApp
        const chatId = phoneNumber.replace(/[^0-9]/g, '') + '@c.us';
        
        // Simpan OTP dengan expiry 5 menit
        const expiryTime = Date.now() + (5 * 60 * 1000); // 5 menit
        otpStorage.set(phoneNumber, {
            otp: otp,
            expiry: expiryTime,
            verified: false
        });

        // Template pesan OTP
        const message = `Halo ${name || 'User'}! 👋

Kami menerima permintaan *reset password* untuk akun Anda.

🔐 *${otp}*

Kode ini *berlaku selama 5 menit*.
⚠️ Demi keamanan, jangan bagikan kode ini kepada siapa pun, termasuk pihak kami.

Salam,
Tim Web Ticketing `;

        // Kirim response dulu (agar Postman tidak hang)
        res.json({
            success: true,
            message: 'Kode OTP berhasil dikirim ke WhatsApp Anda',
            expiresIn: 300 // 5 menit dalam detik
        });

        // Kirim pesan WhatsApp di background (tidak pakai await di sini)
        whatsappClient.sendMessage(chatId, message)
            .then(() => {
                console.log(`✓ OTP dikirim ke ${phoneNumber}: ${otp}`);
            })
            .catch((error) => {
                console.error(`✗ Gagal kirim OTP ke ${phoneNumber}:`, error.message);
            });

        // Auto-cleanup OTP setelah 5 menit
        setTimeout(() => {
            otpStorage.delete(phoneNumber);
        }, 5 * 60 * 1000);

    } catch (error) {
        console.error('Error mengirim OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengirim OTP. Pastikan nomor WhatsApp aktif.',
            error: error.message
        });
    }
});

// 2. Verifikasi OTP
app.post('/api/verify-otp', (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Nomor telepon dan OTP harus diisi'
            });
        }

        // Cek apakah OTP ada
        const storedOtp = otpStorage.get(phoneNumber);

        if (!storedOtp) {
            return res.status(400).json({
                success: false,
                message: 'Kode OTP tidak ditemukan atau sudah expired'
            });
        }

        // Cek apakah OTP sudah expired
        if (Date.now() > storedOtp.expiry) {
            otpStorage.delete(phoneNumber);
            return res.status(400).json({
                success: false,
                message: 'Kode OTP sudah kadaluarsa. Silakan minta kode baru.'
            });
        }

        // Verifikasi OTP
        if (storedOtp.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Kode OTP salah'
            });
        }

        // Tandai sebagai verified
        storedOtp.verified = true;
        otpStorage.set(phoneNumber, storedOtp);

        console.log(`✓ OTP verified untuk ${phoneNumber}`);

        res.json({
            success: true,
            message: 'Kode OTP berhasil diverifikasi',
            verified: true
        });

    } catch (error) {
        console.error('Error verifikasi OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat verifikasi OTP',
            error: error.message
        });
    }
});

// 3. Reset Password (setelah OTP verified)
app.post('/api/reset-password', (req, res) => {
    try {
        const { phoneNumber, newPassword } = req.body;

        if (!phoneNumber || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Nomor telepon dan password baru harus diisi'
            });
        }

        // Cek apakah OTP sudah diverifikasi
        const storedOtp = otpStorage.get(phoneNumber);

        if (!storedOtp || !storedOtp.verified) {
            return res.status(400).json({
                success: false,
                message: 'Silakan verifikasi OTP terlebih dahulu'
            });
        }

        // Hapus OTP setelah berhasil reset
        otpStorage.delete(phoneNumber);

        // TODO: Update password di database
        console.log(`✓ Password reset untuk ${phoneNumber}`);

        res.json({
            success: true,
            message: 'Password berhasil direset'
        });

    } catch (error) {
        console.error('Error reset password:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal reset password',
            error: error.message
        });
    }
});

// 4. Check server status
app.get('/api/status', (req, res) => {
    const isWhatsAppReady = whatsappClient.info !== null;
    
    res.json({
        success: true,
        server: 'running',
        whatsapp: isWhatsAppReady ? 'connected' : 'disconnected',
        activeOTPs: otpStorage.size
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n=== OTP SERVER ===`);
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`\nEndpoints:`);
    console.log(`POST /api/send-otp      - Kirim OTP`);
    console.log(`POST /api/verify-otp    - Verifikasi OTP`);
    console.log(`POST /api/reset-password - Reset password`);
    console.log(`GET  /api/status        - Cek status server\n`);
});
