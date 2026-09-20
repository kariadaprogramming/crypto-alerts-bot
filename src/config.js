// Semua pengaturan dibaca dari file .env.
// Yang tidak ada di .env memakai nilai default di bawah.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const raw = (k) => (process.env[k] === undefined ? '' : String(process.env[k]).trim());
const str = (k, d) => raw(k) || d;
const strList = (k, d) => {
    const v = raw(k);
    if (v === '') return d;
    return v.split(',').map((x) => x.trim()).filter(Boolean);
};
const num = (k, d) => {
    const v = raw(k);
    if (v === '') return d;
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
};
const bool = (k, d) => {
    const v = raw(k).toLowerCase();
    if (v === '') return d;
    return ['1', 'true', 'yes', 'on'].includes(v);
};
const numList = (k, d) => {
    const v = raw(k);
    if (v === '') return d;
    const a = v.split(',').map((x) => Number(x.trim())).filter(Number.isFinite);
    return a.length ? a : d;
};
const MIN = 60 * 1000;
const HOUR = 60 * MIN;

const config = {
    targetId: str('TARGET_ID', ''),
    sessionDir: str('SESSION_DIR', 'baileys_auth'),
    timezone: str('TIMEZONE', 'Asia/Jakarta'),
    language: str('LANGUAGE', 'id').toLowerCase(), // id | en | both
    checkIntervalMs: num('CHECK_INTERVAL_MIN', 10) * MIN,
    stateFile: path.join(__dirname, '..', 'state.json'),

    coingecko: {
        baseUrl: 'https://api.coingecko.com/api/v3',
        apiKey: str('COINGECKO_API_KEY', ''),
        idrRateCacheMs: HOUR
    },
    shrinkme: {
        enabled: bool('SHRINKME_ENABLED', false),
        apiKey: str('SHRINKME_API_KEY', ''),
        apiUrl: str('SHRINKME_API_URL', 'https://shrinkme.io/api')
    },
    binance: {
        enabled: bool('BINANCE_FALLBACK_ENABLED', true),
        discoveryEnabled: bool('BINANCE_DISCOVERY_ENABLED', true),
        baseUrl: 'https://api.binance.com/api/v3'
    },

    // Daftar koin. `step` = kelipatan harga untuk alert milestone
    // (hapus `step` kalau koin tidak butuh milestone).
    // `stable: true` = stablecoin, hanya dipantau untuk depeg.
    coins: {
        bitcoin:     { ticker: 'BTC',  name: 'Bitcoin',           step: 5000 },
        ethereum:    { ticker: 'ETH',  name: 'Ethereum',          step: 250 },
        tether:      { ticker: 'USDT', name: 'Tether',            stable: true },
        solana:      { ticker: 'SOL',  name: 'Solana',            step: 10 },
        binancecoin: { ticker: 'BNB',  name: 'BNB (Binance Coin)', step: 50 },
        ripple:      { ticker: 'XRP',  name: 'XRP', },
        cardano:     { ticker: 'ADA',  name: 'Cardano', },
        dogecoin:    { ticker: 'DOGE', name: 'Dogecoin', },
        chainlink:   { ticker: 'LINK', name: 'Chainlink', },
        'avalanche-2': { ticker: 'AVAX', name: 'Avalanche', },
        polkadot:    { ticker: 'DOT',  name: 'Polkadot', },
        'matic-network': { ticker: 'MATIC', name: 'Polygon', },
        'the-open-network': { ticker: 'TON', name: 'Toncoin', }
    },

    move1h: {
        enabled: bool('MOVE_1H_ENABLED', true),
        threshold: num('MOVE_1H_THRESHOLD', 3),
        cooldownMs: num('MOVE_1H_COOLDOWN_MIN', 0) * MIN
    },
    move24h: {
        enabled: bool('MOVE_24H_ENABLED', true),
        threshold: num('MOVE_24H_THRESHOLD', 7),
        cooldownMs: num('MOVE_24H_COOLDOWN_MIN', 360) * MIN
    },
    volume: {
        enabled: bool('VOLUME_ALERT_ENABLED', true),
        minMovePct: num('VOLUME_ALERT_MIN_MOVE_PCT', 3),
        minUsd: num('VOLUME_ALERT_MIN_USD', 20000000),
        cooldownMs: num('VOLUME_ALERT_COOLDOWN_MIN', 30) * MIN
    },
    topMovers: {
        enabled: bool('TOP_MOVERS_ENABLED', true),
        limit: num('TOP_MOVERS_LIMIT', 5),
        threshold: num('TOP_MOVERS_THRESHOLD', 3),
        cooldownMs: num('TOP_MOVERS_COOLDOWN_HOURS', 6) * HOUR
    },
    newListing: {
        enabled: bool('NEW_LISTING_ALERT_ENABLED', true),
        source: str('NEW_LISTING_SOURCE', 'both').toLowerCase(),
        limit: num('NEW_LISTING_LIMIT', 5),
        minMarketCapUsd: num('NEW_LISTING_MIN_MCAP_USD', 20000000),
        minVolumeUsd: num('NEW_LISTING_MIN_VOLUME_USD', 5000000),
        minPrice: num('NEW_LISTING_MIN_PRICE', 0.05),
        minMovePct1h: num('NEW_LISTING_MIN_MOVE_PCT_1H', 3),
        minMovePct24h: num('NEW_LISTING_MIN_MOVE_PCT_24H', 0),
        cooldownMs: num('NEW_LISTING_COOLDOWN_HOURS', 12) * HOUR
    },
    watchlist: {
        enabled: bool('WATCHLIST_ENABLED', true),
        coins: strList('WATCHLIST_COINS', ['BTC', 'ETH', 'SOL', 'BNB']),
        threshold: num('WATCHLIST_THRESHOLD', 3),
        cooldownMs: num('WATCHLIST_COOLDOWN_MIN', 30) * MIN
    },
    milestone: {
        enabled: bool('MILESTONE_ENABLED', true),
        cooldownMs: num('MILESTONE_COOLDOWN_MIN', 60) * MIN
    },
    fng: {
        enabled: bool('FNG_ENABLED', true),
        fearMax: num('FNG_FEAR_MAX', 20),
        greedMin: num('FNG_GREED_MIN', 80),
        cooldownMs: num('FNG_COOLDOWN_HOURS', 24) * HOUR,
        cacheMs: num('FNG_CACHE_MIN', 60) * MIN
    },
    depeg: {
        enabled: bool('DEPEG_ENABLED', true),
        low: num('DEPEG_LOW', 0.99),
        high: num('DEPEG_HIGH', 1.01),
        cooldownMs: num('DEPEG_COOLDOWN_MIN', 60) * MIN
    },
    summary: {
        enabled: bool('SUMMARY_ENABLED', true),
        hours: numList('SUMMARY_HOURS', [8, 20])
    },
    media: {
        customCardsEnabled: bool('MEDIA_CUSTOM_CARDS_ENABLED', true),
        screenshotEnabled: bool('MEDIA_SCREENSHOT_ENABLED', false),
        screenshotTimeoutMs: num('MEDIA_SCREENSHOT_TIMEOUT_MS', 30000),
        cardWidth: num('MEDIA_CARD_WIDTH', 1200),
        cardHeight: num('MEDIA_CARD_HEIGHT', 675)
    }
};

if (!['id', 'en', 'both'].includes(config.language)) {
    console.error('❌ LANGUAGE harus id, en, atau both. Nilai sekarang:', config.language);
    process.exit(1);
}

if (!['coingecko', 'binance', 'both'].includes(config.newListing.source)) {
    console.error('❌ NEW_LISTING_SOURCE harus coingecko, binance, atau both. Nilai sekarang:', config.newListing.source);
    config.newListing.source = 'both';
}

if (!config.targetId) {
    console.error('❌ TARGET_ID kosong. Isi di file .env');
    process.exit(1);
}

module.exports = config;
