const config = require('../config');
const { getMarkets, getAllMarkets, getIdrRate } = require('../api/coingecko');
const { getMarkets: getBinanceMarkets, getDiscoveryMarkets: getBinanceDiscoveryMarkets } = require('../api/binance');
const { getFearGreed } = require('../api/feargreed');
const alerts = require('../alerts');
const state = require('./state');
const { sleep, fmtUsd, fmtPct } = require('../utils');
const { buildAlertMedia } = require('./media');

let running = false;

function binanceDiscoveryDisabledByTls(error) {
    const msg = String(error && (error.message || error));
    return /certificate|cert|ssl|tls|self[- ]signed|unable to verify|unable to get local issuer|fetch failed/i.test(msg);
}

async function runChecks(sock) {
    if (running) return;
    running = true;

    try {
        let markets;
        try {
            markets = await getMarkets();
        } catch (error) {
            if (!config.binance.enabled) throw error;
            console.warn('⚠️ CoinGecko gagal, mencoba Binance sebagai fallback...');
            markets = await getBinanceMarkets();
        }

        let coingeckoBroad = [];
        let binanceBroad = [];
        if (config.newListing.enabled) {
            if (['coingecko', 'both'].includes(config.newListing.source)) {
                try {
                    coingeckoBroad = await getAllMarkets();
                } catch (e) {
                    console.warn('⚠️ Gagal ambil broad market list dari CoinGecko:', e.message);
                }
            }
            if (['binance', 'both'].includes(config.newListing.source) && config.binance.enabled && config.binance.discoveryEnabled !== false) {
                try {
                    binanceBroad = await getBinanceDiscoveryMarkets();
                } catch (e) {
                    console.warn('⚠️ Gagal ambil broad market list dari Binance:', e.message);
                    if (binanceDiscoveryDisabledByTls(e)) {
                        config.binance.discoveryEnabled = false;
                        console.warn('⚠️ Binance discovery dinonaktifkan untuk sesi ini agar bot tetap stabil.');
                    }
                }
            }
        }

        const rate = await getIdrRate();
        const needFng = config.fng.enabled || config.summary.enabled;
        const fng = needFng ? await getFearGreed() : null;

        const coins = markets
            .filter((m) => config.coins[m.id])
            .map((m) => ({
                id: m.id,
                ...config.coins[m.id],
                usd: m.current_price ?? m.usd ?? null,
                idr: (m.current_price ?? m.usd ?? 0) * rate,
                pct1h: m.price_change_percentage_1h_in_currency ?? null,
                pct24h: m.price_change_percentage_24h_in_currency ?? m.pct24h ?? null,
                total_volume: m.total_volume ?? m.quoteVolume ?? null,
                market_cap: m.market_cap ?? null
            }));

        const discoveryCandidates = [...coingeckoBroad, ...binanceBroad]
            .filter((m) => !config.coins[m.id])
            .filter((m) => !config.coins[m.symbol])
            .map((m) => {
                const source = m.source || 'coingecko';
                const id = String(m.id || m.symbol || '').toLowerCase();
                return {
                    id,
                    name: m.name || m.ticker || String(m.symbol || '').toUpperCase(),
                    ticker: String(m.ticker || m.symbol || '').toUpperCase(),
                    usd: Number(m.current_price ?? m.usd ?? 0),
                    idr: ((m.current_price ?? m.usd ?? 0) * rate),
                    pct1h: source === 'coingecko' ? (m.price_change_percentage_1h_in_currency ?? null) : null,
                    pct24h: m.price_change_percentage_24h_in_currency ?? m.pct24h ?? null,
                    total_volume: m.total_volume ?? null,
                    market_cap: m.market_cap ?? 0,
                    source
                };
            })
            .filter((m) => Number(m.usd || 0) >= config.newListing.minPrice)
            .filter((m) => Number(m.market_cap || 0) >= config.newListing.minMarketCapUsd || m.source === 'binance')
            .filter((m) => Number(m.total_volume || 0) >= config.newListing.minVolumeUsd || m.source === 'binance')
            .filter((m) => {
                const p1 = Number(m.pct1h ?? 0);
                const p24 = Number(m.pct24h ?? 0);
                if (m.source === 'binance') return p24 >= config.newListing.minMovePct24h;
                return p1 >= config.newListing.minMovePct1h && p24 >= config.newListing.minMovePct24h;
            })
            .filter((m) => !state.getSeenListing(m.id))
            .reduce((acc, m) => {
                const key = `${m.source}:${m.id}`;
                if (!acc.seen.has(key)) {
                    acc.seen.add(key);
                    acc.items.push(m);
                }
                return acc;
            }, { seen: new Set(), items: [] }).items
            .slice(0, config.newListing.limit);

        const time = new Date().toLocaleTimeString('id-ID');
        for (const c of coins) {
            const p1 = c.pct1h == null ? '-' : fmtPct(c.pct1h);
            const p24 = c.pct24h == null ? '-' : fmtPct(c.pct24h);
            console.log(`[${time}] ${c.ticker}: ${fmtUsd(c.usd)} (1j ${p1} | 24j ${p24})`);
        }

        const ctx = { coins, fng, newListings: discoveryCandidates };

        let items = [];
        for (const alert of alerts) {
            if (!alert.enabled) continue;
            try {
                items.push(...alert.run(ctx));
            } catch (e) {
                console.error(`❌ Alert ${alert.name} error:`, e.message);
            }
        }

        const seen = new Set();
        items = items
            .filter((i) => state.canSend(i.key, i.cooldownMs))
            .filter((i) => {
                if (!i.group) return true;
                if (seen.has(i.group)) return false;
                seen.add(i.group);
                return true;
            });

        for (const item of items) {
            try {
                const media = await buildAlertMedia(item);
                const payload = media && media.image
                    ? { image: media.image, caption: media.caption || item.text }
                    : { text: item.text };

                await sock.sendMessage(config.targetId, payload);
                state.markSent(item.key);
                if (item.onSent) item.onSent();
                console.log(`🔔 Terkirim: ${item.key}`);
            } catch (e) {
                try {
                    await sock.sendMessage(config.targetId, { text: item.text });
                    state.markSent(item.key);
                    if (item.onSent) item.onSent();
                    console.log(`🔔 Terkirim (fallback text): ${item.key}`);
                } catch (err) {
                    console.error(`❌ Gagal kirim ${item.key}:`, err.message);
                }
            }
            await sleep(2000);
        }
    } catch (error) {
        if (error.response) {
            const code = error.response.status;
            console.error(`❌ API Error [${code}]:`, error.response.statusText);
            if (code === 429) {
                console.error('   Kena rate limit. Naikkan CHECK_INTERVAL_MIN atau isi COINGECKO_API_KEY.');
            }
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        running = false;
    }
}

module.exports = { runChecks };
