const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('volume')
		.setDescription('Set volume.')
		.addIntegerOption(option =>
			option.setName('volume')
				.setDescription('Number between 0-200.')
				.setRequired(true)
			),
	async execute(interaction, player) {
		// interaction.guild is the object representing the Guild in which the command was run
		if (!interaction.member.voice.channelId) {
			return await interaction.reply({ 
				content: `❌ | You are not in a voice channel!`,
				ephemeral: true 
			});
		}

        if (interaction.guild.members.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId){
			return await interaction.reply({ 
				content: `❌ | You are not in my voice channel!`, 
				ephemeral: true 
			});
		}
		await interaction.deferReply();
        const queue = player.getQueue(interaction.guildId);
		var volume = interaction.options.getInteger('volume');
		volume = Math.max(0, volume);
		volume = Math.min(200, volume);
		const success = queue.setVolume(volume);
		const volEmoji = volume >= 100 ? '🔊' : '🔉';
        return await interaction.followUp({
			content: success ? `${volEmoji} | Volume set to \`${volume}%\`` : `❌ | Could not change volume!`
		});


	},
};