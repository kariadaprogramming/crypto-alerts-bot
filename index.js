const config = require('./src/config');
const { startWhatsApp } = require('./src/services/whatsapp');
const { runChecks } = require('./src/services/checker');

let timer = null;

const on = (v) => (v ? 'ON ' : 'OFF');
console.log(`
CRYPTO SIGNAL BOT: ${Object.values(config.coins).map((c) => c.ticker).join(', ')}
  Bahasa          : ${config.language}
  Interval        : ${config.checkIntervalMs / 60000} menit
  Gerak 1 jam     : ${on(config.move1h.enabled)} (>= ${config.move1h.threshold}%)
  Gerak 24 jam    : ${on(config.move24h.enabled)} (>= ${config.move24h.threshold}%)
  Volume spike    : ${on(config.volume.enabled)} (>= ${config.volume.minMovePct}% / ${config.volume.minUsd.toLocaleString('id-ID')} USD)
  Top Movers      : ${on(config.topMovers.enabled)} (>= ${config.topMovers.threshold}%, limit ${config.topMovers.limit})
  Whale Tracker   : ${on(config.whale?.enabled)} (>= $${(config.whale?.minUsd || 0).toLocaleString('id-ID')})
  Liquidation     : ${on(config.liquidation?.enabled)} (>= $${(config.liquidation?.minUsd || 0).toLocaleString('id-ID')})
  Funding Rate    : ${on(config.funding?.enabled)} (>= ${(config.funding?.thresholdPct || 0) * 100}%)
  Breakout        : ${on(config.breakout?.enabled)} (${config.breakout?.timeframe || '4h'})
  Watchlist       : ${on(config.watchlist.enabled)} (${config.watchlist.coins.join(', ')})
  Binance fallback: ${on(config.binance.enabled)}
  Milestone       : ${on(config.milestone.enabled)}
  Depeg USDT      : ${on(config.depeg.enabled)}
  Daily Briefing  : ${on(config.summary.enabled)} (jam ${config.summary.hours.join(', ')} ${config.timezone})
`);

startWhatsApp({
    onOpen: (sock) => {
        clearInterval(timer);
        runChecks(sock);
        timer = setInterval(() => runChecks(sock), config.checkIntervalMs);
    },
    onClose: () => {
        clearInterval(timer); // cegah interval menumpuk
        timer = null;
    }
});
