/* eslint-disable deprecation/deprecation */
import type {
	BushCategoryChannel,
	BushClient,
	BushMessageManager,
	BushNewsChannel,
	BushStageChannel,
	BushStoreChannel,
	BushTextBasedChannel,
	BushTextChannel,
	BushThreadChannel,
	BushUser,
	BushVoiceBasedChannel,
	BushVoiceChannel
} from '#lib';
import { DMChannel, PartialGroupDMChannel, type Partialize } from 'discord.js';
import type { RawDMChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a direct message channel between two users.
 */
export class BushDMChannel extends DMChannel {
	public declare readonly client: BushClient;
	public declare messages: BushMessageManager;
	public declare recipient: BushUser;

	public constructor(client: BushClient, data?: RawDMChannelData) {
		super(client, data);
	}
}

export interface BushDMChannel extends DMChannel {
	isText(): this is BushTextChannel;
	isDM(): this is BushDMChannel;
	isDMBased(): this is PartialGroupDMChannel | BushDMChannel;
	isVoice(): this is BushVoiceChannel;
	isCategory(): this is BushCategoryChannel;
	isNews(): this is BushNewsChannel;
	isStore(): this is BushStoreChannel;
	isThread(): this is BushThreadChannel;
	isStage(): this is BushStageChannel;
	isTextBased(): this is BushTextBasedChannel;
	isVoiceBased(): this is BushVoiceBasedChannel;
}

export interface PartialBushDMChannel extends Partialize<BushDMChannel, null, null, 'lastMessageId'> {
	lastMessageId: undefined;
}
