const config = require('../config');
const { fmtUsd, fmtIdr, fmtPct, coinLink } = require('../utils');
const groqAI = require('./groqAI');

// Command patterns
const COMMANDS = {
    '!price': handlePriceCommand,
    '!check': handlePriceCommand,
    '!help': handleHelpCommand,
    '!top': handleTopMoversCommand,
    '!fng': handleFearGreedCommand,
    '!analisis': handleAnalysisCommand
};

async function handleCommand(message, ctx) {
    const text = message.body?.trim() || '';
    if (!text.startsWith('!')) return null;

    const parts = text.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    const handler = COMMANDS[command];
    if (!handler) {
        // If AI is enabled, try to handle unknown commands conversationally
        if (config.groq?.enabled && config.groq?.conversational && groqAI.isAvailable()) {
            try {
                const aiResponse = await groqAI.conversationalResponse(text, ctx);
                if (aiResponse) return aiResponse;
            } catch (error) {
                console.warn('⚠️ AI conversational response failed:', error.message);
            }
        }
        return null;
    }

    try {
        return await handler(args, ctx);
    } catch (error) {
        console.error(`Error handling command ${command}:`, error.message);
        return `❌ Error processing command. Try !help`;
    }
}

async function handlePriceCommand(args, ctx) {
    if (args.length === 0) {
        return '❌ Usage: !price <coin> or !check <coin>\nExample: !price btc';
    }

    const query = args[0].toUpperCase();
    
    // If no market data available, provide a simple response
    if (!ctx.coins || ctx.coins.length === 0) {
        return `❌ Market data not available. Please try again later.\n\nMonitored coins: BTC, ETH, SOL, BNB, XRP, ADA, DOGE, LINK, AVAX, DOT, MATIC, TON`;
    }

    const coin = ctx.coins.find(c => 
        c.ticker === query || 
        c.id === query.toLowerCase() ||
        c.name.toLowerCase() === query.toLowerCase()
    );

    if (!coin) {
        return `❌ Coin "${query}" not found in watchlist.\n\nAvailable: ${ctx.coins.map(c => c.ticker).join(', ')}`;
    }

    const idr = coin.idr > 0 ? ` (~${fmtIdr(coin.idr)})` : '';
    const p1 = coin.pct1h != null ? fmtPct(coin.pct1h) : '—';
    const p24 = coin.pct24h != null ? fmtPct(coin.pct24h) : '—';
    const vol = coin.total_volume != null ? fmtUsd(coin.total_volume) : '—';
    const cap = coin.market_cap != null ? fmtUsd(coin.market_cap) : '—';

    return (
`💰 *${coin.ticker} - ${coin.name}*
Price: \`${fmtUsd(coin.usd)} USD\`${idr}
1H: ${p1} | 24H: ${p24}
Vol: ${vol} | Cap: ${cap}
🔗 ${coinLink(coin.id)}`);
}

async function handleHelpCommand(args, ctx) {
    return (
`🤖 *Available Commands:*

📊 *Price Check:*
• !price <coin> - Get current price
• !check <coin> - Same as !price
  Example: !price btc

📈 *Market Info:*
• !top - Show top movers
• !fng - Fear & Greed index

🧠 *AI Analysis:*
• !analisis <coin> - AI-powered market analysis
  Example: !analisis btc

💡 *Tips:*
• Use coin symbols (BTC, ETH, SOL, etc.)
• Commands work in private chat and groups
• AI features require Groq API key
• Save this bot number for quick access!`);
}

async function handleTopMoversCommand(args, ctx) {
    if (!ctx.coins || ctx.coins.length === 0) {
        return '❌ Market data not available. Please try again later.';
    }

    const gainers = ctx.coins
        .filter(c => c.pct24h != null && c.pct24h > 0)
        .sort((a, b) => b.pct24h - a.pct24h)
        .slice(0, 3);

    const losers = ctx.coins
        .filter(c => c.pct24h != null && c.pct24h < 0)
        .sort((a, b) => a.pct24h - b.pct24h)
        .slice(0, 3);

    const gainRows = gainers.map((c) => `• ${c.ticker}: *${fmtPct(c.pct24h)}*`).join('\n');
    const loseRows = losers.map((c) => `• ${c.ticker}: *${fmtPct(c.pct24h)}*`).join('\n');

    return (
`📈 *TOP MOVERS 24H*
🏆 ${gainRows || '• N/A'}

📉 ${loseRows || '• N/A'}`);
}

async function handleFearGreedCommand(args, ctx) {
    const f = ctx.fng;
    if (!f) {
        return '❌ Fear & Greed data not available';
    }

    const emoji = f.value <= 25 ? '😨' : f.value >= 75 ? '🤑' : '😐';
    return (
`${emoji} *Fear & Greed Index*
Value: *${f.value}/100*
Status: ${f.label}
🔗 https://alternative.me/crypto/fear-and-greed-index/`);
}

async function handleAnalysisCommand(args, ctx) {
    if (args.length === 0) {
        return '❌ Usage: !analisis <coin>\nExample: !analisis btc';
    }

    // Check if AI is available
    if (!config.groq?.enabled || !config.groq?.conversational || !groqAI.isAvailable()) {
        return '❌ AI analysis not available. Please enable Groq AI in configuration.';
    }

    const query = args[0].toUpperCase();
    
    // If no market data available, provide a simple response
    if (!ctx.coins || ctx.coins.length === 0) {
        return `❌ Market data not available. Please try again later.`;
    }

    const coin = ctx.coins.find(c => 
        c.ticker === query || 
        c.id === query.toLowerCase() ||
        c.name.toLowerCase() === query.toLowerCase()
    );

    if (!coin) {
        return `❌ Coin "${query}" not found in watchlist.\n\nAvailable: ${ctx.coins.map(c => c.ticker).join(', ')}`;
    }

    try {
        const marketContext = {
            coin: coin.ticker,
            price: coin.usd,
            move1h: coin.pct1h,
            move24h: coin.pct24h,
            volume: coin.total_volume,
            marketCap: coin.market_cap
        };

        const userQuery = `Analisis ${coin.ticker} - Bullish atau Bearish?`;
        const aiResponse = await groqAI.conversationalResponse(userQuery, { coins: [coin], ...marketContext });
        
        if (aiResponse) {
            return (
`🧠 *AI Analysis - ${coin.ticker}*\n\n${aiResponse}\n\n📊 *Current Data:*\nPrice: \`${fmtUsd(coin.usd)} USD\`\n1H: ${coin.pct1h != null ? fmtPct(coin.pct1h) : '—'} | 24H: ${coin.pct24h != null ? fmtPct(coin.pct24h) : '—'}`);
        } else {
            return '❌ AI analysis failed. Please try again later.';
        }
    } catch (error) {
        console.error('❌ AI analysis error:', error.message);
        return '❌ Error generating AI analysis. Please try again later.';
    }
}

module.exports = { handleCommand, COMMANDS };