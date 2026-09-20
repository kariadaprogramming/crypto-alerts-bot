const config = require('../config');
const tpl = require('../templates');

module.exports = {
    name: 'volume',
    enabled: config.volume.enabled,
    run(ctx) {
        const items = [];
        for (const c of ctx.coins) {
            if (c.stable || c.pct1h == null || c.total_volume == null) continue;
            const absMove = Math.abs(c.pct1h);
            if (absMove >= config.volume.minMovePct && c.total_volume >= config.volume.minUsd) {
                items.push({
                    key: `volume:${c.id}`,
                    cooldownMs: config.volume.cooldownMs,
                    text: tpl.volume(c, c.pct1h, c.total_volume)
                });
            }
        }
        return items;
    }
};
