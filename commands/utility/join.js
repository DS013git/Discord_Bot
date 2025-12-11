const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
// const { createDiscordJSAdapter } = require('../../events/adapter.js');

module.exports = {
	data: new SlashCommandBuilder()
	    .setName('join')
	    .setDescription('makes the bot to join your voice channel'),
	async execute(interaction) {
		// checks if the user has joined vc or not
	    const channel = interaction.member.voice.channel;

		if (!channel) {
			return interaction.reply({
				content: 'You must be in a voice channel first!',
				flags: 64,
			});
		}

		try {
			joinVoiceChannel({
				channelId: channel.id,
				guildId: channel.guild.id,
				// this is connecting the voice
				adapterCreator: channel.guild.voiceAdapterCreator,
				selfDeaf: false,
			});

			// the bot is telling the user that it has joined the vc
			return interaction.reply(`Joined **${channel.name}**!`);
		}
		catch (err) {
			console.error(err);
			return interaction.reply('Failed to join the voice channel.');
		}
	},
};