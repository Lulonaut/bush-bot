import type { BushCategoryChannel, BushClient, BushGuild, BushGuildMember } from '#lib';
import { StoreChannel, type Collection, type Snowflake } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

// eslint-disable-next-line deprecation/deprecation
export class BushStoreChannel extends StoreChannel {
	public declare guild: BushGuild;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public declare readonly parent: BushCategoryChannel | null;

	public constructor(guild: BushGuild, data?: RawGuildChannelData, client?: BushClient) {
		super(guild, data, client);
	}
}
