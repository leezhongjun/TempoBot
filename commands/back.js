const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('back')
		.setDescription('Back to previous song.'),
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
		if (!queue.previousTracks[1])
            return interaction.followUp({ 
				content: `❌ | There was no music playing before.`
			});
		
		var previousTrack = queue.previousTracks[1];
		await queue.back();
		return await interaction.followUp({
			content: `⏪ | Rewound back to **[${previousTrack.title}](<${previousTrack.url}>)**`
		});

	},
};

function wait(ms) {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
};