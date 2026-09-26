// Pemilih bahasa pesan. Teks ada di src/locales/id.js dan src/locales/en.js.
// Atur lewat LANGUAGE di .env:  id | en | both  (both = Indonesia lalu Inggris)
const config = require('./config');

const locales = {
    id: require('./locales/id'),
    en: require('./locales/en')
};

const SEPARATOR = '\n\n━━━━━━━━━━━━━━━━━━\n\n';

function build(name, ...args) {
    const langs = config.language === 'both' ? ['id', 'en'] : [config.language];
    return langs.map((l) => locales[l][name](...args)).join(SEPARATOR);
}

module.exports = {
    move: (...a) => build('move', ...a),
    milestone: (...a) => build('milestone', ...a),
    fearGreed: (...a) => build('fearGreed', ...a),
    depeg: (...a) => build('depeg', ...a),
    summary: (...a) => build('summary', ...a),
    volume: (...a) => build('volume', ...a),
    watchlist: (...a) => build('watchlist', ...a),
    topMovers: (...a) => build('topMovers', ...a),
    whaleTracker: (...a) => build('whaleTracker', ...a),
    liquidationAlert: (...a) => build('liquidationAlert', ...a),
    fundingRateAlert: (...a) => build('fundingRateAlert', ...a),
    breakoutAlert: (...a) => build('breakoutAlert', ...a)
};
