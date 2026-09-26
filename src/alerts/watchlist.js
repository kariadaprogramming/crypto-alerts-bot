const config = require('../config');
const tpl = require('../templates');
const groqAI = require('../services/groqAI');

module.exports = {
    name: 'watchlist',
    enabled: config.watchlist.enabled,
    async run(ctx) {
        const items = [];
        const watchlist = new Set(config.watchlist.coins.map((x) => x.toUpperCase()));

        for (const c of ctx.coins) {
            if (!watchlist.has(c.ticker.toUpperCase()) && !watchlist.has(String(c.id || '').toUpperCase())) continue;
            if (c.pct1h == null) continue;
            if (Math.abs(c.pct1h) >= config.watchlist.threshold) {
                let aiInsight = '';
                
                // Add AI analysis for watchlist alerts if enabled
                if (config.groq?.enabled && config.groq?.marketAnalysis && groqAI.isAvailable()) {
                    try {
                        const moveData = {
                            timeframe: '1h',
                            change: c.pct1h,
                            isWatchlist: true
                        };
                        aiInsight = await groqAI.analyzeMarketMove(c, moveData);
                        if (aiInsight) {
                            aiInsight = `\n\n💡 *Analisis AI:* ${aiInsight}`;
                        }
                    } catch (error) {
                        console.warn(`⚠️ AI analysis failed for ${c.ticker} watchlist:`, error.message);
                    }
                }

                const isNewsletter = config.targetId.endsWith('@newsletter');
                items.push({
                    key: `watchlist:${c.id}`,
                    cooldownMs: config.watchlist.cooldownMs,
                    text: tpl.watchlist(c, c.pct1h) + aiInsight,
                    mediaType: isNewsletter ? 'none' : 'card'
                });
            }
        }
        return items;
    }
};
