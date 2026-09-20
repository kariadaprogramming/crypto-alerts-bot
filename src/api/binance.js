const axios = require('axios');
const config = require('../config');

const http = axios.create({
    baseURL: config.binance.baseUrl,
    timeout: 15000
});

const SYMBOL_MAP = {
    bitcoin: 'BTCUSDT',
    ethereum: 'ETHUSDT',
    solana: 'SOLUSDT',
    binancecoin: 'BNBUSDT'
};

function normalizeTicker(ticker) {
    const symbol = String(ticker.symbol || '').toUpperCase();
    const id = Object.entries(SYMBOL_MAP).find(([, v]) => v === symbol)?.[0] || null;
    if (!id || !config.coins[id]) return null;

    const price = Number(ticker.lastPrice || 0);
    const pct24h = Number(ticker.priceChangePercent || 0);
    const vol = Number(ticker.quoteVolume || 0);

    return {
        id,
        symbol,
        ticker: config.coins[id].ticker,
        name: config.coins[id].name,
        usd: Number.isFinite(price) ? price : null,
        pct1h: null,
        pct24h: Number.isFinite(pct24h) ? pct24h : null,
        current_price: Number.isFinite(price) ? price : null,
        total_volume: Number.isFinite(vol) ? vol : null,
        price_change_percentage_1h_in_currency: null,
        price_change_percentage_24h_in_currency: Number.isFinite(pct24h) ? pct24h : null
    };
}

async function getMarkets() {
    const res = await http.get('/ticker/24hr');
    const items = Array.isArray(res.data) ? res.data : [];
    const seen = new Set();
    const markets = items
        .map(normalizeTicker)
        .filter(Boolean)
        .filter((m) => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
        });

    return markets;
}

async function getDiscoveryMarkets() {
    const res = await http.get('/ticker/24hr');
    const items = Array.isArray(res.data) ? res.data : [];

    return items
        .filter((ticker) => /USDT$/.test(String(ticker.symbol || '')))
        .map((ticker) => {
            const symbol = String(ticker.symbol || '').toUpperCase();
            const base = symbol.replace(/USDT$/, '');
            const price = Number(ticker.lastPrice || 0);
            const volume = Number(ticker.quoteVolume || 0);
            const pct24h = Number(ticker.priceChangePercent || 0);

            return {
                id: symbol.toLowerCase(),
                name: base || symbol,
                ticker: base || symbol,
                symbol,
                usd: Number.isFinite(price) ? price : null,
                current_price: Number.isFinite(price) ? price : null,
                total_volume: Number.isFinite(volume) ? volume : null,
                market_cap: 0,
                pct1h: null,
                pct24h: Number.isFinite(pct24h) ? pct24h : null,
                price_change_percentage_1h_in_currency: null,
                price_change_percentage_24h_in_currency: Number.isFinite(pct24h) ? pct24h : null,
                source: 'binance'
            };
        })
        .filter((m) => m.current_price > 0 && m.total_volume > 0)
        .slice(0, 200);
}

module.exports = { getMarkets, getDiscoveryMarkets };
