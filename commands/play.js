const { SlashCommandBuilder } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a song.')
		.addStringOption(option =>
			option
				.setName('song')
				.setDescription('Song name/Link to song')
				.setRequired(true)),
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
                return interaction.reply({ content: `❌ | Error occurred.`, allowedMentions: { repliedUser: false } });
            });

        if (!res || !res?.tracks?.length)
            return interaction.reply({ content: `❌ | No results found.`, allowedMentions: { repliedUser: false } });
		
		try {
			if (!queue.connection)
				await queue.connect(interaction.member.voice.channel);
		} catch {
			await player.deleteQueue(interaction.guild.id);
			return interaction.reply({ content: `❌ | Cannot join audio channel.`, allowedMentions: { repliedUser: false } });
		}

		// console.log(Object.getOwnPropertyNames(res.tracks[0]));
		await interaction.reply(`✅ | **[${res.tracks[0].title}](<${res.tracks[0].url}>)** added.`);

        res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]);

        if (!queue.playing)
            await queue.play();
	
	},
};