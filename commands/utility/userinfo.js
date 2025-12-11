const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new ContextMenuCommandBuilder().setName('User Information').setType(ApplicationCommandType.User),
	async execute(interaction) {
		const user = interaction.targetUser;
		const randomColor = Math.floor(Math.random() * 16777215);

		const embed = new EmbedBuilder()
			.setTitle('User Information')
			.setColor(randomColor)
			.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.addFields(
				{ name: 'Username', value: user.username, inline: false },
				{ name: 'Name', value: user.displayName, inline: false },
				{ name: 'ID', value: user.id, inline: false },
				{ name: 'Account Created', value: user.createdAt.toDateString(), inline: false },
			)
			.setTimestamp()
			.setFooter({ text: 'User Info', iconURL: interaction.client.user.displayAvatarURL() });

		await interaction.reply({ embeds: [embed] });
	},

};