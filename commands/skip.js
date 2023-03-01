const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip current song.'),
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
				content: `❌ | Not playing anything!` 
			});
		const success = queue.skip();
		return await interaction.followUp({
			content: success ? `⏭️ | Skipped **[${queue.current.title}](<${queue.current.url}>)**!` : `❌ | Could not skip **[${current_track.title}](<${current_track.url}>)**!`
		});

	},
};