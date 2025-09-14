const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
	    .setName('echo')
	    .setDescription('Replies with your input!')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The input to echo back')
				.setRequired(true))
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('The channel to echo to')
				.setRequired(false)),
	async execute(interaction) {
	    const input = interaction.options.getString('input');
	    const channel = interaction.options.getChannel('channel');
	    if (channel) {
	        await channel.send(input);
	    }
		else {
	        await interaction.reply(input);
	    }
	},
};