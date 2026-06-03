#!/usr/bin/env node
const args = process.argv.slice(2);
const method = args[0] || 'local';
const port = parseInt(args[1], 10) || 5173;

async function startLocaltunnel(port) {
  const localtunnel = require('localtunnel');
  console.log(`Starting localtunnel on port ${port}...`);
  const tunnel = await localtunnel({ port });
  console.log('localtunnel URL:', tunnel.url);
  console.log('Press Ctrl+C to close the tunnel.');
  tunnel.on('close', () => process.exit(0));
}

async function startNgrok(port) {
  const ngrok = require('ngrok');
  console.log(`Starting ngrok on port ${port}...`);
  try {
    const url = await ngrok.connect({ addr: port });
    console.log('ngrok URL:', url);
    console.log('Press Ctrl+C to disconnect ngrok.');
  } catch (err) {
    console.error('Failed to start ngrok:', err.message || err);
    process.exit(1);
  }
}

(async () => {
  try {
    if (method === 'ngrok') {
      await startNgrok(port);
    } else {
      await startLocaltunnel(port);
    }
    // keep process alive
    process.stdin.resume();
  } catch (err) {
    console.error('Tunnel error:', err);
    process.exit(1);
  }
})();
