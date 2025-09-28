const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { tenorApi } = require('./config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gif')
		.setDescription('Sends a random gif!')
		.addStringOption(option =>
			option.setName('category')
				.setDescription('The gif category')
				.setRequired(true)
				.addChoices(
					{ name: 'Funny', value: 'Anime funny' },
					{ name: 'Meme', value: 'Anime meme' },
					{ name: 'Movie', value: 'Anime movie' },
				)),
	async execute(interaction) {
		const category = interaction.options.getString('category');
		const url = `https://tenor.googleapis.com/v2/search?q=${category}&key=${tenorApi}&limit=20`;
		try {
			const response = await fetch(url);
			const data = await response.json();

			if (!data.results || data.results.length === 0) {
				return interaction.reply(`No gifs found for category: ${category}`);
			}

			// Pick a random gif
			const randomIndex = Math.floor(Math.random() * data.results.length);
			const randomGif = data.results[randomIndex].media_formats.gif.url;
			const randomColor = Math.floor(Math.random() * 16777215);
			const animeName = data.results[randomIndex].content_description || 'Unknown Anime';
			const embed = new EmbedBuilder()
				.setColor(randomColor)
				.setTitle(`${animeName}`)
				.setImage(randomGif)
				// .setFooter({ text: `Anime: ${animeName}` })
				.setTimestamp();
			await interaction.reply({ embeds: [embed] });
		}
		catch (error) {
			console.error(error);
			await interaction.reply('⚠️ Something went wrong while fetching a gif.');
		}
	},
};