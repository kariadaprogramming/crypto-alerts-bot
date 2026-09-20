const config = require('../config');
const state = require('../services/state');
const tpl = require('../templates');
const { nowInZone } = require('../utils');

module.exports = {
    name: 'summary',
    enabled: config.summary.enabled,
    run(ctx) {
        const { day, hour } = nowInZone();
        if (!config.summary.hours.includes(hour)) return [];

        const slot = `${day}-${hour}`;
        if (state.getSummarySlot() === slot) return []; // slot ini sudah terkirim

        return [{
            key: 'summary',
            cooldownMs: 0,
            text: tpl.summary(ctx),
            onSent: () => state.setSummarySlot(slot)
        }];
    }
};
