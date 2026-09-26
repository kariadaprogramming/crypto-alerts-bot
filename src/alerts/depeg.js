const config = require('../config');
const tpl = require('../templates');
const groqAI = require('../services/groqAI');

module.exports = {
    name: 'depeg',
    enabled: config.depeg.enabled,
    async run(ctx) {
        const items = [];
        for (const c of ctx.coins) {
            if (!c.stable) continue;
            if (c.usd < config.depeg.low || c.usd > config.depeg.high) {
                let aiUrgency = '';
                
                // Add AI urgency assessment if enabled
                if (config.groq?.enabled && config.groq?.depegUrgency && groqAI.isAvailable()) {
                    try {
                        const stablecoinData = {
                            ...c,
                            deviation: Math.abs(c.usd - 1),
                            timestamp: new Date().toISOString()
                        };
                        aiUrgency = await groqAI.assessDepegUrgency(stablecoinData);
                        if (aiUrgency) {
                            aiUrgency = `\n\n${aiUrgency}`;
                        }
                    } catch (error) {
                        console.warn(`⚠️ AI urgency assessment failed for ${c.ticker}:`, error.message);
                    }
                }

                const isNewsletter = config.targetId.endsWith('@newsletter');
                items.push({
                    key: `depeg:${c.id}`,
                    cooldownMs: config.depeg.cooldownMs,
                    text: tpl.depeg(c) + aiUrgency,
                    mediaType: isNewsletter ? 'none' : 'card'
                });
            }
        }
        return items;
    }
};
