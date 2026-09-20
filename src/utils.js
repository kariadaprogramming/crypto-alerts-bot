const config = require('./config');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shortenUrl(url) {
    if (!config.shrinkme.enabled || !config.shrinkme.apiKey) return url;
    if (!url || !/^https?:\/\//i.test(url)) return url;

    try {
        const apiUrl = new URL(config.shrinkme.apiUrl);
        apiUrl.searchParams.set('api', config.shrinkme.apiKey);
        apiUrl.searchParams.set('url', url);
        apiUrl.searchParams.set('format', 'json');

        const res = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) {
            console.warn('⚠️ Shrinkme shortener gagal:', res.status, res.statusText);
            return url;
        }

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        const candidate =
            (data && data.shortenedURL) ||
            (data && data.shortenedUrl) ||
            (data && data.short_url) ||
            (data && data.shortUrl) ||
            (data && data.link) ||
            (data && data.url) ||
            (typeof data === 'string' ? data : null);

        if (candidate && String(candidate).startsWith('http')) return candidate;
        if (data && data.status === 'success' && data.result) return data.result;
        return url;
    } catch (error) {
        console.warn('⚠️ Shrinkme error:', error.message);
        return url;
    }
}

async function applyShortLinksToText(text) {
    if (!text || !config.shrinkme.enabled || !config.shrinkme.apiKey) return text;

    const matches = [...new Set(String(text).match(/https?:\/\/[^\s)]+/g) || [])];
    if (!matches.length) return text;

    let out = text;
    for (const url of matches) {
        const short = await shortenUrl(url);
        out = out.replace(url, short);
    }
    return out;
}

function fmtUsd(v) {
    const digits = v >= 100 ? 0 : v >= 2 ? 2 : 4;
    return '$' + v.toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });
}

function fmtIdr(v) {
    return 'Rp ' + Math.round(v).toLocaleString('id-ID');
}

function fmtPct(v) {
    return (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
}

function coinLink(id) {
    return `https://www.coingecko.com/en/coins/${id}`;
}

// Tanggal & jam saat ini menurut TIMEZONE di .env
function nowInZone() {
    const now = new Date();
    const hour = Number(now.toLocaleString('en-US', {
        timeZone: config.timezone, hour: 'numeric', hour12: false
    })) % 24;
    const day = now.toLocaleDateString('en-CA', { timeZone: config.timezone });
    return { day, hour };
}

module.exports = { sleep, fmtUsd, fmtIdr, fmtPct, coinLink, shortenUrl, applyShortLinksToText, nowInZone };
