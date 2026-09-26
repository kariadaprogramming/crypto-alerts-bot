const config = require('../config');
const tpl = require('../templates');
const groqAI = require('../services/groqAI');

module.exports = {
    name: 'feargreed',
    enabled: config.fng.enabled,
    async run(ctx) {
        const f = ctx.fng;
        if (!f) return [];
        
        let aiInsight = '';
        const zone = f.value <= config.fng.fearMax ? 'fear' : (f.value >= config.fng.greedMin ? 'greed' : null);
        
        if (zone) {
            // Add AI analysis for fear & greed if enabled
            if (config.groq?.enabled && config.groq?.marketAnalysis && groqAI.isAvailable()) {
                try {
                    const marketData = {
                        fearGreed: f,
                        zone: zone,
                        coins: ctx.coins.slice(0, 5).map(c => ({
                            ticker: c.ticker,
                            change: c.pct24h
                        }))
                    };
                    
                    const aiResponse = await groqAI.conversationalResponse(
                        `Fear & Greed Index saat ini ${f.value} (${zone}). Apa implikasinya untuk market?`,
                        { fearGreed: marketData }
                    );
                    
                    if (aiResponse) {
                        aiInsight = `\n\n🧭 *Analisis Sentiment AI:* ${aiResponse}`;
                    }
                } catch (error) {
                    console.warn('⚠️ AI analysis failed for fear & greed:', error.message);
                }
            }
            
            const isNewsletter = config.targetId.endsWith('@newsletter');
            return [{ 
                key: `fng:${zone}`, 
                cooldownMs: config.fng.cooldownMs, 
                text: tpl.fearGreed(f, zone) + aiInsight,
                mediaType: isNewsletter ? 'none' : 'card'
            }];
        }
        return [];
    }
};
