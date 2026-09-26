const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const config = require('../config');
const { handleCommand } = require('./commands');

async function startWhatsApp({ onOpen, onClose }) {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n--- SCAN QR CODE DENGAN WA ADMIN ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            onClose();
            const code = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = code !== DisconnectReason.loggedOut;
            console.log(`⚠️  Terputus (${code}). Reconnect: ${shouldReconnect}`);
            if (shouldReconnect) setTimeout(() => startWhatsApp({ onOpen, onClose }), 3000);
            else console.log('❌ Logout. Hapus folder sesi lalu jalankan ulang.');
        } else if (connection === 'open') {
            console.log('✅ Bot siap!');
            onOpen(sock);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Handle incoming messages for commands
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message) continue;
            
            const messageContent = msg.message.conversation || 
                                   msg.message.extendedTextMessage?.text;
            
            if (!messageContent) continue;

            // Only process commands from target chat or private messages
            const chatId = msg.key.remoteJid;
            if (chatId !== config.targetId && !chatId.endsWith('@s.whatsapp.net')) continue;

            // For commands, we'll use cached or simplified data to avoid API calls
            const response = await handleCommand({ body: messageContent }, { coins: [], fng: null });
            if (response) {
                await sock.sendMessage(chatId, { text: response });
            }
        }
    });
}

module.exports = { startWhatsApp };
