const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const pidFile = path.join(__dirname, 'bot.pid');
const logsDir = path.join(__dirname, 'logs');

function getPid() {
    if (fs.existsSync(pidFile)) {
        return parseInt(fs.readFileSync(pidFile, 'utf8').trim());
    }
    return null;
}

function isProcessRunning(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch (e) {
        return false;
    }
}

function showStatus() {
    console.log('=== Crypto Alerts Bot Status ===');
    const pid = getPid();
    
    if (pid && isProcessRunning(pid)) {
        console.log(`✅ Bot is running`);
        console.log(`Process ID: ${pid}`);
        console.log(`Started: ${fs.statSync(pidFile).mtime.toLocaleString()}`);
    } else {
        console.log('❌ Bot is not running');
        if (pid) {
            console.log('Removing stale PID file...');
            fs.unlinkSync(pidFile);
        }
    }
}

function showLogs() {
    console.log('=== Bot Logs ===');
    const pid = getPid();
    
    if (!pid || !isProcessRunning(pid)) {
        console.log('❌ Bot is not running');
        return;
    }
    
    const outLog = path.join(logsDir, 'out.log');
    const errLog = path.join(logsDir, 'err.log');
    
    console.log('\n📄 Output Log (last 50 lines):');
    if (fs.existsSync(outLog)) {
        const content = fs.readFileSync(outLog, 'utf8');
        const lines = content.split('\n').slice(-50);
        console.log(lines.join('\n'));
    } else {
        console.log('No output log found');
    }
    
    console.log('\n📄 Error Log (last 20 lines):');
    if (fs.existsSync(errLog)) {
        const content = fs.readFileSync(errLog, 'utf8');
        const lines = content.split('\n').slice(-20);
        console.log(lines.join('\n'));
    } else {
        console.log('No error log found');
    }
}

function stopBot() {
    console.log('=== Stopping Bot ===');
    const pid = getPid();
    
    if (!pid) {
        console.log('❌ No PID file found');
        return;
    }
    
    if (isProcessRunning(pid)) {
        console.log(`Stopping process ${pid}...`);
        try {
            process.kill(pid, 'SIGTERM');
            console.log('✅ Bot stopped');
            fs.unlinkSync(pidFile);
        } catch (e) {
            console.log('❌ Failed to stop bot:', e.message);
        }
    } else {
        console.log('❌ Bot is not running');
        fs.unlinkSync(pidFile);
    }
}

function restartBot() {
    console.log('=== Restarting Bot ===');
    
    // Stop existing
    const pid = getPid();
    if (pid && isProcessRunning(pid)) {
        console.log('Stopping existing bot...');
        try {
            process.kill(pid, 'SIGTERM');
        } catch (e) {
            console.log('Failed to stop:', e.message);
        }
        fs.unlinkSync(pidFile);
    }
    
    // Start new
    console.log('Starting new bot...');
    const startScript = path.join(__dirname, 'start_bg.js');
    exec(`node "${startScript}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Failed to start bot:', error);
        } else {
            console.log(stdout);
        }
    });
}

function killAll() {
    console.log('=== Force Killing All Node Processes ===');
    console.log('WARNING: This will kill ALL node.exe processes!');
    
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('Are you sure? (yes/no): ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
            exec('taskkill /F /IM node.exe', (error, stdout, stderr) => {
                console.log(stdout);
                if (fs.existsSync(pidFile)) {
                    fs.unlinkSync(pidFile);
                }
                rl.close();
            });
        } else {
            console.log('Cancelled');
            rl.close();
        }
    });
}

// Parse command
const action = process.argv[2];

switch (action) {
    case 'status':
        showStatus();
        break;
    case 'logs':
        showLogs();
        break;
    case 'stop':
        stopBot();
        break;
    case 'restart':
        restartBot();
        break;
    case 'kill':
        killAll();
        break;
    default:
        console.log('Usage: node manage_bg.js [status|logs|stop|restart|kill]');
        console.log('  status  - Check if bot is running');
        console.log('  logs    - View bot logs');
        console.log('  stop    - Stop the bot');
        console.log('  restart - Restart the bot');
        console.log('  kill    - Force kill all node processes');
}
