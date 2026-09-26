const config = require('./src/config');
const { startWhatsApp } = require('./src/services/whatsapp');

console.log('=== TEST KIRIM PESAN KE TARGET ===');
console.log('Target ID:', config.targetId);
console.log('Bahasa:', config.language);
console.log('\nMulai koneksi WhatsApp...');

startWhatsApp({
    onOpen: async (sock) => {
        console.log('✅ WhatsApp terkoneksi!');
        
        // Test kirim pesan sederhana
        const testMessage = `🧪 *TEST PESAN*\n\nIni adalah test pesan dari crypto alerts bot.\nTarget: ${config.targetId}\nWaktu: ${new Date().toLocaleString('id-ID')}`;
        
        try {
            await sock.sendMessage(config.targetId, { text: testMessage });
            console.log('✅ Pesan test berhasil dikirim ke:', config.targetId);
        } catch (error) {
            console.error('❌ Gagal kirim pesan test:', error.message);
            console.error('Error details:', error);
        }
        
        // Cek info chat
        try {
            const chatInfo = await sock.getChatInfo(config.targetId);
            console.log('📱 Info chat:', JSON.stringify(chatInfo, null, 2));
        } catch (error) {
            console.error('❌ Gagal dapat info chat:', error.message);
        }
        
        // Tutup koneksi setelah test
        setTimeout(() => {
            console.log('🔌 Menutup koneksi...');
            sock.end();
            process.exit(0);
        }, 5000);
    },
    onClose: () => {
        console.log('⚠️ Koneksi ditutup');
    }
});
