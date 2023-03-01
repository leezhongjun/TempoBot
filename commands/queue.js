const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('View song queue.'),
	async execute(interaction, player) {
		// interaction.guild is the object representing the Guild in which the command was run
		var queue = player.getQueue(interaction.guildId);
		if (typeof(queue) == "undefined"){
			return void interaction.reply({ 
				content: `❌ | No songs in queue!`,
				ephemeral: true 
			});
		} 
		if (queue.playing){
			const progress = queue.createProgressBar();
			const perc = queue.getPlayerTimestamp();
			await interaction.reply({
				embeds: [
				{
					title: 'Now Playing',
					description: `🎶 | Now playing: **[${queue.current.title}](<${queue.current.url}>)** (\`${perc.progress}%\`)`,
					fields: [
					{
						name: '\u200b',
						value: progress,
					},
					{
					  name: '\u200b',
					  value: `**Volume**: \`${queue.volume}%\` | **Loop**: \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'All' : 'Single') : 'Off'}\``,
					},
					],
					color: 0xffffff,
				},
				],
		}); } else {
			await interaction.deferReply({ ephemeral: true });
		}
		
		var queue = queue.tracks;
		var queue_list = "";
		if (queue.length > 0){
			for (var i = 0; i < Math.min(queue.length, 30); i++){
				queue_list += `${i+1}. ` + `**[${queue[i].title}](<${queue[i].url}>)**` + "\n";
			}
		} else {
			queue_list = `**No songs in queue!**`;
		}
		return await interaction.followUp({ 
			content: `📜 | In queue:\n${queue_list}`,
			ephemeral: true 
		})
	},
};