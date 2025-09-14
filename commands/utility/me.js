const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	cooldown: 5,
	data: new SlashCommandBuilder()
	    .setName('hi')
	    .setDescription('Replies with the name of the bot!'),
	async execute(interaction) {
	    await interaction.reply('I am Cursed');
	},
};