
// const { clientId, guildId, token, publicKey } = require('./config.json');
require('dotenv').config()
const CLIENT_ID = process.env.CLIENT_ID || 'not set'
const TOKEN = process.env.TOKEN 
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set'
const GUILD_ID = process.env.GUILD_ID || 'not set'

// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const keepAlive = require('./server');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Add commands to the client
client.commands = new Collection();

const commands = []
// Read all commands from the commands folder
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
  commands.push(command.data.toJSON());
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(TOKEN);

// Register commands
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(CLIENT_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


keepAlive();
// Log in to Discord with your client's token
client.login(TOKEN);


// const axios = require('axios')
// const express = require('express');
// const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');


// const app = express();
// // app.use(bodyParser.json());

// const discord_api = axios.create({
//   baseURL: 'https://discord.com/api/',
//   timeout: 3000,
//   headers: {
// 	"Access-Control-Allow-Origin": "*",
// 	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
// 	"Access-Control-Allow-Headers": "Authorization",
// 	"Authorization": `Bot ${TOKEN}`
//   }
// });




// app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
//   const interaction = req.body;

//   if (interaction.type === InteractionType.APPLICATION_COMMAND) {
//     console.log(interaction.data.name)
//     if(interaction.data.name == 'yo'){
//       return res.send({
//         type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
//         data: {
//           content: `Yo ${interaction.member.user.username}!`,
//         },
//       });
//     }

//     if(interaction.data.name == 'dm'){
//       // https://discord.com/developers/docs/resources/user#create-dm
//       let c = (await discord_api.post(`/users/@me/channels`,{
//         recipient_id: interaction.member.user.id
//       })).data
//       try{
//         // https://discord.com/developers/docs/resources/channel#create-message
//         let res = await discord_api.post(`/channels/${c.id}/messages`,{
//           content:'Yo! I got your slash command. I am not able to respond to DMs just slash commands.',
//         })
//         console.log(res.data)
//       }catch(e){
//         console.log(e)
//       }

//       return res.send({
//         // https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
//         type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
//         data:{
//           content:'👍'
//         }
//       });
//     }
//   }

// });



// app.get('/register_commands', async (req,res) =>{
//   let slash_commands = [
//     {
//       "name": "yo",
//       "description": "replies with Yo!",
//       "options": []
//     },
//     {
//       "name": "dm",
//       "description": "sends user a DM",
//       "options": []
//     }
//   ]
//   try
//   {
//     // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
//     let discord_response = await discord_api.put(
//       `/applications/${APPLICATION_ID}/commands`,
//       slash_commands
//     )
//     console.log(discord_response.data)
//     return res.send('commands have been registered')
//   }catch(e){
//     console.error(e.code)
//     console.error(e.response?.data)
//     return res.send(`${e.code} error from discord`)
//   }
// })


// app.get('/', async (req,res) =>{
//   return res.send('Follow documentation ')
// })


// app.listen(8999, () => {

// })

