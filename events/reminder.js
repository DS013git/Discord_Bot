// events/reminder.js
const { EmbedBuilder } = require('discord.js');
const reminderSchema = require('../Schemas.js/remindSchema.js');

async function initReminderSystem(client) {
	console.log('Reminder system started');

	const baseEmbed = new EmbedBuilder()
		.setColor('#000000')
		.setTitle('Reminder!');

	// Send one reminder and remove it from DB
	async function sendReminder(reminderDoc) {
		try {
			const user = await client.users.fetch(reminderDoc.UserID).catch(() => null);
			if (!user) {
				console.log('Could not fetch user', reminderDoc.UserID);
				// still delete so it doesn't loop forever
				await reminderSchema.deleteOne({ _id: reminderDoc._id }).catch(console.error);
				return;
			}

			if (reminderDoc.Urgent) {
				await user.send('Urgent reminder!').catch(console.error);
			}

			const embed = EmbedBuilder.from(baseEmbed)
				.setDescription(reminderDoc.Remind);

			await user.send({ embeds: [embed] }).catch(console.error);

			// IMPORTANT: delete so it doesn't repeat
			await reminderSchema.deleteOne({ _id: reminderDoc._id }).catch(console.error);
			console.log('Sent and deleted reminder', reminderDoc._id.toString());
		}
		catch (e) {
			console.error('Error sending reminder:', e);
		}
	}

	// Poll every 5 seconds for due reminders
	setInterval(async () => {
		const now = Date.now();

		// Find all due reminders (Time <= now)
		const overdue = await reminderSchema.find({ Time: { $lte: now } });

		if (overdue.length > 0) {
			console.log('Overdue reminders found:', overdue.length);
		}

		for (const reminder of overdue) {
			await sendReminder(reminder);
		}
	}, 5000);
}

module.exports = initReminderSystem;
