const config = require('../config');
const tpl = require('../templates');
const groqAI = require('../services/groqAI');

module.exports = {
    name: 'topMovers',
    enabled: config.topMovers.enabled,
    async run(ctx) {
        const gainers = [...ctx.coins]
            .filter((c) => c.pct24h != null)
            .sort((a, b) => (b.pct24h ?? 0) - (a.pct24h ?? 0))
            .slice(0, config.topMovers.limit);

        const losers = [...ctx.coins]
            .filter((c) => c.pct24h != null)
            .sort((a, b) => (a.pct24h ?? 0) - (b.pct24h ?? 0))
            .slice(0, config.topMovers.limit);

        const hasSignal = gainers.some((c) => (c.pct24h ?? 0) >= config.topMovers.threshold)
            || losers.some((c) => (c.pct24h ?? 0) <= -config.topMovers.threshold);

        if (!hasSignal) return [];

        let aiInsight = '';
        
        // Add AI analysis for top movers if enabled
        if (config.groq?.enabled && config.groq?.marketAnalysis && groqAI.isAvailable()) {
            try {
                const topMoversData = {
                    gainers: gainers.map(c => ({ ticker: c.ticker, change: c.pct24h })),
                    losers: losers.map(c => ({ ticker: c.ticker, change: c.pct24h })),
                    threshold: config.topMovers.threshold
                };
                
                // Use conversational response for market analysis
                const aiResponse = await groqAI.conversationalResponse(
                    `Analisis top movers crypto hari ini. Gainers: ${gainers.map(c => c.ticker).join(', ')}. Losers: ${losers.map(c => c.ticker).join(', ')}. Apa trend market?`,
                    { topMovers: topMoversData }
                );
                
                if (aiResponse) {
                    aiInsight = `\n\n🎯 *Analisis Market AI:* ${aiResponse}`;
                }
            } catch (error) {
                console.warn('⚠️ AI analysis failed for top movers:', error.message);
            }
        }

        const isNewsletter = config.targetId.endsWith('@newsletter');
        return [{
            key: 'topmovers',
            cooldownMs: config.topMovers.cooldownMs,
            text: tpl.topMovers(gainers, losers) + aiInsight,
            mediaType: isNewsletter ? 'none' : 'card'
        }];
    }
};
