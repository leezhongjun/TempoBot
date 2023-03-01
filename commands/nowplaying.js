const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nowplaying')
		.setDescription('View song playing now.'),
	async execute(interaction, player) {
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.deferReply();
		const queue = player.getQueue(interaction.guildId);
		if (!queue || !queue.playing){
			return await interaction.followUp({ 
				content: `❌ | No song is playing!`
			});
		} 

		await interaction.deferReply();
		const progress = queue.createProgressBar();
		const perc = queue.getPlayerTimestamp();
		return await interaction.followUp({
			embeds: [
			  {
				title: 'Now Playing',
				description: `🎶 | [${queue.current.title}](<${queue.current.url}>)! (\`${perc.progress}%\`)`,
				fields: [
				  {
					name: '\u200b',
					value: progress,
					

				  },
				  {
					name: '\u200b',
					value: `**Volume**: \`${queue.volume}%\` | **Loop**: \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'Queue' : 'Single') : 'Off'}\``,
				  },
				],
				color: 0xffffff,
			  },
			],
		  });
	},
};