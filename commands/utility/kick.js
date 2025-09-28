const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Select a member and kick them.')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The member to kick')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for kicking')
				.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
	async execute(interaction) {
		const member = interaction.options.getMember('user');
		const reason = interaction.options.getString('reason') ?? 'No reason provided';
		if (!member) {
			return interaction.reply('That user is not in this server!');
		}
		if (!interaction.member.permissions.has('KICK_MEMBERS')) {
			return interaction.reply('You do not have permission to use this command!');
		}
		if (!interaction.guild.members.me.permissions.has('KICK_MEMBERS')) {
			return interaction.reply('I do not have permission to kick members!');
		}
		if (!member.kickable) {
			return interaction.reply('I cannot kick this user, as they have a higher role than me!');
		}
		if (member.id === interaction.user.id) {
			return interaction.reply('you cannot kick yourself!');
		}
		const embed = new EmbedBuilder()
			.setColor('#ff0000')
			.setTitle('Member Kicked')
			.setDescription(`Kicked **${member.user.username}**`)
			.addFields({ name: 'Reason', value: reason });
		await member.kick(reason).catch(error => {
			console.log('there was an error kicking the member: ', error);
		});
		await interaction.reply({ embeds: [embed] });
	},
};