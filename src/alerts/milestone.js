const config = require('../config');
const state = require('../services/state');
const tpl = require('../templates');

// Alert saat harga melewati kelipatan `step` (lihat src/config.js).
// Level terakhir disimpan di state.json, jadi tidak spam setelah restart.
module.exports = {
    name: 'milestone',
    enabled: config.milestone.enabled,
    run(ctx) {
        const items = [];
        for (const c of ctx.coins) {
            if (!c.step) continue;

            const zone = Math.floor(c.usd / c.step);
            const last = state.getZone(c.id);

            if (last === undefined) { // pertama kali: catat saja, jangan alert
                state.setZone(c.id, zone);
                continue;
            }
            if (zone === last) continue;

            const up = zone > last;
            const level = up ? zone * c.step : (zone + 1) * c.step;

            items.push({
                key: `milestone:${c.id}`,
                cooldownMs: config.milestone.cooldownMs,
                text: tpl.milestone(c, up, level),
                // level baru dicatat hanya kalau alert benar-benar terkirim
                onSent: () => state.setZone(c.id, zone)
            });
        }
        return items;
    }
};
