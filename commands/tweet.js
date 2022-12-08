const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add_channel')
		.setDescription('To Add Channel'),
	async execute(interaction) {
		await interaction.reply("Reply with channel ID (Bot must be member of channel's server)");
	},
};