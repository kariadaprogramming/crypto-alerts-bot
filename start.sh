#!/bin/bash

# Setup logs directory
node setup_logs.js

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

echo "✅ Bot started in background with PM2"
echo "Use these commands:"
echo "  pm2 logs crypto-alerts-bot  - View logs"
echo "  pm2 status                  - Check status"
echo "  pm2 stop crypto-alerts-bot  - Stop bot"
echo "  pm2 restart crypto-alerts-bot - Restart bot"
echo "  pm2 delete crypto-alerts-bot - Delete bot from PM2"
