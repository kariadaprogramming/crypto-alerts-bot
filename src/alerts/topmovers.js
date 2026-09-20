const config = require('../config');
const tpl = require('../templates');

module.exports = {
    name: 'topMovers',
    enabled: config.topMovers.enabled,
    run(ctx) {
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

        return [{
            key: 'topmovers',
            cooldownMs: config.topMovers.cooldownMs,
            text: tpl.topMovers(gainers, losers)
        }];
    }
};
