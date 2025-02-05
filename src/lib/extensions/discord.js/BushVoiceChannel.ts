import type {
	BushCategoryChannel,
	BushClient,
	BushDMChannel,
	BushGuild,
	BushGuildBasedChannel,
	BushGuildMember,
	BushNewsChannel,
	BushStageChannel,
	BushTextBasedChannel,
	BushTextChannel,
	BushThreadChannel,
	BushVoiceBasedChannel
} from '#lib';
import { VoiceChannel, type Collection, type Snowflake } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a guild voice channel on Discord.
 */
export class BushVoiceChannel extends VoiceChannel {
	public declare readonly client: BushClient;

	public constructor(guild: BushGuild, data?: RawGuildChannelData) {
		super(guild, data);
	}
}

export interface BushVoiceChannel extends VoiceChannel {
	get members(): Collection<Snowflake, BushGuildMember>;
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
