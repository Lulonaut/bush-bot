import {
	BushDMChannel,
	BushGuildBasedChannel,
	BushNewsChannel,
	BushStageChannel,
	BushTextBasedChannel,
	BushTextChannel,
	BushThreadChannel,
	BushVoiceBasedChannel,
	BushVoiceChannel,
	type BushCategoryChannelChildManager,
	type BushClient,
	type BushGuild
} from '#lib';
import { CategoryChannel } from 'discord.js';
import { type RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a guild category channel on Discord.
 */
export class BushCategoryChannel extends CategoryChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;

	public constructor(guild: BushGuild, data?: RawGuildChannelData, client?: BushClient, immediatePatch?: boolean) {
		super(guild, data, client, immediatePatch);
	}
}

export interface BushCategoryChannel extends CategoryChannel {
	get children(): BushCategoryChannelChildManager;
	isText(): this is BushTextChannel;
	isDM(): this is BushDMChannel;
	isVoice(): this is BushVoiceChannel;
	isCategory(): this is BushCategoryChannel;
	isNews(): this is BushNewsChannel;
	isThread(): this is BushThreadChannel;
	isStage(): this is BushStageChannel;
	isTextBased(): this is BushGuildBasedChannel & BushTextBasedChannel;
	isVoiceBased(): this is BushVoiceBasedChannel;
}
