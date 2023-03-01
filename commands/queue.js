const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('View song queue.'),
	async execute(interaction, player) {
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.deferReply();
		const queue = player.getQueue(interaction.guildId);
		if (typeof(queue) == "undefined" || queue.tracks.length <= 0){
			return void interaction.followUp({ 
				content: `❌ | No songs in queue!`
			});
		} 
		
		const queueTracks = queue.tracks
		var queueList = "";
		for (var i = 0; i < Math.min(queueTracks.length, 30); i++){
			queueList += `${i+1}. ` + `**[${queueTracks[i].title}](<${queueTracks[i].url}>)**` + "\n";
		}
		return await interaction.followUp({ 
			content: `📃 | In queue:\n${queueList}`,
		});
	},
};