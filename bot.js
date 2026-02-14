const mineflayer = require('mineflayer');
const config = require('./config.json');
const express = require('express'); // Added Express
const app = express(); // Initialize Express

process.env.DEBUG = 'mineflayer' 

// --- WEB SERVER FOR UPTIMEROBOT ---
// This tells UptimeRobot "Yes, I am still awake!"
app.get('/', (req, res) => {
  res.send('Bot is online and moving!');
});

// Replit uses port 3000 to trigger the "Webview" window
app.listen(3000, () => {
  console.log('🌐 Web server is running on port 3000');
});

// --- BOT CONFIGURATION ---
const STEP_INTERVAL = 1500;
const JUMP_DURATION = 500;

let bot;
let movementPhase = 0;

function createBot() {
  console.log('🚀 Connecting to server...');

  bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: config.botUsername,
    auth: 'offline',
    version: false,
    viewDistance: config.botChunk
  });

  bot.on('spawn', () => {
    console.log(`✅ ${config.botUsername} has spawned!`);
    bot.setControlState('sneak', true);
    // Restart the movement cycle on spawn
    setTimeout(movementCycle, STEP_INTERVAL);
  });

  bot.on('error', (err) => {
    console.error('⚠️ Error:', err.message);
  });

    bot.on('kicked', (reason) => console.log('Kicked for:', reason));
    bot.on('end', (reason) => {
      console.log('Disconnected:', reason);
      // Wait longer to avoid throttling
      setTimeout(createBot, 30000); 

    // Clear old instance to prevent memory leaks
    bot = null; 
    setTimeout(createBot, 5000);
  });
}

function movementCycle() {
  // Check if bot exists and has an entity (meaning it is fully spawned)
  if (!bot || !bot.entity) {
    return;
  }

  switch (movementPhase) {
    case 0:
      bot.setControlState('forward', true);
      bot.setControlState('back', false);
      bot.setControlState('jump', false);
      break;
    case 1:
      bot.setControlState('forward', false);
      bot.setControlState('back', true);
      bot.setControlState('jump', false);
      break;
    case 2:
      bot.setControlState('forward', false);
      bot.setControlState('back', false);
      bot.setControlState('jump', true);
      setTimeout(() => {
        if (bot && bot.setControlState) bot.setControlState('jump', false);
      }, JUMP_DURATION);
      break;
    case 3:
      bot.setControlState('forward', false);
      bot.setControlState('back', false);
      bot.setControlState('jump', false);
      break;
  }

  movementPhase = (movementPhase + 1) % 4;
  setTimeout(movementCycle, STEP_INTERVAL);
}

// Start the bot
createBot();
