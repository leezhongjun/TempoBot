require('dotenv').config()
const CLIENT_ID = process.env.CLIENT_ID || 'not set'
const TOKEN = process.env.TOKEN 

const fs = require('node:fs');
const path = require('node:path');
const { Client, EmbedBuilder, GatewayIntentBits, REST, Routes, Collection, ActivityType } = require('discord.js');
const { Player } = require('discord-player');

// Create a new client instance
const client = new Client( { intents: [GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildVoiceStates] } );
// Add commands to the client
client.commands = new Collection();

const commands = []
// Read all commands from the commands folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
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

// Create a new player instance
const player = new Player(client);

function EmbedPlay(status, musicTitle, musicUrl, musicLength, musicThumbnail, settings) {
	const EmbedPlay = new EmbedBuilder()
		.setColor('#FFFFFF')
		.setTitle(musicTitle)
		.setURL(musicUrl)
		.setThumbnail(musicThumbnail)
		.addFields({ name: status, value: `**Duration**: \`${musicLength}\` | ${settings}`, inline: true })
		.setTimestamp()
	return EmbedPlay;
};

const settings = (queue) =>
    `**Volume**: \`${queue.volume}%\` | **Loop**: \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'Queue' : 'Single') : 'Off'}\``;

// Load player events
player.on("trackStart", (queue, track) => queue.metadata.channel.send({ embeds: [EmbedPlay("🎶 | Now playing", track.title, track.url, track.duration, track.thumbnail, settings(queue))] }));

player.on("trackAdd", (queue, track) => queue.metadata.channel.send({ embeds: [EmbedPlay("🎶 | Added", track.title, track.url, track.duration, track.thumbnail, settings(queue))] }));

player.on("botDisconnect", queue => queue.metadata.channel.send("❌ | I was manually disconnected from the voice channel, clearing queue!"));

player.on("channelEmpty", queue => queue.metadata.channel.send("❌ | Nobody is in the voice channel, leaving..."));

player.on("queueEnd", queue => queue.metadata.channel.send("✅ | Queue ended!"));

player.on("error", (error, queue) => {
	switch (error) {
		case "NotPlaying":
			queue.metadata.channel.send("❌ | There is no music being played on this server!");
			break;
		case "NotConnected":
			queue.metadata.channel.send("❌ | You are not connected in any voice channel!");
			break;
		case "UnableToJoin":
			queue.metadata.channel.send("❌ | I am not able to join your voice channel, please check my permissions!");
			break;
		default:
			queue.metadata.channel.send(`❌ | Something went wrong... Error: ${error}`);
	}
});


// Load events
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setPresence({ activities: [{ name: 'Using /help', type: ActivityType.Custom}], status: 'online' });
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand() && !interaction.isAutocomplete()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		console.log(`Executing ${interaction.commandName}`);
		if (interaction.isAutocomplete()) {
			await command.autocomplete(interaction, player);
		} else {
			await command.execute(interaction, player);
		}
	} catch (error) {
		console.error(`Error executing ${interaction.commandName}`);
		console.error(error);
	}
});

// Log in to Discord with your client's token
client.login(TOKEN);