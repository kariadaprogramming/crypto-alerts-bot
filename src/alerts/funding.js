const config = require('../config');
const tpl = require('../templates');
const groqAI = require('../services/groqAI');

module.exports = {
    name: 'funding',
    enabled: config.funding?.enabled || false,
    async run(ctx) {
        const items = [];
        // Funding rate alerts would typically come from exchange API
        // This is a placeholder structure for when funding data is available
        for (const fund of ctx.fundingRates || []) {
            const threshold = config.funding?.thresholdPct || 0.1;
            const isExtreme = Math.abs(fund.rate) >= threshold;
            
            if (isExtreme) {
                let aiSentiment = '';
                
                // Add AI contrarian sentiment analysis if enabled
                if (config.groq?.enabled && config.groq?.fundingSentiment && groqAI.isAvailable()) {
                    try {
                        const fundingData = {
                            ...fund,
                            avgRate: 0.01, // Simulated average rate
                            timestamp: new Date().toISOString()
                        };
                        aiSentiment = await groqAI.analyzeFundingSentiment(fundingData);
                        if (aiSentiment) {
                            aiSentiment = `\n\n📊 *Analisis Sentiment:* ${aiSentiment}`;
                        }
                    } catch (error) {
                        console.warn(`⚠️ AI sentiment analysis failed for ${fund.coin}:`, error.message);
                    }
                }

                items.push({
                    key: `funding:${fund.coin}:${fund.exchange}`,
                    group: `funding:${fund.coin}`,
                    cooldownMs: config.funding?.cooldownMs || 60 * 60 * 1000,
                    text: tpl.fundingRateAlert(fund) + aiSentiment,
                    mediaType: 'card'
                });
            }
        }
        return items;
    }
};