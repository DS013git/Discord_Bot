const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
	    .setName('google')
	    .setDescription('google anything')
		.addStringOption(option =>
			option
				.setName('input')
				.setDescription('What do you want to search for?')
				.setRequired(true),
		),
	async execute(interaction) {
	    const query = interaction.options.getString('input', true);

		// Acknowledge the command (in case API is slow)
		await interaction.deferReply();

		try {
			// Call DuckDuckGo Instant Answer API
			const url = 'https://api.duckduckgo.com/';
			const { data } = await axios.get(url, {
				params: {
					q: query,
					format: 'json',
					no_html: 1,
					skip_disambig: 1,
				},
			});

			// Prefer AbstractText
			let answer = data.AbstractText;
			let sourceUrl = data.AbstractURL;
			const title = data.Heading || query;

			// If no AbstractText, try first RelatedTopics item
			if (!answer || answer.trim().length === 0) {
				if (Array.isArray(data.RelatedTopics) && data.RelatedTopics.length > 0) {
					const first = data.RelatedTopics[0];

					if (first.Text) {
						answer = first.Text;
						sourceUrl = first.FirstURL || sourceUrl;
					}
					else if (first.Topics && first.Topics.length > 0) {
						// Some responses nest Topics inside RelatedTopics
						answer = first.Topics[0].Text || 'No answer text available.';
						sourceUrl = first.Topics[0].FirstURL || sourceUrl;
					}
				}
			}

			// Still nothing?
			if (!answer || answer.trim().length === 0) {
				return interaction.editReply({
					content: `I couldn't find a clear instant answer for: **${query}**`,
				});
			}

			// Build an embed for a nice look
			const embed = new EmbedBuilder()
				.setTitle(title)
				.setDescription(answer.length > 4000 ? answer.slice(0, 3997) + '...' : answer)
				.setFooter({ text: 'Source: DuckDuckGo Instant Answer' })
				.setTimestamp();

			if (sourceUrl) {
				embed.setURL(sourceUrl);
			}

			await interaction.editReply({ embeds: [embed] });
		}
		catch (error) {
			console.error('DuckDuckGo API error:', error?.response?.data || error.message);

			await interaction.editReply({
				content: 'Sorry, something went wrong while trying to search. Please try again.',
			});
		}
	},
};