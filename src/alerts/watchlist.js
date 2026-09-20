const config = require('../config');
const tpl = require('../templates');

module.exports = {
    name: 'watchlist',
    enabled: config.watchlist.enabled,
    run(ctx) {
        const items = [];
        const watchlist = new Set(config.watchlist.coins.map((x) => x.toUpperCase()));

        for (const c of ctx.coins) {
            if (!watchlist.has(c.ticker.toUpperCase()) && !watchlist.has(String(c.id || '').toUpperCase())) continue;
            if (c.pct1h == null) continue;
            if (Math.abs(c.pct1h) >= config.watchlist.threshold) {
                items.push({
                    key: `watchlist:${c.id}`,
                    cooldownMs: config.watchlist.cooldownMs,
                    text: tpl.watchlist(c, c.pct1h)
                });
            }
        }
        return items;
    }
};
