const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
	    .setName('form')
	    .setDescription('fill the form'),
	async execute(interaction) {
		const modal = new ModalBuilder()
			.setCustomId('myModal02')
			.setTitle('My Modal');

		const yourNameInput = new TextInputBuilder()
			.setCustomId('yourname')
			.setLabel('What\'s your Name?')
			.setStyle(TextInputStyle.Short);

		const dreamPlaceInput = new TextInputBuilder()
			.setCustomId('dreamplace')
			.setLabel('Where you want to live in future?')
			.setStyle(TextInputStyle.Short);

		const favoritePlaceInput = new TextInputBuilder()
			.setCustomId('favoriteplace')
			.setLabel('What\'s your first favorite place?')
			.setStyle(TextInputStyle.Short);

		const favoriteBooksInput = new TextInputBuilder()
			.setCustomId('favoritebooks')
			.setLabel('What are your favorite books?')
			.setStyle(TextInputStyle.Short);

		// const lifeWorkInput = new TextInputBuilder()
		// 	.setCustomId('lifework')
		// 	.setLabel('What are you doing in your life?')
		// 	.setStyle(TextInputStyle.Short);

		// const lifeStatusInput = new TextInputBuilder()
		// 	.setCustomId('lifestatus')
		// 	.setLabel('How is your life going these days?')
		// 	.setStyle(TextInputStyle.Paragraph);

		// const bestMomentInput = new TextInputBuilder()
		// 	.setCustomId('bestmoment')
		// 	.setLabel('What\'s your best moment in your whole life?')
		// 	.setStyle(TextInputStyle.Paragraph);

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow = new ActionRowBuilder().addComponents(yourNameInput);
		const secondActionRow = new ActionRowBuilder().addComponents(dreamPlaceInput);
		const thirdActionRow = new ActionRowBuilder().addComponents(favoritePlaceInput);
		const fourthActionRow = new ActionRowBuilder().addComponents(favoriteBooksInput);
		// const fifthActionRow = new ActionRowBuilder().addComponents(lifeWorkInput);
		// const sixthActionRow = new ActionRowBuilder().addComponents(lifeStatusInput);
		// const seventhActionRow = new ActionRowBuilder().addComponents(bestMomentInput);

		// Add inputs to the modal
		modal.addComponents(
			firstActionRow,
			secondActionRow,
			thirdActionRow,
			fourthActionRow,
			// fifthActionRow,
			// sixthActionRow,
			// seventhActionRow,
		);

		// Show the modal to the user
		await interaction.showModal(modal);
	},
};