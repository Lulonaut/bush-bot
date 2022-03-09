import type { BushClient, BushGuildEmoji, BushMessage, BushReactionEmoji } from '#lib';
import { MessageReaction, type Partialize } from 'discord.js';
import type { RawMessageReactionData } from 'discord.js/typings/rawDataTypes';

export type PartialBushMessageReaction = Partialize<BushMessageReaction, 'count'>;

/**
 * Represents a reaction to a message.
 */
export class BushMessageReaction extends MessageReaction {
	public declare readonly client: BushClient;

	public constructor(client: BushClient, data: RawMessageReactionData, message: BushMessage) {
		super(client, data, message);
	}
}

export interface BushMessageReaction extends MessageReaction {
	get emoji(): BushGuildEmoji | BushReactionEmoji;
}
