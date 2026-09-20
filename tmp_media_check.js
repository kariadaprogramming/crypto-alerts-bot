const { generateCustomCard } = require('./src/services/media');

(async () => {
  const img = await generateCustomCard({
    ticker: 'PEPE',
    name: 'Pepe',
    usd: 0.000012,
    pct1h: 5.2,
    pct24h: 8.4,
    total_volume: 8200000,
    market_cap: 35000000,
    caption: 'NEW LISTING'
  });
  console.log('card-bytes', img.length);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
