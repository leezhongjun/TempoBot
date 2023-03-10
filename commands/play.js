const { SlashCommandBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a song. (optional: choose position to add to)')
		.addStringOption(option =>
			option
				.setName('song')
				.setDescription('Song name/Link to song')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('position')
				.setDescription('Position in queue to add to (default: last)')
				.setAutocomplete(true)
			),
	async autocomplete(interaction, player) {
		const focusedOption = interaction.options.getFocused(true);
		let choices = [];
		const queue = player.getQueue(interaction.guildId);
		if (queue && queue.tracks.length+1 > 0){
			const queueTracks = queue.tracks
			for (var i = 0; i < Math.min(queueTracks.length+1, 30); i++){
				choices.push({name: `${i+1}`, value: i});
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
        
		const query = interaction.options.getString('song');
		
		const queue = await player.createQueue(interaction.guild, {
			ytdlOptions: {
				quality: 'highestaudio',
				filter: 'audioonly',
				highWaterMark: 1 << 25,
				// dlChunkSize : 0,
			},
            metadata: {
                channel: interaction.channel
            }
        });
		const res = await player.search(query, {
            requestedBy: interaction.member,
            searchEngine: QueryType.AUTO
        })
            .catch((error) => {
                console.log(error);
                return interaction.reply({ content: `❌ | Error occurred.`, allowedMentions: { repliedUser: false }, ephemeral: true });
            });

        if (!res || !res?.tracks?.length)
            return interaction.reply({ content: `❌ | No results found.`, allowedMentions: { repliedUser: false }, ephemeral: true });
		
		try {
			if (!queue.connection)
				await queue.connect(interaction.member.voice.channel);
		} catch {
			await player.deleteQueue(interaction.guild.id);
			return interaction.reply({ content: `❌ | Cannot join audio channel.`, allowedMentions: { repliedUser: false }, ephemeral: true });
		}
		const pos = interaction.options.getInteger('position');
		if (pos === null)
        	res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]);
		else
			res.playlist ? queue.insert(res.tracks, pos) : queue.insert(res.tracks[0], pos);

        if (!queue.playing)
            await queue.play();
		
		await interaction.reply(`✅ | **[${res.tracks[0].title}](<${res.tracks[0].url}>)** added at position ${queue.getTrackPosition(res.tracks[0]) + 1}.`);
	
	},
};
