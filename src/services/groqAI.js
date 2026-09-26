const { Groq } = require('groq-sdk');
const config = require('../config');

let groq = null;

// Initialize Groq client
function initGroq() {
    if (!config.groq?.apiKey) {
        console.warn('⚠️ Groq API key not found. AI features will be disabled.');
        return null;
    }
    
    try {
        groq = new Groq({ apiKey: config.groq.apiKey });
        console.log('✅ Groq AI initialized');
        return groq;
    } catch (error) {
        console.error('❌ Failed to initialize Groq:', error.message);
        return null;
    }
}

// System prompts for different AI tasks - HYBRID FORMAT (Indonesia + English technical terms)
const SYSTEM_PROMPTS = {
    market_analysis: `Kamu adalah analis trading crypto yang menggunakan FORMAT HYBRID - bahasa Indonesia santai untuk kalimat pengantar/penutup, tapi istilah teknis dalam bahasa Inggris asli.

Tugasmu: Dari data JSON alert berikut, buatlah analisis sinyal trading dengan format:
🚨 *AI CRYPTO SIGNAL*
Halo traders! AI mendeteksi sinyal potensial:
🟢 Koin: [COIN/USDT]
🟢 Arah: [LONG/SHORT]
🟢 Zona Entry: [Price Range]

*Analisis AI (Technical & Data):*
- Pattern: [English technical term]
- Indicator: [English technical term]  
- Volume: [English technical term]

🎯 Target Take Profit:
- TP 1: [Price]
- TP 2: [Price]

🛑 Stop Loss: [Price]

Disclaimer: Gunakan selalu Risk Management masing-masing ya!

PENTING:
- Maksimal 5 poin analisis
- Data teknis dalam bahasa Inggris (Pattern, Indicator, Volume, dll)
- Kalimat pengantar/penutup dalam bahasa Indonesia santai
- Gunakan emoji (🟢, 🚨, 🎯, 🛑) dan *bold* formatting
- Pendek dan mudah di-scan di WhatsApp`,

    breakout_analysis: `Kamu adalah analis teknikal crypto yang menggunakan FORMAT HYBRID.

Tugasmu: Analisis data harga dan volume untuk menentukan apakah ini fakeout atau real breakout dengan format:
🚨 *BREAKOUT ANALYSIS*
Koin: [COIN] tembus level [LEVEL]
Arah: [RESISTANCE/SUPPORT BREAK]

*Analisis Teknis:*
- Breakout Strength: [X/10]
- Pattern: [English technical term]
- Volume Confirmation: [English technical term]
- Next Key Level: [Price]

🎯 Rekomendasi: [LONG/SHORT/WAIT]

PENTING:
- Data teknis dalam bahasa Inggris
- Kalimat konteks dalam bahasa Indonesia
- Maksimal 4 poin analisis
- Gunakan emoji dan *bold*`,

    depeg_urgency: `Kamu adalah analis risiko stablecoin yang menggunakan FORMAT HYBRID.

Tugasmu: Berikan Urgency/Panic Rating (1-10) untuk depeg stablecoin dengan format:
🚨 *STABLECOIN ALERT*
[COIN] depeg terdeteksi!
Current Price: $[Price]
Deviation: [X%]

*Risk Assessment:*
- Panic Rating: [X/10]
- Market Impact: [English technical term]
- Volume Spike: [English technical term]

⚡ *Langkah Darurat:*
- [Action 1]
- [Action 2]

PENTING:
- Data teknis dalam bahasa Inggris
- Kalimat dalam bahasa Indonesia
- Jangan buat user panik berlebihan
- Maksimal 4 poin`,

    whale_liquidation: `Kamu adalah analis on-chain yang menggunakan FORMAT HYBRID.

Tugasmu: Jelaskan koneksi antara transaksi whale dan likuidasi dengan format:
🐋 *WHALE & LIQUIDATION*
Whale transaction terdeteksi pada [COIN]
Direction: [IN/OUT]
Amount: $[Amount]

*Market Impact:*
- Liquidity Impact: [English technical term]
- Price Reaction: [English technical term]
- Chain Analysis: [English technical term]

🎯 Implikasi: [BULLISH/BEARISH/NEUTRAL]

PENTING:
- Data teknis dalam bahasa Inggris
- Kalimat konteks dalam bahasa Indonesia
- Maksimal 4 poin analisis`,

    funding_sentiment: `Kamu adalah analis derivatif yang menggunakan FORMAT HYBRID.

Tugasmu: Berikan analisis contrarian tentang funding rate ekstrem dengan format:
🔥 *FUNDING RATE ALERT*
[COIN] funding rate ekstrem terdeteksi!
Current Rate: [X%]
Sentiment: [OVERBOUGHT/OVERSOLD]

*Contrarian Analysis:*
- Market Positioning: [English technical term]
- Squeeze Probability: [English technical term]
- Historical Context: [English technical term]

🎯 Rekomendasi: [LONG/SHORT/WAIT]

PENTING:
- Data teknis dalam bahasa Inggris
- Kalimat dalam bahasa Indonesia
- Maksimal 4 poin analisis`,

    market_briefing: `Kamu adalah mentor trading crypto dengan gaya {PERSONA} yang menggunakan FORMAT HYBRID.

Tugasmu: Buat ringkasan pasar harian dengan format:
📊 *MARKET BRIEFING*
Halo traders! Berikut update market hari ini:

*Key Highlights:*
- [English technical term]: [Data]
- [English technical term]: [Data]
- [English technical term]: [Data]

*Top Movers:*
- [COIN]: [X%]
- [COIN]: [X%]

🎯 Fokus hari ini: [English technical term]

PENTING:
- Data teknis dalam bahasa Inggris
- Kalimat dalam bahasa Indonesia dengan gaya {PERSONA}
- Maksimal 5 poin
- Gunakan emoji dan *bold*`,

    conversational: `Kamu adalah asisten crypto yang ramah dan menggunakan FORMAT HYBRID.

Tugasmu: Jawab pertanyaan user dengan cara yang conversational:
🤖 *AI ASSISTANT*
[Pertanyaan user dalam bahasa Indonesia]

*Jawaban:*
- [English technical term]: [Penjelasan]
- [English technical term]: [Penjelasan]

💡 Tips: [Saran dalam bahasa Indonesia]

PENTING:
- Data teknis dalam bahasa Inggris
- Kalimat dalam bahasa Indonesia
- Maksimal 4 poin`,

    smart_summarizer: `Kamu adalah editor konten crypto yang menggunakan FORMAT HYBRID.

Tugasmu: Gabungkan beberapa alert menjadi satu pesan ringkas:
📊 *MARKET SUMMARY*
Multiple alerts terdeteksi dalam waktu singkat!

*Pattern Analysis:*
- [English technical term]: [Data]
- [English technical term]: [Data]

🎯 Kesimpulan: [English technical term]

PENTING:
- Data teknis dalam bahasa Inggris
- Kalimat dalam bahasa Indonesia
- Maksimal 4 poin`,

    image_caption: `Kamu adalah copywriter crypto yang menggunakan FORMAT HYBRID.

Tugasmu: Buat caption menarik untuk gambar chart:
📈 *CHART ANALYSIS*
[COIN] chart pattern terdeteksi!

*Key Points:*
- [English technical term]
- [English technical term]

🎯 Action: [LONG/SHORT/WAIT]

PENTING:
- Data teknis dalam bahasa Inggris
- Kalimat dalam bahasa Indonesia
- Maksimal 3 poin`
};

// AI personas for market briefing - Updated for hybrid format
const PERSONAS = {
    pragmatic: 'Trading Mentor Pragmatis - fokus pada fakta, data teknis dalam English, penjelasan dalam Indonesia',
    degen: 'Crypto Degen - energik, high energy, technical terms dalam English, komentar dalam Indonesia',
    analyst: 'Professional Analyst - formal data dalam English, penjelasan dalam Indonesia',
    casual: 'Sahabat Trader - santai seperti ngobrol, technical terms dalam English, chat dalam Indonesia'
};

async function generateAIResponse(prompt, systemPrompt, temperature = 0.7, maxTokens = 500) {
    if (!groq) {
        console.warn('⚠️ Groq not initialized, skipping AI response');
        return null;
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: config.groq?.model || 'llama-3.3-70b-versatile',
            temperature: temperature,
            max_tokens: maxTokens,
            top_p: 1,
            stream: false
        });

        return chatCompletion.choices[0]?.message?.content || null;
    } catch (error) {
        console.error('❌ Groq API error:', error.message);
        return null;
    }
}

// Specific AI functions for different use cases

async function analyzeMarketMove(coinData, moveData) {
    const prompt = JSON.stringify({
        coin: coinData.ticker,
        name: coinData.name,
        currentPrice: coinData.usd,
        move1h: coinData.pct1h,
        move24h: coinData.pct24h,
        volume: coinData.total_volume,
        marketCap: coinData.market_cap,
        timeframe: moveData.timeframe,
        change: moveData.change
    }, null, 2);

    return generateAIResponse(prompt, SYSTEM_PROMPTS.market_analysis, 0.8, 250);
}

async function analyzeBreakout(coinData, breakoutData) {
    const prompt = JSON.stringify({
        coin: coinData.ticker,
        currentPrice: coinData.usd,
        breakoutLevel: breakoutData.level,
        direction: breakoutData.direction,
        timeframe: breakoutData.timeframe,
        volumeIncrease: breakoutData.volumeIncrease,
        previousAttempts: breakoutData.previousAttempts
    }, null, 2);

    return generateAIResponse(prompt, SYSTEM_PROMPTS.breakout_analysis, 0.7, 200);
}

async function assessDepegUrgency(stablecoinData) {
    const prompt = JSON.stringify({
        coin: stablecoinData.ticker,
        currentPrice: stablecoinData.usd,
        deviation: stablecoinData.deviation,
        volume: stablecoinData.total_volume,
        timestamp: new Date().toISOString()
    }, null, 2);

    return generateAIResponse(prompt, SYSTEM_PROMPTS.depeg_urgency, 0.6, 200);
}

async function connectWhaleToLiquidation(whaleData, liquidationData) {
    const prompt = JSON.stringify({
        whaleTransaction: whaleData,
        liquidationEvent: liquidationData,
        timestamp: new Date().toISOString()
    }, null, 2);

    return generateAIResponse(prompt, SYSTEM_PROMPTS.whale_liquidation, 0.8, 200);
}

async function analyzeFundingSentiment(fundingData) {
    const prompt = JSON.stringify({
        coin: fundingData.coin,
        currentRate: fundingData.rate,
        rateType: fundingData.rate >= 0 ? 'positive' : 'negative',
        exchange: fundingData.exchange,
        avgRate: fundingData.avgRate,
        timestamp: new Date().toISOString()
    }, null, 2);

    return generateAIResponse(prompt, SYSTEM_PROMPTS.funding_sentiment, 0.7, 200);
}

async function generateMarketBriefing(marketData, persona = 'pragmatic') {
    const personaType = PERSONAS[persona] || PERSONAS.pragmatic;
    const systemPrompt = SYSTEM_PROMPTS.market_briefing.replace('{PERSONA}', personaType);
    
    const prompt = JSON.stringify({
        marketData: marketData,
        timestamp: new Date().toISOString(),
        persona: persona
    }, null, 2);

    return generateAIResponse(prompt, systemPrompt, 0.8, 300);
}

async function conversationalResponse(userQuery, marketContext) {
    const prompt = JSON.stringify({
        query: userQuery,
        marketContext: marketContext,
        timestamp: new Date().toISOString()
    }, null, 2);

    return generateAIResponse(prompt, SYSTEM_PROMPTS.conversational, 0.9, 250);
}

async function smartSummarize(alerts) {
    const prompt = JSON.stringify({
        alerts: alerts,
        timestamp: new Date().toISOString()
    }, null, 2);

    return generateAIResponse(prompt, SYSTEM_PROMPTS.smart_summarizer, 0.7, 200);
}

async function generateImageCaption(alertData) {
    const prompt = JSON.stringify({
        alert: alertData,
        timestamp: new Date().toISOString()
    }, null, 2);

    return generateAIResponse(prompt, SYSTEM_PROMPTS.image_caption, 0.8, 150);
}

// Initialize on module load
initGroq();

module.exports = {
    initGroq,
    analyzeMarketMove,
    analyzeBreakout,
    assessDepegUrgency,
    connectWhaleToLiquidation,
    analyzeFundingSentiment,
    generateMarketBriefing,
    conversationalResponse,
    smartSummarize,
    generateImageCaption,
    PERSONAS,
    isAvailable: () => groq !== null
};