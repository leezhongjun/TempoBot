const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('About the bot/commands.'),
	async execute(interaction, player) {
		const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
					.setColor(0x0099FF)
                    .setLabel('Invite Tempo to your server') // label of the button
                    .setEmoji('➕') // emoji
                    .setURL('https://discord.com/oauth2/authorize?scope=bot&client_id=1079605657382166659&permissions=8') // URL of where the button leads the user
                    .setStyle(ButtonStyle.Link) // style of the button
            )
			.addComponents(
                new ButtonBuilder()
					.setColor(0x0099FF)
                    .setLabel('View on GitHub') // label of the button
                    .setEmoji('👨‍💻') // emoji
                    .setURL('https://github.com/leezhongjun/Tempo-Bot') // URL of where the button leads the user
                    .setStyle(ButtonStyle.Link) // style of the button
            )
		let str1 = 'Tempo is a lightweight Discord bot that plays music from YouTube, Spotify and SoundCloud. It is written in JavaScript and uses the Discord.js library.\n'
		str1 += 'Tempo is open source and on GitHub \n'
		str1 += 'Info about commands below ⬇️ \n'
		await interaction.reply({content: str1, ephemeral: true, components: [row]});
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
		
		let str = "```";
		var pad = ' '.repeat(10 - 'help'.length);
		str += ` /help${pad} | About the bot/commands. \n`;
		str += '-'.repeat(66) + '\n';
        for (const file of commandFiles) {
			const command = require(`./${file}`);
			pad = ' '.repeat(10 - command.data.name.length);
			pad2 = ' '.repeat(50 - command.data.description.length);
			str += ` /${command.data.name}${pad} | ${command.data.description}${pad2} \n`;
			str += '-'.repeat(66)  + '\n';

        }
		str = str.slice(0, -68)
		str += "```";

        return await interaction.followUp({
			content: str,
			ephemeral: true,
        });
    },
};