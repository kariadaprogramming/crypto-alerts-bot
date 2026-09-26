const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'CryptoAlertsBot',
  description: 'Crypto Alerts WhatsApp Bot - Automated crypto price monitoring and alerts',
  script: path.join(__dirname, 'index.js'),
  nodeOptions: [
    '--max-old-space-size=4096'
  ],
  env: [
    {
      name: 'NODE_ENV',
      value: 'production'
    }
  ]
});

// Listen for the "install" event
svc.on('install', function(){
  console.log('✅ Service installed successfully!');
  console.log('Starting service...');
  svc.start();
});

// Listen for the "start" event
svc.on('start', function(){
  console.log('✅ Service started successfully!');
  console.log('The bot is now running in the background as a Windows service.');
  console.log('');
  console.log('To manage the service:');
  console.log('  Open Services.msc and look for "CryptoAlertsBot"');
  console.log('  Or use these commands:');
  console.log('    net start CryptoAlertsBot    - Start service');
  console.log('    net stop CryptoAlertsBot     - Stop service');
  console.log('    sc delete CryptoAlertsBot   - Uninstall service');
});

// Listen for the "uninstall" event
svc.on('uninstall', function(){
  console.log('✅ Service uninstalled successfully!');
});

// Listen for the "alreadyinstalled" event
svc.on('alreadyinstalled', function(){
  console.log('⚠️ Service is already installed!');
  console.log('You can uninstall it first by running: node uninstall_service.js');
});

// Install the service
svc.install();
