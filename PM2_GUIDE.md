# Background Process Management Guide

## 🖥️ Windows (Recommended for Windows Users)

### Option 1: Windows Service (Best for Production)

Install bot sebagai Windows Service agar auto-start setelah reboot:

```bash
# Install service (butuh administrator privileges)
npm run service:install

# Start service
npm run service:start

# Stop service
npm run service:stop

# Uninstall service
npm run service:uninstall
```

**Atau gunakan command Windows langsung:**
```cmd
# Install service
node install_service.js

# Start service
net start CryptoAlertsBot

# Stop service
net stop CryptoAlertsBot

# Uninstall service
node uninstall_service.js
```

**Manajemen via Windows Services:**
1. Buka `Services.msc`
2. Cari service "CryptoAlertsBot"
3. Start/Stop/Restart dari GUI

### Option 2: Simple Background Process

Untuk quick start tanpa install service:

```cmd
# Jalankan di background
start_background.bat

# Atau via npm
npm run background
```

**Untuk stop:**
- Buka Task Manager → End process `node.exe`
- Atau command: `taskkill /F /IM node.exe`

---

## 🐧 Linux/Mac (PM2)

### Install dan Setup PM2

```bash
# Install PM2 (sudah dilakukan)
npm install pm2 --save-dev

# Start dengan PM2
npm run pm2:start

# Save process list
pm2 save

# Setup auto-start setelah reboot
pm2 startup
# Ikuti instruksi yang muncul
pm2 save
```

### Perintah PM2 Penting

```bash
# Cek status bot
pm2 status

# Lihat logs real-time
pm2 logs crypto-alerts-bot

# Stop bot
pm2 stop crypto-alerts-bot

# Restart bot
pm2 restart crypto-alerts-bot

# Hapus bot dari PM2
pm2 delete crypto-alerts-bot
```

---

## 🚀 Deployment ke Server (VPS)

### Windows Server

```bash
# Clone repository
git clone <your-repo-url>
cd crypto-alerts-bot

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# Install sebagai Windows Service (butuh admin)
npm run service:install

# Start service
npm run service:start
```

### Linux Server

```bash
# Clone repository
git clone <your-repo-url>
cd crypto-alerts-bot

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# Start dengan PM2
npm run pm2:start
pm2 save

# Setup auto-start setelah reboot
pm2 startup
# Ikuti instruksi yang muncul
pm2 save
```

---

## 📋 Monitoring dan Troubleshooting

### Windows Service

```cmd
# Cek status
sc query CryptoAlertsBot

# Lihat event logs
eventvwr.msc
# Cari logs di Windows Logs → Application
```

### PM2 (Linux/Mac)

```bash
# Monitor interaktif
pm2 monit

# Lihat detail process
pm2 show crypto-alerts-bot

# Flush logs (hapus logs lama)
pm2 flush
```

### Troubleshooting Umum

**Bot tidak start:**
- Windows: Cek Event Viewer untuk error logs
- Linux: `pm2 logs crypto-alerts-bot --lines 50`

**Restart otomatis tidak jalan:**
- Windows: Uninstall dan reinstall service
- Linux: `pm2 delete crypto-alerts-bot && npm run pm2:start`

**Update kode tanpa stop bot:**
```bash
git pull
# Windows: npm run service:stop && npm run service:start
# Linux: pm2 restart crypto-alerts-bot
```

---

## 🔧 Konfigurasi

### Windows Service (`install_service.js`)
- `name`: Nama service
- `description`: Deskripsi service
- `script`: File yang dijalankan
- `nodeOptions`: Opsi Node.js (memory limit, dll)

### PM2 (`ecosystem.config.js`)
- `name`: Nama process
- `script`: File yang dijalankan
- `autorestart`: Auto restart jika crash
- `max_memory_restart`: Restart jika memory melebihi limit
- `error_file`: Lokasi file error logs
- `out_file`: Lokasi file output logs

---

## ✨ Keuntungan Background Process

✅ Bot tetap jalan meskipun terminal ditutup
✅ Auto restart jika bot crash (PM2)
✅ Memory management (restart jika memory tinggi)
✅ Log management (logs tersimpan di file)
✅ Auto start setelah server reboot
✅ Monitoring dan control tools
✅ Zero downtime deployment

---

## 💾 Backup Penting

Selalu backup file-file ini:
- `baileys_auth/` - Session WhatsApp
- `.env` - Konfigurasi environment
- `state.json` - State tracking bot
