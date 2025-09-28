const { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Select a member and ban them.')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The member to ban')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for banning'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setContexts(InteractionContextType.Guild),

	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const member = interaction.options.getMember('user');
		const reason = interaction.options.getString('reason') ?? 'No reason provided';
		if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
			return interaction.editReply('You do not have permission to use this command!');
		}
		if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
			return interaction.editReply('I do not have permission to ban members!');
		}
		if (!member.bannable) {
			return interaction.editReply('I cannot ban this user, as they have a higher role than me!');
		}
		if (member.id === interaction.user.id) {
			return interaction.editReply('you cannot ban yourself!');
		}
		const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm Ban')
			.setStyle(ButtonStyle.Danger);

		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(cancel, confirm);

		await interaction.editReply({
			content: `Are you sure you want to ban ${member.user.username} for reason: ${reason}?`,
			components: [row],
			withResponse: true,
		});

		const response = await interaction.fetchReply();

		const collectorFilter = i => i.user.id === interaction.user.id;
		try {
			const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

			if (confirmation.customId === 'confirm') {
				await member.ban({ reason }).catch(error => {
					console.log('there was an error banning the member: ', error);
				});
				const embed = new EmbedBuilder()
					.setColor('#8F00FF')
					.setTitle('Member Banned')
					.setDescription(`Banned **${member.user.username}**`)
					.addFields({ name: 'Reason', value: reason });
				await confirmation.update({ content: `${member.user.username} has been banned for reason: ${reason}`, components: [], embeds: [embed] });
			}
			else if (confirmation.customId === 'cancel') {
				await confirmation.update({ content: 'Action cancelled', components: [] });
			}
		}
		catch {
			await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
		}
	},
};