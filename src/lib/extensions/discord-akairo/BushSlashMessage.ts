import { type BushClient, type BushCommandUtil, type BushGuild, type BushGuildMember, type BushUser } from '#lib';
import { AkairoMessage } from 'discord-akairo';
import { type CommandInteraction } from 'discord.js';

export class BushSlashMessage extends AkairoMessage {
	public declare client: BushClient;
	public declare util: BushCommandUtil<BushSlashMessage>;
	public declare author: BushUser;
	public declare member: BushGuildMember | null;
	public constructor(client: BushClient, interaction: CommandInteraction) {
		super(client, interaction);
	}
}

export interface BushSlashMessage {
	get guild(): BushGuild | null;
}
