# PM2 Background Process Management Guide

## Apa itu PM2?
PM2 adalah process manager untuk Node.js yang menjaga aplikasi tetap berjalan di background, bahkan jika terminal ditutup atau server restart.

## Cara Menggunakan

### Install PM2 (sudah dilakukan)
```bash
npm install pm2 --save-dev
```

### Menjalankan Bot di Background

**Option 1: Menggunakan npm script**
```bash
npm run pm2:start
```

**Option 2: Menggunakan PM2 langsung**
```bash
pm2 start ecosystem.config.js
```

**Option 3: Menggunakan script (Linux/Mac)**
```bash
chmod +x start.sh
./start.sh
```

**Option 4: Menggunakan script (Windows)**
```cmd
start.bat
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

# Save process list (agar auto-start setelah reboot)
pm2 save

# Setup startup script (agar auto-start setelah server reboot)
pm2 startup
```

### Menjalankan di Server (VPS)

1. **Clone repository**
```bash
git clone <your-repo-url>
cd crypto-alerts-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

4. **Start dengan PM2**
```bash
npm run pm2:start
pm2 save
```

5. **Setup auto-start setelah reboot**
```bash
pm2 startup
# Ikuti instruksi yang muncul
pm2 save
```

### Monitoring

```bash
# Monitor interaktif
pm2 monit

# Lihat detail process
pm2 show crypto-alerts-bot

# Flush logs (hapus logs lama)
pm2 flush
```

### Troubleshooting

**Bot tidak start:**
```bash
pm2 logs crypto-alerts-bot --lines 50
```

**Restart otomatis tidak jalan:**
```bash
pm2 delete crypto-alerts-bot
npm run pm2:start
pm2 save
```

**Update kode tanpa stop bot:**
```bash
git pull
pm2 restart crypto-alerts-bot
```

## Konfigurasi PM2

File `ecosystem.config.js` berisi konfigurasi:
- `name`: Nama process
- `script`: File yang dijalankan
- `autorestart`: Auto restart jika crash
- `max_memory_restart`: Restart jika memory melebihi limit
- `error_file`: Lokasi file error logs
- `out_file`: Lokasi file output logs

## Keuntungan Menggunakan PM2

✅ Bot tetap jalan meskipun terminal ditutup
✅ Auto restart jika bot crash
✅ Memory management (restart jika memory tinggi)
✅ Log management (logs tersimpan di file)
✅ Auto start setelah server reboot
✅ Monitoring dan control tools
✅ Zero downtime deployment

## Tips untuk Production

1. **Setup log rotation** (optional):
```bash
pm2 install pm2-logrotate
```

2. **Monitoring dengan Keymetrics** (optional):
```bash
pm2 link <public_key> <secret_key>
```

3. **Backup database/credentials**:
   - Backup folder `baileys_auth` (session WhatsApp)
   - Backup file `.env`
   - Backup file `state.json`
