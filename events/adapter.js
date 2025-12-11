const {
	Events,
	GatewayDispatchEvents,
	Status,
} = require('discord.js');

const adapters = new Map();
const trackedClients = new Set();
const trackedShards = new Map();

/**
 * Tracks a Discord.js client and listens for VOICE_SERVER_UPDATE / VOICE_STATE_UPDATE events
 */
function trackClient(client) {
	if (trackedClients.has(client)) return;

	trackedClients.add(client);

	client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (payload) => {
		const adapter = adapters.get(payload.guild_id);
		if (adapter) adapter.onVoiceServerUpdate(payload);
	});

	client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (payload) => {
		if (
			payload.guild_id &&
            payload.session_id &&
            payload.user_id === client.user?.id
		) {
			const adapter = adapters.get(payload.guild_id);
			if (adapter) adapter.onVoiceStateUpdate(payload);
		}
	});

	client.on(Events.ShardDisconnect, (_, shardId) => {
		const guilds = trackedShards.get(shardId);
		if (guilds) {
			for (const guildId of guilds.values()) {
				const adapter = adapters.get(guildId);
				if (adapter) adapter.destroy();
			}
		}
		trackedShards.delete(shardId);
	});
}

function trackGuild(guild) {
	let guilds = trackedShards.get(guild.shardId);

	if (!guilds) {
		guilds = new Set();
		trackedShards.set(guild.shardId, guilds);
	}

	guilds.add(guild.id);
}

/**
 * Creates an adapter for a Voice Channel.
 */
function createDiscordJSAdapter(channel) {
	return (methods) => {
		adapters.set(channel.guild.id, methods);

		trackClient(channel.client);
		trackGuild(channel.guild);

		return {
			sendPayload(data) {
				if (channel.guild.shard.status !== Status.Ready) return false;

				channel.guild.shard.send(data);
				return true;
			},

			destroy() {
				adapters.delete(channel.guild.id);
			},
		};
	};
}

module.exports = {
	createDiscordJSAdapter,
};
