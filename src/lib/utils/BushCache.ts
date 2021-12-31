import { type Guild } from '#lib';
import { Collection, type Snowflake } from 'discord.js';

export class BushCache {
	public global = new GlobalCache();
	public guilds = new GuildCache();
}

export class GlobalCache {
	public superUsers: Snowflake[] = [];
	public disabledCommands: string[] = [];
	public blacklistedChannels: Snowflake[] = [];
	public blacklistedGuilds: Snowflake[] = [];
	public blacklistedUsers: Snowflake[] = [];
}

export class GuildCache extends Collection<Snowflake, Guild> {}
