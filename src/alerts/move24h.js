const config = require('../config');
const tpl = require('../templates');

module.exports = {
    name: 'move24h',
    enabled: config.move24h.enabled,
    run(ctx) {
        const items = [];
        for (const c of ctx.coins) {
            if (c.stable || c.pct24h == null) continue;
            if (Math.abs(c.pct24h) >= config.move24h.threshold) {
                items.push({
                    key: `move24h:${c.id}`,
                    group: `move:${c.id}`, // kalau alert 1 jam sudah keluar, yang 24 jam dilewati
                    cooldownMs: config.move24h.cooldownMs,
                    text: tpl.move(c, c.pct24h, '24h')
                });
            }
        }
        return items;
    }
};
