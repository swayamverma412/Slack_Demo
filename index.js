const express = require('express');
const ngrok = require('ngrok');
require('dotenv').config();
const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient("5U1dMvkznAK9fDg0Xp0uGV1a", {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG
});


const expressApp = express();

// Add logging statement to log request body
expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(logRequestBody);

// Slash command handler
expressApp.post('/slack/commands/forward', async (req, res) => {
  const command = req.body;

  if (command.token !== process.env.SLACK_TOKEN) {
    console.error('Invalid token received:', command.token);
    res.status(401).send('Invalid token received');
    return;
  }

  try {
    const channelName = command.channel_name.toLowerCase();
    if (channelName !== 'channel-1') {
      res.status(200).send('Command executed successfully');
      return;
    }

    const text = command.text.trim();
    await publishMessage(text);

    res.status(200).send('Command executed successfully');
  } catch (error) {
    console.error('Error executing command:', error);
    res.status(500).send('Error executing command');
  }
});


async function publishMessage(text) {
  try {
    const result = await client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN ,
      channel: 'C073B4Z8S68',
      text: text.toUpperCase(),
    });

    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
}


// Establish ngrok tunnel
(async () => {
  const url = await ngrok.connect({ authtoken: process.env.NGROK_AUTHTOKEN, addr: process.env.PORT });
  console.log(`Ingress established at: ${url}`);
})();

// Helper function to log request body
function logRequestBody(req, res, next) {
  console.log('Received request:', req.body);
  next();
}

expressApp.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});