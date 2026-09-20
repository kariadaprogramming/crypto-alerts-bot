const config = require('../config');
const state = require('../services/state');
const tpl = require('../templates');
const { coinLink } = require('../utils');

module.exports = {
    name: 'newListing',
    enabled: config.newListing.enabled,
    run(ctx) {
        const items = [];
        for (const c of ctx.newListings || []) {
            if (state.getSeenListing(c.id)) continue;
            items.push({
                key: `newlisting:${c.id}`,
                cooldownMs: config.newListing.cooldownMs,
                text: tpl.newListing(c),
                mediaType: 'card',
                mediaUrl: coinLink(c.id),
                onSent: () => state.markSeenListing(c.id)
            });
        }
        return items.slice(0, config.newListing.limit);
    }
};
