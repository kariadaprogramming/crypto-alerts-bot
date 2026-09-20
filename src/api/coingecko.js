const axios = require('axios');
const config = require('../config');

const http = axios.create({
    baseURL: config.coingecko.baseUrl,
    timeout: 15000,
    headers: config.coingecko.apiKey ? { 'x-cg-demo-api-key': config.coingecko.apiKey } : {}
});

let idrRate = 0;
let idrRateAt = 0;

// 1 request untuk semua koin, sudah termasuk perubahan 1 jam & 24 jam
async function getMarkets() {
    const res = await http.get('/coins/markets', {
        params: {
            vs_currency: 'usd',
            ids: Object.keys(config.coins).join(','),
            price_change_percentage: '1h,24h'
        }
    });
    return res.data;
}

async function getAllMarkets() {
    const res = await http.get('/coins/markets', {
        params: {
            vs_currency: 'usd',
            per_page: 250,
            page: 1,
            sparkline: false,
            price_change_percentage: '1h,24h'
        }
    });
    return res.data;
}

// Kurs USD -> IDR, di-cache supaya hemat request
async function getIdrRate() {
    if (idrRate && Date.now() - idrRateAt < config.coingecko.idrRateCacheMs) return idrRate;
    try {
        const res = await http.get('/simple/price', {
            params: { ids: 'tether', vs_currencies: 'usd,idr' }
        });
        idrRate = res.data.tether.idr / res.data.tether.usd;
        idrRateAt = Date.now();
    } catch (e) {
        console.error('⚠️  Gagal ambil kurs IDR:', e.message);
    }
    return idrRate; // kalau gagal, pakai kurs lama (0 jika belum pernah berhasil)
}

module.exports = { getMarkets, getAllMarkets, getIdrRate };
