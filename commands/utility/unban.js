const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Select a member and unban them.')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The member to unban')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for unbanning'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false),

	async execute(interaction) {
		const guild = interaction.guild;
		const member = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason') ?? 'No reason provided';
		if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
			return interaction.reply('You do not have permission to use this command!');
		}
		if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
			return interaction.reply('I do not have permission to unban members!');
		}
		if (member.id === interaction.user.id) {
			return interaction.reply('you cannot unban yourself!');
		}
		const embed = new EmbedBuilder()
			.setColor('#0000FF')
			.setTitle('Member Unbanned')
			.setDescription(`Unbanned **${member.username}**`)
			.addFields({ name: 'Reason', value: reason });
		await interaction.guild.bans.fetch().then(async bans => {
			if (bans.size === 0) return await interaction.reply({ content: 'There is no one banned from this guild', flags: 64 });
			const bannedID = bans.find(ban => ban.user.id === member.id);
			if (!bannedID) return await interaction.reply({ content: 'The ID stated is not banned from this server', flags: 64 });
			await guild.members.unban(member, { reason }).catch(error => {
				console.log('I cannot unban this user', error);
			});
			await interaction.reply({ embeds: [embed] });

		});
	},
};