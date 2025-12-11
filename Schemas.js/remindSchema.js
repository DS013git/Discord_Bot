const { model, Schema } = require('mongoose');

const reminderSchema = new Schema({
	UserID: {
		type: String,
		required: true,
	},
	Time: {
		type: Number,
		required: true,
	},
	Remind: {
		type: String,
		required: true,
	},
	Urgent: {
		type: Boolean,
		required: true,
	},
});
module.exports = model('Reminder', reminderSchema);
