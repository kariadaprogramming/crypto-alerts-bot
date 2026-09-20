const axios = require('axios');
const config = require('../config');

let cache = null;
let cacheAt = 0;

// Fear & Greed Index dari alternative.me (gratis, terpisah dari limit CoinGecko)
async function getFearGreed() {
    if (cache && Date.now() - cacheAt < config.fng.cacheMs) return cache;
    try {
        const res = await axios.get('https://api.alternative.me/fng/', {
            params: { limit: 1 },
            timeout: 15000
        });
        const d = res.data.data[0];
        cache = { value: Number(d.value), label: d.value_classification };
        cacheAt = Date.now();
    } catch (e) {
        console.error('⚠️  Gagal ambil Fear & Greed:', e.message);
    }
    return cache; // bisa null kalau belum pernah berhasil
}

module.exports = { getFearGreed };
