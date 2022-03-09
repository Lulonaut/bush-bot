import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage, type OptionalArgType } from '#lib';
import assert from 'assert';
import { GuildDefaultMessageNotifications, GuildExplicitContentFilter } from 'discord-api-types/v9';
import {
	ApplicationCommandOptionType,
	Embed,
	Guild,
	GuildMFALevel,
	GuildPremiumTier,
	GuildVerificationLevel,
	PermissionFlagsBits,
	type BaseGuildVoiceChannel,
	type GuildPreview,
	type Snowflake,
	type Vanity
} from 'discord.js';

export default class GuildInfoCommand extends BushCommand {
	public constructor() {
		super('guildInfo', {
			aliases: ['guild-info', 'serverinfo', 'guild', 'server', 'g'],
			category: 'info',
			description: 'Get info about a server.',
			usage: ['guild-info [guild]'],
			examples: ['guild-info 516977525906341928'],
			args: [
				{
					id: 'guild',
					description: 'The guild to find information about.',
					type: util.arg.union('guild', 'snowflake'),
					readableType: 'guild|snowflake',
					prompt: 'What server would you like to find information about?',
					retry: '{error} Choose a valid server to find information about.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: []
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { guild: OptionalArgType<'guild'> | OptionalArgType<'snowflake'> }
	) {
		if (!args.guild && !message.inGuild()) {
			return await message.util.reply(
				`${util.emojis.error} You must either provide an server to provide info about or run this command in a server.`
			);
		}

		let guild: ArgType<'guild'> | ArgType<'snowflake'> | GuildPreview = args.guild ?? message.guild!;
		if (typeof guild === 'string') {
			const preview = await client.fetchGuildPreview(`${args.guild}` as Snowflake).catch(() => undefined);
			if (preview) guild = preview;
			else return await message.util.reply(`${util.emojis.error} That guild is not discoverable or does not exist.`);
		}

		assert(guild);

		if (guild instanceof Guild) {
			await guild.fetch();
		}

		const guildInfoEmbed = new Embed().setTitle(guild.name).setColor(util.colors.default);
		if (guild.icon) guildInfoEmbed.setThumbnail(guild.iconURL({ size: 2048, extension: 'png' }));

		await this.generateAboutField(guildInfoEmbed, guild);

		this.generateStatsField(guildInfoEmbed, guild);

		this.generateSecurityField(guildInfoEmbed, guild);

		this.generateDescription(guildInfoEmbed, guild);

		return await message.util.reply({ embeds: [guildInfoEmbed] });
	}

	private generateDescription(embed: Embed, guild: Guild | GuildPreview) {
		const description: string[] = [];
		const otherEmojis = client.consts.mappings.otherEmojis;

		const verifiedGuilds = Object.values(client.consts.mappings.guilds);
		if (verifiedGuilds.includes(guild.id as typeof verifiedGuilds[number])) description.push(otherEmojis.BushVerified);

		if (guild instanceof Guild) {
			if (guild.premiumTier !== GuildPremiumTier.None) description.push(otherEmojis[`BoostTier${guild.premiumTier}`]);
		}

		const features = client.consts.mappings.features;
		const guildFeatures = guild.features.sort((a, b): number => {
			const aWeight = features[a]?.weight;
			const bWeight = features[b]?.weight;

			if (aWeight !== undefined && bWeight !== undefined) return aWeight - bWeight;
			else if (aWeight === undefined) return 1;
			else if (bWeight === undefined) return -1;
			return 0;
		});

		if (guildFeatures.length) {
			guildFeatures.forEach((feature) => {
				if (features[feature]?.emoji) description.push(`${features[feature].emoji}`);
				else if (features[feature]?.name) description.push(`\`${features[feature].name}\``);
				else description.push(`\`${feature.charAt(0) + util.akairo.snakeToCamelCase(feature).substring(1)}\``);
			});
		}

		if (guild.description) {
			description.push(`\n\n${guild.description}`);
		}

		embed.setDescription(`\u200B${/*zero width space*/ description.join('  ')}`);
	}

	private async generateAboutField(embed: Embed, guild: Guild | GuildPreview) {
		const guildAbout = [];

		if (guild instanceof Guild) {
			const guildRegions = [
				...new Set(
					guild.channels.cache.filter((c) => c.isVoiceBased()).map((c) => (c as BaseGuildVoiceChannel).rtcRegion ?? 'automatic')
				)
			] as RTCRegion[];

			guildAbout.push(
				`**Owner:** ${util.discord.escapeMarkdown(guild.members.cache.get(guild.ownerId)?.user.tag ?? '¯\\_(ツ)_/¯')}`,
				`**Created** ${util.timestampAndDelta(guild.createdAt, 'd')}`,
				`**Members:** ${guild.memberCount.toLocaleString() ?? 0} (${util.emojis.onlineCircle} ${
					guild.approximatePresenceCount?.toLocaleString() ?? 0
				}, ${util.emojis.offlineCircle} ${(guild.memberCount - (guild.approximatePresenceCount ?? 0)).toLocaleString() ?? 0})`,
				`**Regions:** ${guildRegions.map((region) => client.consts.mappings.regions[region] || region).join(', ')}`
			);
			if (guild.premiumSubscriptionCount)
				guildAbout.push(`**Boosts:** Level ${guild.premiumTier} with ${guild.premiumSubscriptionCount ?? 0} boosts`);
			if (guild.me?.permissions.has(PermissionFlagsBits.ManageGuild) && guild.vanityURLCode) {
				const vanityInfo: Vanity = await guild.fetchVanityData();
				guildAbout.push(`**Vanity URL:** discord.gg/${vanityInfo.code}`, `**Vanity Uses:** ${vanityInfo.uses?.toLocaleString()}`);
			}

			if (guild.icon) guildAbout.push(`**Icon:** [link](${guild.iconURL({ size: 4096, extension: 'png' })})`);
			if (guild.banner) guildAbout.push(`**Banner:** [link](${guild.bannerURL({ size: 4096, extension: 'png' })})`);
			if (guild.splash) guildAbout.push(`**Splash:** [link](${guild.splashURL({ size: 4096, extension: 'png' })})`);
		} else {
			guildAbout.push(
				`**Members:** ${guild.approximateMemberCount?.toLocaleString() ?? 0} (${util.emojis.onlineCircle} ${
					guild.approximatePresenceCount?.toLocaleString() ?? 0
				}, ${util.emojis.offlineCircle} ${(
					(guild.approximateMemberCount ?? 0) - (guild.approximatePresenceCount ?? 0)
				).toLocaleString()})`,
				`**Emojis:** ${(guild as GuildPreview).emojis.size?.toLocaleString() ?? 0}`,
				`**Stickers:** ${(guild as GuildPreview).stickers.size}`
			);
		}

		embed.addFields({ name: '» About', value: guildAbout.join('\n') });
	}

	private generateStatsField(embed: Embed, guild: Guild | GuildPreview) {
		if (!(guild instanceof Guild)) return;

		const guildStats: string[] = [];

		const channelTypes = (['Text', 'Voice', 'News', 'Stage', 'Store', 'Category', 'Thread'] as const).map(
			(type) =>
				`${client.consts.mappings.otherEmojis[`Channel${type}`]} ${guild.channels.cache
					.filter((channel) => channel[`is${type}`]())
					.size.toLocaleString()}`
		);

		const EmojiTierMap = {
			[GuildPremiumTier.Tier3]: 500,
			[GuildPremiumTier.Tier2]: 300,
			[GuildPremiumTier.Tier1]: 100,
			[GuildPremiumTier.None]: 50
		} as const;
		const StickerTierMap = {
			[GuildPremiumTier.Tier3]: 60,
			[GuildPremiumTier.Tier2]: 30,
			[GuildPremiumTier.Tier1]: 15,
			[GuildPremiumTier.None]: 0
		} as const;

		guildStats.push(
			`**Channels:** ${guild.channels.cache.size.toLocaleString()} / 500 (${channelTypes.join(', ')})`,
			// subtract 1 for @everyone role
			`**Roles:** ${((guild.roles.cache.size ?? 0) - 1).toLocaleString()} / 250`,
			`**Emojis:** ${guild.emojis.cache.size?.toLocaleString() ?? 0} / ${EmojiTierMap[guild.premiumTier]}`,
			`**Stickers:** ${guild.stickers.cache.size?.toLocaleString() ?? 0} / ${StickerTierMap[guild.premiumTier]}`
		);

		embed.addFields({ name: '» Stats', value: guildStats.join('\n') });
	}

	private generateSecurityField(embed: Embed, guild: Guild | GuildPreview) {
		if (!(guild instanceof Guild)) return;

		const guildSecurity: string[] = [];

		guildSecurity.push(
			`**Verification Level:** ${BushGuildVerificationLevel[guild.verificationLevel]}`,
			`**Explicit Content Filter:** ${BushGuildExplicitContentFilter[guild.explicitContentFilter]}`,
			`**Default Message Notifications:** ${BushGuildDefaultMessageNotifications[guild.defaultMessageNotifications]}`,
			`**2FA Required:** ${guild.mfaLevel === GuildMFALevel.Elevated ? 'True' : 'False'}`
		);

		embed.addFields({ name: '» Security', value: guildSecurity.join('\n') });
	}
}

type RTCRegion =
	| 'us-west'
	| 'us-east'
	| 'us-central'
	| 'us-south'
	| 'singapore'
	| 'southafrica'
	| 'sydney'
	| 'europe'
	| 'brazil'
	| 'hongkong'
	| 'russia'
	| 'japan'
	| 'india'
	| 'automatic';

enum BushGuildVerificationLevel {
	'None' = GuildVerificationLevel.None,
	'Low' = GuildVerificationLevel.Low,
	'Medium' = GuildVerificationLevel.Medium,
	'High' = GuildVerificationLevel.High,
	'Very High' = GuildVerificationLevel.VeryHigh
}

enum BushGuildExplicitContentFilter {
	'Disabled' = GuildExplicitContentFilter.Disabled,
	'Members Without Roles' = GuildExplicitContentFilter.MembersWithoutRoles,
	'All Members' = GuildExplicitContentFilter.AllMembers
}

enum BushGuildDefaultMessageNotifications {
	'All Messages' = GuildDefaultMessageNotifications.AllMessages,
	'Only Mentions' = GuildDefaultMessageNotifications.OnlyMentions
}
