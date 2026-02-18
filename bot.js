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
  console.log('🌐 Web server is running on port 8000');
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

  // 1. Slow down head movements (Themis hates instant snaps)
  const yaw = bot.entity.yaw + (Math.random() - 0.5);
  const pitch = (Math.random() - 0.5);
  bot.look(yaw, pitch, false); 

  // 2. Swing arm to look "human"
  bot.swingArm();

  // 3. Clear states before starting new ones to avoid "conflicting packets"
  bot.clearControlStates();

  switch (movementPhase) {
    case 0:
      bot.setControlState('forward', true);
      break;
    case 1:
      bot.setControlState('back', true);
      break;
    case 2:
      bot.setControlState('jump', true);
      setTimeout(() => { if (bot) bot.setControlState('jump', false); }, 400);
      break;
  }

  movementPhase = (movementPhase + 1) % 4;
  
  // 4. Randomized interval (3-6 seconds) to bypass pattern detection
  const nextTick = 3000 + (Math.random() * 3000);
  setTimeout(movementCycle, nextTick);
}



// Start the bot
createBot();
