const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'CryptoAlertsBot',
  script: require('path').join(__dirname, 'index.js')
});

// Listen for the "uninstall" event
svc.on('uninstall', function(){
  console.log('✅ Service uninstalled successfully!');
});

// Listen for the "start" event (in case service was running)
svc.on('stop', function(){
  console.log('✅ Service stopped successfully!');
  setTimeout(() => {
    svc.uninstall();
  }, 1000);
});

// First stop the service, then uninstall
svc.stop();
