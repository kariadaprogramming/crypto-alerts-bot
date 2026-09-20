// Daftar alert. Urutan penting: alert 1 jam didahulukan dari 24 jam.
// Mau menambah alert baru? Buat file baru di folder ini lalu daftarkan di sini.
module.exports = [
    require('./depeg'),
    require('./move1h'),
    require('./move24h'),
    require('./volume'),
    require('./topmovers'),
    require('./newlisting'),
    require('./watchlist'),
    require('./milestone'),
    require('./feargreed'),
    require('./summary')
];
