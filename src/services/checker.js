const config = require('../config');
const { getMarkets, getIdrRate } = require('../api/coingecko');
const { getMarkets: getBinanceMarkets } = require('../api/binance');
const { getFearGreed } = require('../api/feargreed');
const alerts = require('../alerts');
const state = require('./state');
const { sleep, fmtUsd, fmtPct } = require('../utils');
const { buildAlertMedia } = require('./media');
const groqAI = require('./groqAI');

let running = false;

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

        const time = new Date().toLocaleTimeString('id-ID');
        for (const c of coins) {
            const p1 = c.pct1h == null ? '-' : fmtPct(c.pct1h);
            const p24 = c.pct24h == null ? '-' : fmtPct(c.pct24h);
            console.log(`[${time}] ${c.ticker}: ${fmtUsd(c.usd)} (1j ${p1} | 24j ${p24})`);
        }

        const ctx = { coins, fng };

        let items = [];
        for (const alert of alerts) {
            if (!alert.enabled) continue;
            try {
                const alertItems = await alert.run(ctx);
                items.push(...alertItems);
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

        // Smart summarizer for anti-spam if AI is enabled
        if (config.groq?.enabled && config.groq?.smartSummarizer && groqAI.isAvailable() && items.length > 3) {
            try {
                // Group alerts by type and time to identify potential spam patterns
                const recentAlerts = items.filter(item => {
                    // This is a simplified check - in real implementation, track timestamps
                    return item.key.includes('move1h') || item.key.includes('move24h');
                });

                if (recentAlerts.length >= 3) {
                    const aiSummary = await groqAI.smartSummarize(recentAlerts);
                    if (aiSummary) {
                        // Replace individual alerts with summary
                        const summarizedItem = {
                            key: 'smart_summary',
                            cooldownMs: 0,
                            text: `📊 *MARKET SUMMARY*\n\n${aiSummary}`,
                            mediaType: 'card'
                        };
                        
                        // Remove the individual alerts that were summarized
                        const summarizedKeys = new Set(recentAlerts.map(item => item.key));
                        items = items.filter(item => !summarizedKeys.has(item.key));
                        
                        // Add the summary at the beginning
                        items.unshift(summarizedItem);
                    }
                }
            } catch (error) {
                console.warn('⚠️ Smart summarizer failed:', error.message);
            }
        }

        for (const item of items) {
            try {
                // Cek apakah target adalah newsletter channel
                const isNewsletter = config.targetId.endsWith('@newsletter');
                
                if (isNewsletter) {
                    // Newsletter hanya support text, tidak support image+caption
                    await sock.sendMessage(config.targetId, { text: item.text });
                    state.markSent(item.key);
                    if (item.onSent) item.onSent();
                    console.log(`🔔 Terkirim (newsletter text): ${item.key}`);
                } else {
                    // Grup biasa bisa gunakan media
                    const media = await buildAlertMedia(item);
                    const payload = media && media.image
                        ? { image: media.image, caption: media.caption || item.text }
                        : { text: item.text };

                    await sock.sendMessage(config.targetId, payload);
                    state.markSent(item.key);
                    if (item.onSent) item.onSent();
                    console.log(`🔔 Terkirim: ${item.key}`);
                }
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
