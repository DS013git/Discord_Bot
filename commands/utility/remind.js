const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const reminderSchema = require('../../Schemas.js/remindSchema.js');
const ms = require('ms');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remind')
		.setDescription('Set a reminder')
		.addStringOption(option => option.setName('reminder')
			.setDescription('what do you want to be reminded?')
			.setRequired(true))
		.addStringOption(option => option.setName('when')
			.setDescription('when do you want to be reminded? ')
			.setRequired(true))
		.addBooleanOption(option => option.setName('urgent')
			.setDescription('is this reminder urgent?')
			.setRequired(true)),
	async execute(interaction) {
		const { options } = interaction;
		const remind = options.getString('reminder');
		const time = options.getString('when');
		const urgent = options.getBoolean('urgent');
		const duration = ms(time);

		async function sendMessage(message) {
			const embed = new EmbedBuilder()
				.setColor('#8A2BE2')
				.setDescription(message);

			await interaction.reply({ embeds: [embed], ephemeral: true });
		}
		if (isNaN(duration)) {
			return sendMessage('Please provide a valid time duration.');
		}

		await reminderSchema.create({
			UserID: interaction.user.id,
			Time: Date.now() + duration,
			Urgent: urgent,
			Remind: remind,
		});

		await sendMessage(` I have set your reminder for \`${time}\``);
	},
};