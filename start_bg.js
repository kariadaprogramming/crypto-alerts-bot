const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Crypto Alerts Bot in background...');
console.log('Bot akan terus jalan meskipun terminal ditutup.\n');

// Setup log directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Start bot in background
const outLog = fs.openSync(path.join(logsDir, 'out.log'), 'a');
const errLog = fs.openSync(path.join(logsDir, 'err.log'), 'a');

const bot = spawn('node', ['index.js'], {
    detached: true,
    stdio: ['ignore', outLog, errLog],
    cwd: __dirname
});

// Write PID to file for later management
fs.writeFileSync(path.join(__dirname, 'bot.pid'), bot.pid.toString());

bot.unref();

console.log('✅ Bot started in background');
console.log(`Process ID: ${bot.pid}`);
console.log('\nCommands untuk mengelola bot:');
console.log('  node manage_bg.js status  - Cek status bot');
console.log('  node manage_bg.js logs    - Lihat logs');
console.log('  node manage_bg.js stop    - Stop bot');
console.log('  node manage_bg.js restart - Restart bot');
console.log('\nLogs tersimpan di folder logs/');
