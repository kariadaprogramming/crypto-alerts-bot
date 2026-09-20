const config = require('../config');
const tpl = require('../templates');

module.exports = {
    name: 'depeg',
    enabled: config.depeg.enabled,
    run(ctx) {
        const items = [];
        for (const c of ctx.coins) {
            if (!c.stable) continue;
            if (c.usd < config.depeg.low || c.usd > config.depeg.high) {
                items.push({
                    key: `depeg:${c.id}`,
                    cooldownMs: config.depeg.cooldownMs,
                    text: tpl.depeg(c)
                });
            }
        }
        return items;
    }
};
