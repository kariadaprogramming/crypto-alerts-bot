const sharp = require('sharp');
const { chromium } = require('playwright');
const config = require('../config');
const groqAI = require('./groqAI');

function toTitleCase(value) {
    return String(value || '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Crypto';
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function safeText(value, fallback = '-') {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
}

function buildCardSvg(item) {
    const ticker = safeText(item.ticker || item.symbol || item.coin || 'CRYPTO', 'CRYPTO');
    const name = safeText(item.name || toTitleCase(item.id || ticker), 'Crypto');
    const price = safeText(item.usd != null ? `$${Number(item.usd).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—', '—');
    const pct1h = item.pct1h != null ? Number(item.pct1h) : null;
    const pct24h = item.pct24h != null ? Number(item.pct24h) : null;
    const volume = item.total_volume != null ? `$${Number(item.total_volume).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—';
    const cap = item.market_cap != null ? `$${Number(item.market_cap).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—';
    const move1h = pct1h == null ? '—' : `${pct1h >= 0 ? '+' : ''}${pct1h.toFixed(2)}%`;
    const move24h = pct24h == null ? '—' : `${pct24h >= 0 ? '+' : ''}${pct24h.toFixed(2)}%`;
    
    // Determine direction based on alert type
    let direction = 'neutral';
    if (item.alertType === 'whale') direction = item.direction === 'in' ? 'bullish' : 'bearish';
    else if (item.alertType === 'liquidation') direction = item.type === 'long' ? 'bearish' : 'bullish';
    else if (item.alertType === 'funding') direction = item.rate >= 0 ? 'bullish' : 'bearish';
    else if (item.alertType === 'breakout') direction = item.direction === 'resistance' ? 'bullish' : 'bearish';
    else if (pct1h != null) direction = pct1h >= 0 ? 'bullish' : 'bearish';
    
    const bg = direction === 'bullish' ? '#071b13' : direction === 'bearish' ? '#1b0b0d' : '#0b0e14';
    const accent = direction === 'bullish' ? '#18d58f' : direction === 'bearish' ? '#ff5d73' : '#4a9eff';
    const glow = direction === 'bullish' ? '#0ef3a6' : direction === 'bearish' ? '#ff6b7d' : '#6bb3ff';
    const caption = item.caption || 'CRYPTO ALERT';

    const svg = `
    <svg width="${config.media.cardWidth}" height="${config.media.cardHeight}" viewBox="0 0 ${config.media.cardWidth} ${config.media.cardHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bg}"/>
          <stop offset="100%" stop-color="#090d16"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="${glow}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect x="48" y="48" width="1104" height="579" rx="28" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)"/>
      <text x="70" y="110" font-size="26" fill="#d9e5f6" font-family="Arial, sans-serif" letter-spacing="2">${caption}</text>
      <text x="70" y="200" font-size="62" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">${ticker}</text>
      <text x="70" y="250" font-size="26" fill="#cfe0ff" font-family="Arial, sans-serif">${name}</text>
      <rect x="70" y="300" width="370" height="80" rx="18" fill="rgba(255,255,255,0.06)"/>
      <text x="90" y="350" font-size="22" fill="#9fc0ff" font-family="Arial, sans-serif">PRICE</text>
      <text x="90" y="370" font-size="36" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">${price}</text>

      <rect x="470" y="300" width="240" height="80" rx="18" fill="rgba(255,255,255,0.06)"/>
      <text x="490" y="350" font-size="22" fill="#9fc0ff" font-family="Arial, sans-serif">1H</text>
      <text x="490" y="370" font-size="34" font-weight="700" fill="${accent}" font-family="Arial, sans-serif">${move1h}</text>

      <rect x="740" y="300" width="240" height="80" rx="18" fill="rgba(255,255,255,0.06)"/>
      <text x="760" y="350" font-size="22" fill="#9fc0ff" font-family="Arial, sans-serif">24H</text>
      <text x="760" y="370" font-size="34" font-weight="700" fill="${accent}" font-family="Arial, sans-serif">${move24h}</text>

      <rect x="70" y="430" width="470" height="110" rx="18" fill="rgba(255,255,255,0.06)"/>
      <text x="90" y="472" font-size="19" fill="#9fc0ff" font-family="Arial, sans-serif">VOLUME</text>
      <text x="90" y="510" font-size="30" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">${volume}</text>

      <rect x="560" y="430" width="470" height="110" rx="18" fill="rgba(255,255,255,0.06)"/>
      <text x="580" y="472" font-size="19" fill="#9fc0ff" font-family="Arial, sans-serif">MARKET CAP</text>
      <text x="580" y="510" font-size="30" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">${cap}</text>

      <rect x="92" y="560" width="1000" height="8" rx="4" fill="url(#accent)" opacity="0.9"/>
      
      <!-- Watermark / Branding -->
      <text x="1140" y="650" font-size="14" fill="#4a5a7a" font-family="Arial, sans-serif" text-anchor="end">FreeCryptoAlert</text>
    </svg>
    `;

    return Buffer.from(svg);
}

async function generateCustomCard(item) {
    if (!config.media.customCardsEnabled) return null;
    const svg = buildCardSvg(item);
    const png = await sharp(svg)
        .resize(config.media.cardWidth, config.media.cardHeight)
        .png({ quality: 90 })
        .toBuffer();
    return png;
}

async function capturePageScreenshot(url) {
    if (!config.media.screenshotEnabled) return null;
    if (!url || !/^https?:\/\//i.test(url)) return null;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: config.media.screenshotTimeoutMs });
        await page.waitForTimeout(1500);
        return await page.screenshot({ type: 'png', fullPage: false });
    } finally {
        await browser.close();
    }
}

async function buildAlertMedia(item) {
    if (!item) return null;
    const type = item.mediaType || 'card';

    try {
        let caption = item.text;
        
        // Add AI-generated caption if enabled
        if (config.groq?.enabled && config.groq?.imageCaption && groqAI.isAvailable()) {
            try {
                const aiCaption = await groqAI.generateImageCaption(item);
                if (aiCaption) {
                    caption = `${aiCaption}\n\n${item.text}`;
                }
            } catch (error) {
                console.warn(`⚠️ AI caption generation failed:`, error.message);
            }
        }

        if (type === 'screenshot' || type === 'chart') {
            const img = await capturePageScreenshot(item.mediaUrl || item.url || item.chartUrl);
            if (img) return { image: img, caption: caption };
        }

        if (type === 'card' || type === 'custom-card' || type === 'screenshot' || type === 'chart') {
            const img = await generateCustomCard(item);
            if (img) return { image: img, caption: caption };
        }
    } catch (error) {
        console.warn(`⚠️ Gagal generate media untuk ${item.key || 'alert'}:`, error.message);
    }

    return null;
}

module.exports = { generateCustomCard, capturePageScreenshot, buildAlertMedia };
