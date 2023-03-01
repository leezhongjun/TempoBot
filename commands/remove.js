const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Remove song from queue')
		.addIntegerOption(option =>
			option.setName('song')
				.setDescription('Song to remove')
				.setRequired(true)
				.setAutocomplete(true)
			),

	async autocomplete(interaction, player) {
		const focusedOption = interaction.options.getFocused(true);
		let choices = [];
		const queue = player.getQueue(interaction.guildId);
		if (queue && queue.tracks.length > 0){
			const queueTracks = queue.tracks
			for (var i = 0; i < Math.min(queueTracks.length, 30); i++){
				choices.push({name: `${i+1}. ` + `${queueTracks[i].title}`, value: i});
			}
		} 
		const filtered = choices.filter(choice => choice.name.startsWith(focusedOption.value));
		await interaction.respond(
			filtered,
		);
	},

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
		const song = interaction.options.getInteger('song');
		
		const currentTrack = queue.tracks[song];
		const success = queue.remove(song);

		return await interaction.followUp({
			content: success ? `✅ | Successfully removed ${song+1}. **[${currentTrack.title}](<${currentTrack.url}>)**` : `❌ | Could not remove  ${song+1}. **[${currentTrack.title}](<${currentTrack.url}>)**`
		});

	},
};