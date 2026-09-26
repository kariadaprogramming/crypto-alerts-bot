const config = require('../config');
const tpl = require('../templates');
const groqAI = require('../services/groqAI');

module.exports = {
    name: 'breakout',
    enabled: config.breakout?.enabled || false,
    async run(ctx) {
        const items = [];
        // Breakout alerts would be calculated from price data
        // This is a placeholder structure for when breakout detection is implemented
        for (const c of ctx.coins) {
            if (c.breakout) {
                let aiInsight = '';
                
                // Add AI analysis for breakout if enabled
                if (config.groq?.enabled && config.groq?.breakoutAnalysis && groqAI.isAvailable()) {
                    try {
                        aiInsight = await groqAI.analyzeBreakout(c, c.breakout);
                        if (aiInsight) {
                            aiInsight = `\n\n🎯 *Analisis Breakout:* ${aiInsight}`;
                        }
                    } catch (error) {
                        console.warn(`⚠️ AI analysis failed for ${c.ticker} breakout:`, error.message);
                    }
                }

                const isNewsletter = config.targetId.endsWith('@newsletter');
                items.push({
                    key: `breakout:${c.id}:${c.breakout.level}`,
                    group: `breakout:${c.id}`,
                    cooldownMs: config.breakout?.cooldownMs || 4 * 60 * 60 * 1000,
                    text: tpl.breakoutAlert(c, c.breakout) + aiInsight,
                    mediaType: isNewsletter ? 'none' : 'card'
                });
            }
        }
        return items;
    }
};