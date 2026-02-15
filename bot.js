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
//koyeb uses 8000
app.listen(8000, () => {
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


    // Clear old instance to prevent memory leaks
    bot = null;
            // Wait longer to avoid throttling
      setTimeout(createBot, 30000); 
  });
}

function movementCycle() {
  if (!bot || !bot.entity) return;

  // Randomly look around to simulate human activity
  const yaw = Math.random() * Math.PI * 2;
  const pitch = (Math.random() - 0.5) * Math.PI;
  bot.look(yaw, pitch);

  switch (movementPhase) {
    case 0:
      bot.setControlState('forward', true);
      break;
    case 1:
      bot.setControlState('back', true);
      // Occasional chat to reset some server-side idle timers
      if (Math.random() > 0.8) bot.chat('/help'); 
      break;
    case 2:
      bot.setControlState('jump', true);
      setTimeout(() => { if (bot) bot.setControlState('jump', false); }, JUMP_DURATION);
      break;
    default:
      bot.clearControlStates();
      break;
  }

  movementPhase = (movementPhase + 1) % 4;
  setTimeout(movementCycle, STEP_INTERVAL);
}


// Start the bot
createBot();
