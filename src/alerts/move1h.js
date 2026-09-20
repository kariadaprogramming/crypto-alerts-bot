const config = require('../config');
const tpl = require('../templates');

module.exports = {
    name: 'move1h',
    enabled: config.move1h.enabled,
    run(ctx) {
        const items = [];
        for (const c of ctx.coins) {
            if (c.stable || c.pct1h == null) continue;
            if (Math.abs(c.pct1h) >= config.move1h.threshold) {
                items.push({
                    key: `move1h:${c.id}`,
                    group: `move:${c.id}`,
                    cooldownMs: config.move1h.cooldownMs,
                    text: tpl.move(c, c.pct1h, '1h')
                });
            }
        }
        return items;
    }
};
