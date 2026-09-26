const config = require('../config');
const tpl = require('../templates');
const groqAI = require('../services/groqAI');

module.exports = {
    name: 'volume',
    enabled: config.volume.enabled,
    async run(ctx) {
        const items = [];
        for (const c of ctx.coins) {
            if (c.stable || c.pct1h == null || c.total_volume == null) continue;
            const absMove = Math.abs(c.pct1h);
            if (absMove >= config.volume.minMovePct && c.total_volume >= config.volume.minUsd) {
                let aiInsight = '';
                
                // Add AI analysis for volume spike if enabled
                if (config.groq?.enabled && config.groq?.breakoutAnalysis && groqAI.isAvailable()) {
                    try {
                        const breakoutData = {
                            level: c.usd,
                            direction: c.pct1h >= 0 ? 'resistance' : 'support',
                            timeframe: '1h',
                            volumeIncrease: 'high',
                            previousAttempts: Math.floor(Math.random() * 3) // Simulated data
                        };
                        aiInsight = await groqAI.analyzeBreakout(c, breakoutData);
                        if (aiInsight) {
                            aiInsight = `\n\n🔍 *Analisis Volume:* ${aiInsight}`;
                        }
                    } catch (error) {
                        console.warn(`⚠️ AI analysis failed for ${c.ticker} volume:`, error.message);
                    }
                }

                const isNewsletter = config.targetId.endsWith('@newsletter');
                items.push({
                    key: `volume:${c.id}`,
                    cooldownMs: config.volume.cooldownMs,
                    text: tpl.volume(c, c.pct1h, c.total_volume) + aiInsight,
                    mediaType: isNewsletter ? 'none' : 'card'
                });
            }
        }
        return items;
    }
};
