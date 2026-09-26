const config = require('../config');
const tpl = require('../templates');
const groqAI = require('../services/groqAI');

module.exports = {
    name: 'whale',
    enabled: config.whale?.enabled || false,
    async run(ctx) {
        const items = [];
        // Whale alerts would typically come from external API
        // This is a placeholder structure for when whale data is available
        for (const whale of ctx.whaleAlerts || []) {
            if (whale.usdValue >= (config.whale?.minUsd || 1000000)) {
                let aiAnalysis = '';
                
                // Add AI analysis connecting whale to market impact if enabled
                if (config.groq?.enabled && config.groq?.whaleLiquidation && groqAI.isAvailable()) {
                    try {
                        // Look for related liquidations in context
                        const relatedLiquidations = (ctx.liquidations || []).filter(
                            liq => liq.coin === whale.coin && Math.abs(liq.timestamp - whale.timestamp) < 300000 // 5 minutes
                        );
                        
                        if (relatedLiquidations.length > 0) {
                            aiAnalysis = await groqAI.connectWhaleToLiquidation(whale, relatedLiquidations[0]);
                            if (aiAnalysis) {
                                aiAnalysis = `\n\n🐋 *Analisis Whale:* ${aiAnalysis}`;
                            }
                        }
                    } catch (error) {
                        console.warn(`⚠️ AI analysis failed for whale alert:`, error.message);
                    }
                }

                items.push({
                    key: `whale:${whale.txHash || whale.id}`,
                    group: `whale:${whale.coin}`,
                    cooldownMs: config.whale?.cooldownMs || 30 * 60 * 1000,
                    text: tpl.whaleTracker(whale) + aiAnalysis,
                    mediaType: 'card'
                });
            }
        }
        return items;
    }
};