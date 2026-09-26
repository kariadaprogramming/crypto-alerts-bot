const config = require('../config');
const tpl = require('../templates');
const groqAI = require('../services/groqAI');

module.exports = {
    name: 'move1h',
    enabled: config.move1h.enabled,
    async run(ctx) {
        const items = [];
        for (const c of ctx.coins) {
            if (c.stable || c.pct1h == null) continue;
            if (Math.abs(c.pct1h) >= config.move1h.threshold) {
                let aiInsight = '';
                
                // Add AI analysis if enabled and available
                if (config.groq?.enabled && config.groq?.marketAnalysis && groqAI.isAvailable()) {
                    try {
                        const moveData = {
                            timeframe: '1h',
                            change: c.pct1h
                        };
                        aiInsight = await groqAI.analyzeMarketMove(c, moveData);
                        if (aiInsight) {
                            aiInsight = `\n\n💡 *Analisis AI:* ${aiInsight}`;
                        }
                    } catch (error) {
                        console.warn(`⚠️ AI analysis failed for ${c.ticker}:`, error.message);
                    }
                }

                items.push({
                    key: `move1h:${c.id}`,
                    group: `move:${c.id}`,
                    cooldownMs: config.move1h.cooldownMs,
                    text: tpl.move(c, c.pct1h, '1h') + aiInsight,
                    mediaType: 'card'
                });
            }
        }
        return items;
    }
};
