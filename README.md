# Crypto Alert Bot

Crypto Alert Bot adalah bot WhatsApp yang memantau pergerakan crypto dan mengirimkan alert otomatis ke channel atau target tertentu. Bot ini mendukung:

- alert pergerakan 1 jam dan 24 jam
- volume spike
- top movers
- watchlist coin
- coin baru / discovery listing
- milestone level harga
- sentiment fear & greed
- depeg stablecoin
- ringkasan pasar harian
- fallback Binance jika CoinGecko gagal

Bot dikembangkan dengan Node.js dan menggunakan Baileys untuk WhatsApp.

## Fitur utama

- Monitoring otomatis market crypto setiap beberapa menit
- Filter cooldown agar tidak spam berulang terus-menerus
- Alert berbasis konfigurasi dari file `.env`
- Support Bahasa Indonesia dan Inggris
- Bisa mengirim ke channel WhatsApp / target nomor tertentu
- Fallback API ke Binance jika CoinGecko error
- New listing discovery dari source CoinGecko dan/atau Binance

## Struktur project

```text
crypto-alert-bot/
├── .env                     # konfigurasi environment
├── index.js                 # entry point aplikasi
├── package.json             # dependency dan script
├── state.json               # state cooldown / seen listing
├── baileys_auth/            # auth session WhatsApp Baileys
├── src/
│   ├── config.js            # baca .env dan konfigurasi utama
│   ├── templates.js         # template pesan alert
│   ├── utils.js             # helper format angka, shorten link, dll
│   ├── alerts/              # modul alert
│   │   ├── move1h.js
│   │   ├── move24h.js
│   │   ├── volume.js
│   │   ├── topmovers.js
│   │   ├── newlisting.js
│   │   ├── watchlist.js
│   │   ├── milestone.js
│   │   ├── feargreed.js
│   │   ├── depeg.js
│   │   ├── summary.js
│   │   └── index.js
│   ├── api/
│   │   ├── coingecko.js
│   │   ├── binance.js
│   │   └── feargreed.js
│   ├── locales/
│   │   ├── id.js
│   │   └── en.js
│   ├── services/
│   │   ├── checker.js
│   │   ├── state.js
│   │   ├── whatsapp.js
│   │   └── media.js
│   └── ...
├── node_modules/
├── package-lock.json
├── README.md
└── .gitignore
```

## Persyaratan

- Node.js 18+ (disarankan 20+)
- npm
- WhatsApp aktif untuk login
- akses internet

## Langkah setup

### 1. Install dependency

```bash
npm install
```

### 2. Konfigurasi environment

Edit file `.env` lalu sesuaikan dengan kebutuhan Anda.

Contoh minimal:

```env
TARGET_ID=120363428207771686@newsletter
SESSION_DIR=baileys_auth
CHECK_INTERVAL_MIN=10
TIMEZONE=Asia/Jakarta
LANGUAGE=en

MOVE_1H_ENABLED=true
MOVE_1H_THRESHOLD=3
MOVE_1H_COOLDOWN_MIN=25

MOVE_24H_ENABLED=true
MOVE_24H_THRESHOLD=7
MOVE_24H_COOLDOWN_MIN=360

BINANCE_FALLBACK_ENABLED=true

VOLUME_ALERT_ENABLED=true
VOLUME_ALERT_MIN_MOVE_PCT=3
VOLUME_ALERT_MIN_USD=20000000

TOP_MOVERS_ENABLED=true
TOP_MOVERS_LIMIT=5
TOP_MOVERS_THRESHOLD=3

NEW_LISTING_ALERT_ENABLED=true
NEW_LISTING_SOURCE=both
NEW_LISTING_LIMIT=3
NEW_LISTING_MIN_MCAP_USD=20000000
NEW_LISTING_MIN_VOLUME_USD=5000000
NEW_LISTING_MIN_PRICE=0.05
NEW_LISTING_MIN_MOVE_PCT_1H=5
NEW_LISTING_MIN_MOVE_PCT_24H=3
NEW_LISTING_COOLDOWN_HOURS=12

WATCHLIST_ENABLED=true
WATCHLIST_COINS=BTC,ETH,SOL,BNB
WATCHLIST_THRESHOLD=3
WATCHLIST_COOLDOWN_MIN=30
```

### 3. Jalankan bot

```bash
npm start
```

Atau langsung:

```bash
node index.js
```

### 4. Login WhatsApp

Saat bot pertama kali dijalankan, akan muncul QR code di terminal.

Buka WhatsApp di handphone Anda:

- pilih menu connected devices
- pilih Link a device
- scan QR code yang muncul di terminal

Setelah berhasil terhubung, bot akan masuk ke mode ready dan mulai monitoring market.

## Penjelasan konfigurasi utama

### TARGET_ID

Target tujuan kiriman pesan. Biasanya nomor WhatsApp atau newsletter ID.

Contoh:

```env
TARGET_ID=120363428207771686@newsletter
```

### CHECK_INTERVAL_MIN

Jarak waktu pengecekan market. Nilai default biasanya `10` menit.

### LANGUAGE

Pilihan:

- `id` -> bahasa Indonesia
- `en` -> bahasa Inggris
- `both` -> gabungkan Indonesia dan Inggris dalam satu pesan

### MOVE_1H_ENABLED / MOVE_1H_THRESHOLD

Alert jika pergerakan 1 jam melebihi threshold.

Contoh:

```env
MOVE_1H_THRESHOLD=3
```
Artinya alert akan dikirim jika pergerakan 1 jam >= 3%.

### MOVE_1H_COOLDOWN_MIN

Cooldown agar alert tidak berulang terlalu cepat. Nilai dalam menit.

### NEW_LISTING_*

Digunakan untuk alert coin baru / discovery:

- `NEW_LISTING_SOURCE` = `coingecko`, `binance`, atau `both`
- `NEW_LISTING_LIMIT` = maksimal jumlah coin baru yang dikirim per siklus
- `NEW_LISTING_MIN_MCAP_USD` = minimal market cap
- `NEW_LISTING_MIN_VOLUME_USD` = minimal volume
- `NEW_LISTING_MIN_MOVE_PCT_1H` = minimal move 1 jam
- `NEW_LISTING_MIN_MOVE_PCT_24H` = minimal move 24 jam

### WATCHLIST_COINS

Coin yang akan diawasi secara khusus.

Contoh:

```env
WATCHLIST_COINS=BTC,ETH,SOL,BNB
```

## Cara kerja bot

Flow umumnya:

1. Bot memanggil API market (CoinGecko)
2. Jika gagal, bot mencoba fallback ke Binance
3. Bot memproses data coin yang masuk dalam daftar utama
4. Bot menjalankan semua alert yang aktif
5. Bot menyeleksi yang belum cooldown
6. Bot mengirim pesan ke target WhatsApp

## Alert yang tersedia

### 1. Move 1h

Alert bila coin bergerak kuat dalam 1 jam.

### 2. Move 24h

Alert bila coin bergerak kuat dalam 24 jam.

### 3. Volume spike

Alert bila volume besar dan price move signifikan.

### 4. Top Movers

Snapshot coin paling besar naik dan turun.

### 5. Watchlist

Alert untuk coin favorit yang masuk dalam daftar `WATCHLIST_COINS`.

### 6. New Listing

Alert untuk coin baru / discovery yang lolos filter.

### 7. Milestone

Alert saat harga melewati level psikologis tertentu.

### 8. Fear & Greed

Informasi sentiment pasar.

### 9. Depeg

Pemantauan stablecoin seperti USDT jika menyimpang dari rentang normal.

### 10. Summary

Ringkasan pasar yang dikirim sesuai jam yang diset dalam `SUMMARY_HOURS`.

## Binance fallback

Bot sudah disiapkan untuk fallback ke Binance jika CoinGecko gagal atau rate limited.

Pengaturan:

```env
BINANCE_FALLBACK_ENABLED=true
```

Catatan:
- Binance discovery bisa terkadang error karena certificate/TLS issue pada runtime tertentu
- saat itu bot tetap mencoba lanjut dan tidak crash total

## Cooldown penting

Cooldown mencegah spam. Misalnya:

```env
MOVE_1H_COOLDOWN_MIN=25
```

Artinya bot tidak akan mengirim alert yang sama untuk coin yang sama dalam 25 menit.

Jika terlalu kecil atau 0, alert dapat berulang terus-terusan saat kondisi tetap true.

## Troubleshooting

### Bot tidak terkirim ke channel

Cek:

- `TARGET_ID` sudah benar
- bot berhasil login WhatsApp
- tidak ada error saat `node index.js`

### Alert spam terlalu sering

Cek:

- `*_COOLDOWN_MIN` atau `*_COOLDOWN_HOURS` terlalu kecil
- `NEW_LISTING_LIMIT` terlalu besar
- threshold terlalu rendah

### New listing terlalu sering

Sesuaikan:

```env
NEW_LISTING_LIMIT=2
NEW_LISTING_MIN_MOVE_PCT_1H=5
NEW_LISTING_MIN_VOLUME_USD=5000000
NEW_LISTING_MIN_MCAP_USD=20000000
NEW_LISTING_COOLDOWN_HOURS=12
```

### CoinGecko error

Bot otomatis fallback ke Binance jika `BINANCE_FALLBACK_ENABLED=true`.

### Binance certificate error

Kadang terjadi pada lingkungan tertentu karena masalah SSL/TLS atau certificate di OS/Node. Solusi umum:

- update Node.js
- cek sertifikat OS
- nonaktifkan Binance discovery jika perlu
- pakai CoinGecko sebagai source utama

## Tips untuk channel yang lebih rapi

Untuk membuat channel terlihat bersih dan tidak terlalu ramai, gunakan konfigurasi seperti ini:

```env
NEW_LISTING_LIMIT=2
NEW_LISTING_MIN_MOVE_PCT_1H=5
NEW_LISTING_MIN_VOLUME_USD=5000000
NEW_LISTING_COOLDOWN_HOURS=12
```

Dengan ini alert baru akan lebih selektif dan tidak menutupi alert utama.

## Restart bot

Setelah mengubah `.env`, biasanya cukup restart aplikasi:

```bash
npm start
```

## Catatan penting

- Bot ini dibuat untuk kebutuhan monitoring pasar crypto dan bukan saran investasi
- Gunakan filter dan cooldown dengan bijak agar channel tetap rapi
- Pastikan target ID benar sebelum dipakai secara live

## License

Project ini dibuat untuk kebutuhan internal / personal. Silakan sesuaikan lisensinya jika ingin dipakai di lingkungan komersial.

## Bantuan lanjutan

Jika Anda ingin, next step yang bisa dibuat:

- template alert premium lebih ringkas
- auto image card untuk alert
- dashboard monitoring
- mode bot multi-target / multi group
- fitur command untuk add/remove watchlist


---

Jika Anda mau, saya juga bisa buatkan versi README yang lebih profesional seperti dokumentasi proyek siap dikirim ke GitHub, lengkap dengan badge, screenshot section, dan bagian Quick Start yang lebih rapi.
