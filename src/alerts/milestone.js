const config = require('../config');
const state = require('../services/state');
const tpl = require('../templates');
const groqAI = require('../services/groqAI');

// Alert saat harga melewati kelipatan `step` (lihat src/config.js).
// Level terakhir disimpan di state.json, jadi tidak spam setelah restart.
module.exports = {
    name: 'milestone',
    enabled: config.milestone.enabled,
    async run(ctx) {
        const items = [];
        for (const c of ctx.coins) {
            if (!c.step) continue;

            const zone = Math.floor(c.usd / c.step);
            const last = state.getZone(c.id);

            if (last === undefined) { // pertama kali: catat saja, jangan alert
                state.setZone(c.id, zone);
                continue;
            }
            if (zone === last) continue;

            const up = zone > last;
            const level = up ? zone * c.step : (zone + 1) * c.step;
            
            let aiInsight = '';
            
            // Add AI analysis for milestone if enabled
            if (config.groq?.enabled && config.groq?.marketAnalysis && groqAI.isAvailable()) {
                try {
                    const moveData = {
                        timeframe: 'milestone',
                        change: up ? 'up' : 'down',
                        level: level,
                        isMilestone: true
                    };
                    aiInsight = await groqAI.analyzeMarketMove(c, moveData);
                    if (aiInsight) {
                        aiInsight = `\n\n🎯 *Analisis Milestone AI:* ${aiInsight}`;
                    }
                } catch (error) {
                    console.warn(`⚠️ AI analysis failed for ${c.ticker} milestone:`, error.message);
                }
            }

            const isNewsletter = config.targetId.endsWith('@newsletter');
            items.push({
                key: `milestone:${c.id}`,
                cooldownMs: config.milestone.cooldownMs,
                text: tpl.milestone(c, up, level) + aiInsight,
                mediaType: isNewsletter ? 'none' : 'card',
                // level baru dicatat hanya kalau alert benar-benar terkirim
                onSent: () => state.setZone(c.id, zone)
            });
        }
        return items;
    }
};
