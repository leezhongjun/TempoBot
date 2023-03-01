const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause current song.'),
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
        if (!queue || !queue.playing) 
			return await interaction.followUp({ 
				content: `❌ | Not playing any music!`
			});
		const currentTrack = queue.current;
		const success = queue.setPaused(true);
		return await interaction.followUp({
			content: success ? `⏸️ | Paused **[${currentTrack.title}](<${currentTrack.url}>)**` : `❌ | Could not pause **[${currentTrack.title}](<${currentTrack.url}>)**!`
		});

	},
};