# Crypto Alert Bot (WhatsApp Optimized + AI-Powered)

Crypto Alert Bot adalah bot WhatsApp yang memantau pergerakan crypto dan mengirimkan alert otomatis ke channel atau target tertentu. Bot ini sudah dioptimasi khusus untuk WhatsApp dengan fitur:

- alert pergerakan 1 jam dan 24 jam (dengan threshold anti-spam + AI analysis)
- volume spike (dengan AI breakout detection)
- top movers
- watchlist coin
- whale tracker (alert transaksi besar + AI market impact analysis)
- liquidation alert (likuidasi massal + AI connection to whale activity)
- funding rate extreme (suku bunga pendanaan ekstrem + AI contrarian sentiment)
- breakout alert (tembus resistance/support + AI fakeout detection)
- milestone level harga
- daily market briefing (gabungan summary + fear & greed + AI personas)
- depeg stablecoin (dengan AI urgency ratings)
- dynamic image generation untuk alert visual (dengan AI captions)
- chat commands interaktif (!price, !top, !fng, !analisis, !help)
- smart summarizer (AI-powered anti-spam)
- fallback Binance jika CoinGecko gagal

Bot dikembangkan dengan Node.js, menggunakan Baileys untuk WhatsApp, dan Groq AI untuk analisis cerdas.

## Fitur utama

- Monitoring otomatis market crypto setiap beberapa menit
- Filter cooldown agar tidak spam berulang terus-menerus
- Alert berbasis konfigurasi dari file `.env`
- Support Bahasa Indonesia dan Inggris
- Bisa mengirim ke channel WhatsApp / target nomor tertentu
- Fallback API ke Binance jika CoinGecko error
- Dynamic image generation untuk alert yang lebih menarik
- Chat commands interaktif untuk member grup
- Format pesan WhatsApp markdown (*bold*, _italic_, emoji)
- Threshold anti-spam yang sudah dioptimasi (min 5% untuk 1H)
- **AI-Powered Analysis** dengan Groq AI untuk insight pasar yang lebih cerdas
- **Smart Summarizer** untuk menggabungkan alert serentak menjadi satu pesan
- **AI Personas** untuk daily market briefing (pragmatic, degen, analyst, casual)

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
│   │   ├── whale.js         # whale tracker alert
│   │   ├── liquidation.js  # liquidation alert
│   │   ├── funding.js       # funding rate alert
│   │   ├── breakout.js      # breakout alert
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
│   │   ├── media.js
│   │   ├── commands.js      # chat commands handler
│   │   └── groqAI.js        # Groq AI service for intelligent analysis
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
LANGUAGE=id

MOVE_1H_ENABLED=true
MOVE_1H_THRESHOLD=5  # Dioptimasi ke 5% untuk menghindari spam
MOVE_1H_COOLDOWN_MIN=0

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

# New Alert Types (WhatsApp Optimized)
WHALE_ALERT_ENABLED=false  # Butuh API eksternal
WHALE_MIN_USD=1000000

LIQ_ALERT_ENABLED=false  # Butuh API eksternal
LIQ_MIN_USD=10000000

FUNDING_ALERT_ENABLED=false  # Butuh API exchange
FUNDING_THRESHOLD_PCT=0.1

BREAKOUT_ALERT_ENABLED=false  # Butuh analisis harga
BREAKOUT_TIMEFRAME=4h

WATCHLIST_ENABLED=true
WATCHLIST_COINS=BTC,ETH,SOL,BNB
WATCHLIST_THRESHOLD=3
WATCHLIST_COOLDOWN_MIN=30

# Daily Market Briefing (gabungan summary + fear & greed)
SUMMARY_ENABLED=true
SUMMARY_HOURS=8,20
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

### New Alert Types (WhatsApp Optimized)

#### Whale Tracker
- `WHALE_ALERT_ENABLED` = aktifkan alert transaksi besar
- `WHALE_MIN_USD` = minimal nilai transfer (default $1M)
- `WHALE_TARGET_EXCHANGE` = exchange yang dipantau (default binance)

#### Liquidation Alert
- `LIQ_ALERT_ENABLED` = aktifkan alert likuidasi
- `LIQ_MIN_USD` = minimal nilai likuidasi (default $10M)
- `LIQ_TYPE` = `long`, `short`, atau `both`

#### Funding Rate Alert
- `FUNDING_ALERT_ENABLED` = aktifkan alert funding rate ekstrem
- `FUNDING_THRESHOLD_PCT` = threshold funding rate (default 0.1%)

#### Breakout Alert
- `BREAKOUT_ALERT_ENABLED` = aktifkan alert tembus level
- `BREAKOUT_TIMEFRAME` = timeframe analisis (default 4h)
- `BREAKOUT_VOLUME_MULTIPLIER` = multiplier volume (default 2x)

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

Alert bila coin bergerak kuat dalam 1 jam (threshold dioptimasi ke 5% untuk menghindari spam).

### 2. Move 24h

Alert bila coin bergerak kuat dalam 24 jam.

### 3. Volume spike

Alert bila volume besar dan price move signifikan.

### 4. Top Movers

Snapshot coin paling besar naik dan turun.

### 5. Whale Tracker (Baru)

Alert untuk transaksi besar (> $1M) dari/ke exchange.

### 6. Liquidation Alert (Baru)

Alert untuk likuidasi massal (> $10M) long atau short.

### 7. Funding Rate Alert (Baru)

Alert saat funding rate ekstrem (positif/negatif).

### 8. Breakout Alert (Baru)

Alert saat harga tembus resistance/support kunci.

### 9. Watchlist

Alert untuk coin favorit yang masuk dalam daftar `WATCHLIST_COINS`.

### 10. Milestone

Alert saat harga melewati level psikologis tertentu.

### 11. Daily Market Briefing

Ringkasan pasar yang dikirim sesuai jam yang diset dalam `SUMMARY_HOURS` (sudah termasuk Fear & Greed).

### 12. Depeg

Pemantauan stablecoin seperti USDT jika menyimpang dari rentang normal.

## Chat Commands (Baru)

Bot mendukung commands interaktif di chat WhatsApp:

- `!price <coin>` - Cek harga coin (contoh: `!price btc`)
- `!check <coin>` - Sama seperti !price
- `!top` - Tampilkan top movers
- `!fng` - Tampilkan Fear & Greed index
- `!analisis <coin>` - AI-powered market analysis (contoh: `!analisis btc`)
- `!help` - Tampilkan bantuan commands

Commands ini bekerja di private chat dan grup WhatsApp target.

## Groq AI Features (Baru)

Bot sekarang mendukung analisis AI cerdas menggunakan Groq AI untuk memberikan insight pasar yang lebih kontekstual:

### AI-Powered Market Analysis
- **Price Move Analysis**: Menjelaskan mengapa harga berubah, konteks market, dan rekomendasi aksi
- **Breakout Detection**: Mengklasifikasikan fakeout vs real breakout dengan confidence score
- **Depeg Urgency**: Memberikan panic rating (1-10) dan panduan langkah darurat untuk stablecoin

### Derivatives & Whale Intelligence
- **Whale-Liquidation Connection**: Menghubungkan transaksi whale dengan dampak likuidasi
- **Funding Rate Sentiment**: Analisis contrarian untuk memperingatkan potensi squeeze

### AI Personas for Market Briefing
- **Pragmatic**: Fokus pada fakta dan risk management
- **Degen**: Energik dan penuh semangat
- **Analyst**: Formal tapi mudah dipahami
- **Casual**: Santai seperti ngobrol dengan teman

### Smart Features
- **Conversational Commands**: AI merespon pertanyaan natural language
- **Smart Summarizer**: Menggabungkan alert serentak menjadi satu pesan yang ringkas
- **Image Captions**: AI membuat caption menarik untuk gambar alert

### Groq AI Configuration
```env
GROQ_ENABLED=true
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Individual feature toggles
GROQ_MARKET_ANALYSIS=true
GROQ_BREAKOUT_ANALYSIS=true
GROQ_DEPEG_URGENCY=true
GROQ_WHALE_LIQUIDATION=true
GROQ_FUNDING_SENTIMENT=true
GROQ_MARKET_BRIEFING=true
GROQ_CONVERSATIONAL=true
GROQ_SMART_SUMMARIZER=true
GROQ_IMAGE_CAPTION=true

# Market briefing persona
GROQ_BRIEFING_PERSONA=pragmatic
```

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
- threshold terlalu rendah (MOVE_1H_THRESHOLD sudah dioptimasi ke 5%)
- Kurangi aktifkan alert baru jika terlalu banyak

### Commands tidak merespon

Cek:

- Pastikan bot sudah login dan terhubung ke WhatsApp
- Commands hanya bekerja di chat target (group/private yang terdaftar)
- Pastikan format command benar (misal: `!price btc`)

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
