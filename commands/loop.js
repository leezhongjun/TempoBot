const { SlashCommandBuilder } = require('discord.js');
const {QueueRepeatMode} = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Loop options...')
		.addIntegerOption(option =>
			option.setName('mode')
				.setDescription('loop mode')
				.setRequired(true)
				.addChoices(
				{
				name: 'Off',
				value: QueueRepeatMode.OFF,
				},
				{
				name: 'Track',
				value: QueueRepeatMode.TRACK,
				},
				{
				name: 'Queue',
				value: QueueRepeatMode.QUEUE,
				},
				{
				name: 'Autoplay',
				value: QueueRepeatMode.AUTOPLAY,
				}
			)),
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
		const loopMode = interaction.options.getInteger('mode');
		const success = queue.setRepeatMode(loopMode);
		var msg = ``;
		if (loopMode === QueueRepeatMode.TRACK) {
			msg = `🔂 | Looping **[${queue.current.title}](<${queue.current.url}>)**!`
		} else if (loopMode === QueueRepeatMode.QUEUE){
			msg = '🔁 | Looping the queue!'
		} else if (loopMode === QueueRepeatMode.AUTOPLAY){
			msg = '▶️ | Autoplay enabled!'
		} else {
			msg = '▶️ | Looping disabled!'
		}

		return await interaction.followUp({
			content: msg
		});

	},
};