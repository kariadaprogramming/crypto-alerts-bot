const config = require('../config');
const tpl = require('../templates');
const groqAI = require('../services/groqAI');

module.exports = {
    name: 'liquidation',
    enabled: config.liquidation?.enabled || false,
    async run(ctx) {
        const items = [];
        // Liquidation alerts would typically come from external API
        // This is a placeholder structure for when liquidation data is available
        for (const liq of ctx.liquidations || []) {
            if (liq.usdValue >= (config.liquidation?.minUsd || 10000000)) {
                let aiAnalysis = '';
                
                // Add AI analysis for liquidation if enabled
                if (config.groq?.enabled && config.groq?.whaleLiquidation && groqAI.isAvailable()) {
                    try {
                        // Look for related whale transactions in context
                        const relatedWhales = (ctx.whaleAlerts || []).filter(
                            whale => whale.coin === liq.coin && Math.abs(whale.timestamp - liq.timestamp) < 300000 // 5 minutes
                        );
                        
                        if (relatedWhales.length > 0) {
                            aiAnalysis = await groqAI.connectWhaleToLiquidation(relatedWhales[0], liq);
                            if (aiAnalysis) {
                                aiAnalysis = `\n\n🩸 *Analisis Likuidasi:* ${aiAnalysis}`;
                            }
                        } else {
                            // Provide standalone liquidation analysis
                            aiAnalysis = await groqAI.connectWhaleToLiquidation({}, liq);
                            if (aiAnalysis) {
                                aiAnalysis = `\n\n🩸 *Analisis Likuidasi:* ${aiAnalysis}`;
                            }
                        }
                    } catch (error) {
                        console.warn(`⚠️ AI analysis failed for liquidation alert:`, error.message);
                    }
                }

                const isNewsletter = config.targetId.endsWith('@newsletter');
                items.push({
                    key: `liquidation:${liq.id}`,
                    group: `liquidation:${liq.coin}`,
                    cooldownMs: config.liquidation?.cooldownMs || 60 * 60 * 1000,
                    text: tpl.liquidationAlert(liq) + aiAnalysis,
                    mediaType: isNewsletter ? 'none' : 'card'
                });
            }
        }
        return items;
    }
};