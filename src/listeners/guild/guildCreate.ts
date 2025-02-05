import { BushListener, Guild, type BushClientEvents } from '#lib';

export default class GuildCreateListener extends BushListener {
	public constructor() {
		super('guildCreate', {
			emitter: 'client',
			event: 'guildCreate', // when the bot joins a guild
			category: 'guild'
		});
	}

	public override async exec(...[guild]: BushClientEvents['guildCreate']) {
		void client.console.info('guildCreate', `Joined <<${guild.name}>> with <<${guild.memberCount?.toLocaleString()}>> members.`);
		const g = await Guild.findByPk(guild.id);
		if (!g) void Guild.create({ id: guild.id });

		const channel = await util.getConfigChannel('servers');
		if (!channel) return;
		return await channel.send({
			embeds: [
				{
					color: util.colors.Green,
					description: `${util.emojis.join} Joined ${util.format.input(
						guild.name
					)} with **${guild.memberCount?.toLocaleString()}** members. I am now in **${client.guilds.cache.size}** guilds.`,
					timestamp: new Date().toISOString(),
					footer: { text: `${guild.id}`, icon_url: guild.iconURL() ?? undefined }
				}
			]
		});
	}
}
