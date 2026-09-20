const config = require('../config');
const tpl = require('../templates');

module.exports = {
    name: 'feargreed',
    enabled: config.fng.enabled,
    run(ctx) {
        const f = ctx.fng;
        if (!f) return [];
        if (f.value <= config.fng.fearMax) {
            return [{ key: 'fng:fear', cooldownMs: config.fng.cooldownMs, text: tpl.fearGreed(f, 'fear') }];
        }
        if (f.value >= config.fng.greedMin) {
            return [{ key: 'fng:greed', cooldownMs: config.fng.cooldownMs, text: tpl.fearGreed(f, 'greed') }];
        }
        return [];
    }
};
