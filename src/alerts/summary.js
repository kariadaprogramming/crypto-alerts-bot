const config = require('../config');
const state = require('../services/state');
const tpl = require('../templates');
const { nowInZone } = require('../utils');
const groqAI = require('../services/groqAI');

module.exports = {
    name: 'summary',
    enabled: config.summary.enabled,
    async run(ctx) {
        const { day, hour } = nowInZone();
        if (!config.summary.hours.includes(hour)) return [];

        const slot = `${day}-${hour}`;
        if (state.getSummarySlot() === slot) return []; // slot ini sudah terkirim

        let aiBriefing = '';
        
        // Add AI-generated market briefing with persona if enabled
        if (config.groq?.enabled && config.groq?.marketBriefing && groqAI.isAvailable()) {
            try {
                const marketData = {
                    coins: ctx.coins.map(c => ({
                        ticker: c.ticker,
                        price: c.usd,
                        move1h: c.pct1h,
                        move24h: c.pct24h
                    })),
                    fearGreed: ctx.fng,
                    timestamp: new Date().toISOString()
                };
                
                const persona = config.groq?.briefingPersona || 'pragmatic';
                aiBriefing = await groqAI.generateMarketBriefing(marketData, persona);
                
                if (aiBriefing) {
                    aiBriefing = `\n\n🎙️ *${persona.charAt(0).toUpperCase() + persona.slice(1)} Take:*\n${aiBriefing}`;
                }
            } catch (error) {
                console.warn('⚠️ AI market briefing failed:', error.message);
            }
        }

        // Daily Market Briefing - includes Fear & Greed (merged per WhatsApp optimization)
        const isNewsletter = config.targetId.endsWith('@newsletter');
        return [{
            key: 'summary',
            cooldownMs: 0,
            text: tpl.summary(ctx) + aiBriefing,
            mediaType: isNewsletter ? 'none' : 'card', // Newsletter tidak support image
            onSent: () => state.setSummarySlot(slot)
        }];
    }
};
