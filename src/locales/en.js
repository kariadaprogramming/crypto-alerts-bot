// English templates
const config = require('../config');
const { fmtUsd, fmtIdr, fmtPct, coinLink } = require('../utils');

const PERIOD = { '1h': '1H', '24h': '24H' };

function priceText(c) {
    const idr = c.idr > 0 ? ` (~${fmtIdr(c.idr)})` : '';
    return `\`${fmtUsd(c.usd)} USD\`${idr}`;
}

function pump(c, pct, period) {
    const vol = c.total_volume != null ? `| Vol ${fmtUsd(c.total_volume)}` : '';
    const cap = c.market_cap != null ? `| Cap ${fmtUsd(c.market_cap)}` : '';
    return (
`🚀 *${c.ticker} ${fmtPct(pct)} ${PERIOD[period]}*
${c.name}
Price: ${priceText(c)} ${vol} ${cap}
🔗 ${coinLink(c.id)}`);
}

function dump(c, pct, period) {
    const vol = c.total_volume != null ? `| Vol ${fmtUsd(c.total_volume)}` : '';
    const cap = c.market_cap != null ? `| Cap ${fmtUsd(c.market_cap)}` : '';
    return (
`📉 *${c.ticker} ${fmtPct(pct)} ${PERIOD[period]}*
${c.name}
Price: ${priceText(c)} ${vol} ${cap}
🔗 ${coinLink(c.id)}`);
}

function move(c, pct, period) {
    return pct > 0 ? pump(c, pct, period) : dump(c, pct, period);
}

function milestone(c, up, level) {
    const head = up
        ? `🎯 *${c.ticker} BREAK ${fmtUsd(level)}*`
        : `🎯 *${c.ticker} BELOW ${fmtUsd(level)}*`;
    const ch24 = c.pct24h != null ? ` | 24H ${fmtPct(c.pct24h)}` : '';
    return (
`${head}
Price: ${priceText(c)}${ch24}
🔗 ${coinLink(c.id)}`);
}

function fearGreed(f, zone) {
    const fear = zone === 'fear';
    const label = fear ? 'FEAR' : 'GREED';
    return (
`${fear ? '😨' : '🤑'} *${label} ${f.value}/100*
${f.label}
🔗 https://alternative.me/crypto/fear-and-greed-index/`);
}

function depeg(c) {
    return (
`🚨 *${c.ticker} ${fmtUsd(c.usd)}*
${c.name}
Status: ${c.usd < config.depeg.low ? 'Below $1' : 'Above $1'}
🔗 ${coinLink(c.id)}`);
}

function volume(c, pct, volume) {
    const dir = pct >= 0 ? 'UP' : 'DOWN';
    return (
`📊 *${c.ticker} VOL SPIKE ${dir}*
1H: ${fmtPct(pct)}
Vol: ${fmtUsd(volume)}
Price: ${priceText(c)}
🔗 ${coinLink(c.id)}`);
}

function watchlist(c, pct) {
    return (
`⭐ *${c.ticker} WATCHLIST*
${fmtPct(pct)} | ${priceText(c)}
🔗 ${coinLink(c.id)}`);
}

function topMovers(gainers, losers) {
    const gainRows = gainers.map((c) => `• ${c.ticker}: *${fmtPct(c.pct24h)}*`).join('\n');
    const loseRows = losers.map((c) => `• ${c.ticker}: *${fmtPct(c.pct24h)}*`).join('\n');
    return (
`📈 *TOP MOVERS 24H*
🏆 ${gainRows || '• N/A'}

📉 ${loseRows || '• N/A'}`);
}

function summary(ctx) {
    const rows = ctx.coins.map((c) => {
        const icon = c.pct1h == null ? '➖' : c.pct1h >= 0 ? '🟢' : '🔴';
        const p1 = c.pct1h == null ? '-' : fmtPct(c.pct1h);
        const p24 = c.pct24h == null ? '-' : fmtPct(c.pct24h);
        const idr = c.idr > 0 ? ` (${fmtIdr(c.idr)})` : '';
        return `${icon} *${c.ticker}*: ${fmtUsd(c.usd)}${idr} | 1H ${p1} | 24H ${p24}`;
    });
    const fng = ctx.fng ? `\n🧭 *${ctx.fng.value}/100* (${ctx.fng.label})` : '';
    return `📊 *MARKET SUMMARY*\n${rows.slice(0, 8).join('\n')}${fng}`;
}

function newListing(c) {
    const symbol = c.ticker || c.name.toUpperCase();
    const move1h = c.pct1h != null ? `${fmtPct(c.pct1h)} 1H` : 'NEW';
    const volume = c.total_volume != null ? `Vol ${fmtUsd(c.total_volume)}` : 'Vol —';
    const cap = c.market_cap != null ? `Cap ${fmtUsd(c.market_cap)}` : 'Cap —';
    return (
`🆕 *${symbol}* | ${move1h} | ${volume} | ${cap}\n🔗 ${coinLink(c.id)}`);
}

module.exports = { move, milestone, fearGreed, depeg, summary, volume, watchlist, topMovers, newListing };
