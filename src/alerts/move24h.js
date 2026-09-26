const config = require('../config');
const tpl = require('../templates');
const groqAI = require('../services/groqAI');

module.exports = {
    name: 'move24h',
    enabled: config.move24h.enabled,
    async run(ctx) {
        const items = [];
        for (const c of ctx.coins) {
            if (c.stable || c.pct24h == null) continue;
            if (Math.abs(c.pct24h) >= config.move24h.threshold) {
                let aiInsight = '';
                
                // Add AI analysis if enabled and available
                if (config.groq?.enabled && config.groq?.marketAnalysis && groqAI.isAvailable()) {
                    try {
                        const moveData = {
                            timeframe: '24h',
                            change: c.pct24h
                        };
                        aiInsight = await groqAI.analyzeMarketMove(c, moveData);
                        if (aiInsight) {
                            aiInsight = `\n\n💡 *Analisis AI:* ${aiInsight}`;
                        }
                    } catch (error) {
                        console.warn(`⚠️ AI analysis failed for ${c.ticker}:`, error.message);
                    }
                }

                const isNewsletter = config.targetId.endsWith('@newsletter');
                items.push({
                    key: `move24h:${c.id}`,
                    group: `move:${c.id}`, // kalau alert 1 jam sudah keluar, yang 24 jam dilewati
                    cooldownMs: config.move24h.cooldownMs,
                    text: tpl.move(c, c.pct24h, '24h') + aiInsight,
                    mediaType: isNewsletter ? 'none' : 'card'
                });
            }
        }
        return items;
    }
};
