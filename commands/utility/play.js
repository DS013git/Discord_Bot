const { SlashCommandBuilder } = require('discord.js');
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	AudioPlayerStatus,
} = require('@discordjs/voice');
const play = require('play-dl');
const { createDiscordJSAdapter } = require('../../events/adapter.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('plays a song using url or name')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The url or song name')
				.setRequired(true)),

	async execute(interaction) {
		await interaction.deferReply();

		const input = interaction.options.getString('input');
		const channel = interaction.member.voice.channel;

		if (!channel) {return interaction.editReply('Join a voice channel first.');}

		await interaction.editReply('Searching the song...');

		try {
			const yt_info = await play.search(input, { limit: 1 });

			if (!yt_info.length) {return interaction.editReply('No results found.');}

			const videoInfo = yt_info[0];

			// Debug: log the structure to see available properties
			console.log('Video Info Keys:', Object.keys(videoInfo));

			// STREAM - pass videoInfo object directly instead of URL
			const stream = await play.stream(videoInfo);

			// CONNECT
			const connection = joinVoiceChannel({
				channelId: channel.id,
				guildId: interaction.guild.id,
				adapterCreator: createDiscordJSAdapter(channel),
			});

			const resource = createAudioResource(stream.stream, {
				inputType: stream.type,
			});

			const player = createAudioPlayer();
			connection.subscribe(player);

			player.play(resource);

			await interaction.editReply(`🎵 Playing **${videoInfo.title}**`);

			player.on(AudioPlayerStatus.Idle, () => {
				connection.destroy();
			});

		}
		catch (err) {
			console.error(err);
			return interaction.editReply('Failed to fetch or play track.');
		}
	},
};
