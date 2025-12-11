// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, ActivityType } = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { token } = require('./config.json');
const mongoose = require('mongoose');
require('dotenv').config();
const initReminderSystem = require('./events/reminder.js');


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });

client.cooldowns = new Collection();
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.

// client.on(Events.InteractionCreate, interaction => {
// 	console.log(interaction);
// });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	client.user.setActivity('I am cursed', {
		type: ActivityType.Watching,
	});
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	const { cooldowns } = interaction.client;

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, flags: MessageFlags.Ephemeral });
		}
	}

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
		else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.on('messageCreate', message => {
	if (message.author.bot) return;

	if (message.content.startsWith('DS')) {
		const input = message.content.slice(2).trim();
		const parts = input.split(/\s+/);
		const minutes = parseFloat(parts[0]);
		const reason = parts.slice(1).join(' ') || 'No reason provided';
		if (isNaN(minutes) || minutes <= 0) {
			return message.reply('Type DS, the number of minutes and the reason for the reminder. Example: DS 5 (for 5 minutes)');
		}
		const ms = minutes * 60 * 1000;
		const MAX_MS = 2147483647;
		if (ms > MAX_MS) {
			return message.reply('The maximum number of minutes for a reminder is 35791 minutes (about 25 days). Please enter a smaller number.');
		}
		message.reply(`Reminder set for **${minutes} minute(s)** with reason: ${reason}.`);

		setTimeout(() => {
			message.reply(`@${message.author.id} **${reason}**`);
		}, ms);
	}
});
// this code is for commands that you can only see
// client.on(Events.InteractionCreate, async interaction => {
// 	if (!interaction.isChatInputCommand()) return;

// 	if (interaction.commandName === 'ping') {
// 		await interaction.reply({ content: 'Secret Pong!', flags: MessageFlags.Ephemeral });
// 	}
// });

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
		// command handling
	}
	else if (interaction.isAutocomplete()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.autocomplete(interaction);
		}
		catch (error) {
			console.error(error);
		}
	}
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'ping') {
		// Create the modal
		const modal = new ModalBuilder()
			.setCustomId('myModal')
			.setTitle('My Modal');

		// Add components to modal

		// Create the text input components
		const favoriteColorInput = new TextInputBuilder()
			.setCustomId('favoriteColorInput')
		    // The label is the prompt the user sees for this input
			.setLabel('What\'s your favorite color?')
		    // Short means only a single line of text
			.setStyle(TextInputStyle.Short);

		const hobbiesInput = new TextInputBuilder()
			.setCustomId('hobbiesInput')
			.setLabel('What\'s some of your favorite hobbies?')
		    // Paragraph means multiple lines of text.
			.setStyle(TextInputStyle.Paragraph);

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
		const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);

		// Add inputs to the modal
		modal.addComponents(firstActionRow, secondActionRow);

		// Show the modal to the user
		await interaction.showModal(modal);
	}
});

client.on(Events.InteractionCreate, (interaction) => {
	if (!interaction.isModalSubmit()) return;
	console.log(interaction);
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isUserContextMenuCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
	}
});


// Log in to Discord with your client's token
async function start() {
	try {
		const mongoUri = process.env.MONGO_URI || process.env.mongoURL;
		if (!mongoUri) {
			throw new Error('Mongo URI not found in env');
		}

		await mongoose.connect(mongoUri);
		console.log('Connected to MongoDB');

		await client.login(token);
		console.log('Logged in to Discord');

		// Initialize the reminder system after bot is ready
		client.on(Events.ClientReady, () => {
			initReminderSystem(client);
		});
	}
	catch (err) {
		console.error('Failed to start bot:', err);
		process.exit(1);
	}
}

start();