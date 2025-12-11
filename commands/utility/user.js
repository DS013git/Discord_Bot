const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.')
		.addUserOption(option =>
			option.setName('target')
				.setDescription('The user you want info about')
				.setRequired(false)),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		// await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
		const user = interaction.options.getUser('target') || interaction.user;
		const member = interaction.guild.members.cache.get(user.id);
		const randomColor = Math.floor(Math.random() * 16777215);

		const embed = new EmbedBuilder()
			.setTitle('User Information')
			.setColor(randomColor)
			.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.addFields(
				{ name: 'Username', value: user.username, inline: false },
				{ name: 'Name', value: member.displayName, inline: false },
				{ name: 'ID', value: user.id, inline: false },
				{ name: 'Account Created', value: user.createdAt.toDateString(), inline: false },
			)
			.setTimestamp()
			.setFooter({ text: 'User Info', iconURL: interaction.client.user.displayAvatarURL() });

		await interaction.reply({ embeds: [embed] });
	},
};