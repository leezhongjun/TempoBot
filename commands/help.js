const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('View all commands.'),
	async execute(interaction, player) {
		// interaction.guild is the object representing the Guild in which the command was run
		return await interaction.reply({
			content: `🛑 | Stopped playing!`
		});

	},
};