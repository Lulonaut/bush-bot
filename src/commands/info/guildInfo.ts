import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage, type OptionalArgType } from '#lib';
import assert from 'assert';
import {
	Constants,
	Guild,
	MessageEmbed,
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
					slashType: 'STRING'
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
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

		const otherEmojis = client.consts.mappings.otherEmojis;
		let isPreview = false;
		let _guild: ArgType<'guild'> | ArgType<'snowflake'> | GuildPreview = args.guild ?? message.guild!;
		if (typeof _guild === 'string') {
			const preview = await client.fetchGuildPreview(`${args.guild}` as Snowflake).catch(() => {});
			if (preview) {
				_guild = preview;
				isPreview = true;
			} else {
				return await message.util.reply(`${util.emojis.error} That guild is not discoverable or does not exist.`);
			}
		}

		const guild: Guild | GuildPreview = _guild;
		assert(guild);
		const emojis: string[] = [];
		const guildAbout: string[] = [];
		const guildStats: string[] = [];
		const guildSecurity: string[] = [];
		const verifiedGuilds = Object.values(client.consts.mappings.guilds);
		if (verifiedGuilds.includes(guild.id as typeof verifiedGuilds[number])) emojis.push(otherEmojis.BUSH_VERIFIED);

		if (!isPreview && guild instanceof Guild) {
			if (guild.premiumTier !== 'NONE') emojis.push(otherEmojis[`BOOST_${guild.premiumTier}`]);
			await guild.fetch();
			const channels = guild.channels.cache;

			const channelTypes = (
				['GUILD_TEXT', 'GUILD_VOICE', 'GUILD_STAGE_VOICE', 'GUILD_STORE', 'GUILD_CATEGORY', 'THREAD'] as const
			).map((type) => `${otherEmojis[type]} ${channels.filter((channel) => channel.type.includes(type)).size.toLocaleString()}`);

			const guildRegions = [
				...new Set(
					guild.channels.cache.filter((c) => c.isVoice()).map((c) => (c as BaseGuildVoiceChannel).rtcRegion ?? 'automatic')
				)
			] as RTCRegion[];

			guildAbout.push(
				`**Owner:** ${util.discord.escapeMarkdown(guild.members.cache.get(guild.ownerId)?.user.tag ?? '¯\\_(ツ)_/¯')}`,
				`**Created** ${util.timestamp(guild.createdAt)} (${util.dateDelta(guild.createdAt)})`,
				`**Members:** ${guild.memberCount.toLocaleString() ?? 0} (${util.emojis.onlineCircle} ${
					guild.approximatePresenceCount?.toLocaleString() ?? 0
				}, ${util.emojis.offlineCircle} ${(guild.memberCount - (guild.approximatePresenceCount ?? 0)).toLocaleString() ?? 0})`,
				`**Regions:** ${guildRegions.map((region) => client.consts.mappings.regions[region] || region).join(', ')}`
			);
			if (guild.premiumSubscriptionCount)
				guildAbout.push(
					`**Boosts:** Level ${Constants.PremiumTiers[guild.premiumTier]} with ${guild.premiumSubscriptionCount ?? 0} boosts`
				);
			if (guild.me?.permissions.has('MANAGE_GUILD') && guild.vanityURLCode) {
				const vanityInfo: Vanity = await guild.fetchVanityData();
				guildAbout.push(`**Vanity URL:** discord.gg/${vanityInfo.code}`, `**Vanity Uses:** ${vanityInfo.uses?.toLocaleString()}`);
			}

			if (guild.icon) guildAbout.push(`**Icon:** [link](${guild.iconURL({ dynamic: true, size: 4096, format: 'png' })})`);
			if (guild.banner) guildAbout.push(`**Banner:** [link](${guild.bannerURL({ size: 4096, format: 'png' })})`);
			if (guild.splash) guildAbout.push(`**Splash:** [link](${guild.splashURL({ size: 4096, format: 'png' })})`);

			const EmojiTierMap = {
				TIER_3: 500,
				TIER_2: 300,
				TIER_1: 100,
				NONE: 50
			} as const;
			const StickerTierMap = {
				TIER_3: 60,
				TIER_2: 30,
				TIER_1: 15,
				NONE: 0
			} as const;

			guildStats.push(
				`**Channels:** ${guild.channels.cache.size.toLocaleString()} / 500 (${channelTypes.join(', ')})`,
				// subtract 1 for @everyone role
				`**Roles:** ${((guild.roles.cache.size ?? 0) - 1).toLocaleString()} / 250`,
				`**Emojis:** ${guild.emojis.cache.size?.toLocaleString() ?? 0} / ${EmojiTierMap[guild.premiumTier]}`,
				`**Stickers:** ${guild.stickers.cache.size?.toLocaleString() ?? 0} / ${StickerTierMap[guild.premiumTier]}`
			);

			guildSecurity.push(
				`**Verification Level**: ${guild.verificationLevel.toLowerCase().replace(/_/g, ' ')}`,
				`**Explicit Content Filter:** ${guild.explicitContentFilter.toLowerCase().replace(/_/g, ' ')}`,
				`**Default Message Notifications:** ${
					typeof guild.defaultMessageNotifications === 'string'
						? guild.defaultMessageNotifications.toLowerCase().replace(/_/g, ' ')
						: guild.defaultMessageNotifications
				}`,
				`**2FA Required**: ${guild.mfaLevel === 'ELEVATED' ? 'yes' : 'no'}`
			);
		} else {
			guildAbout.push(
				`**Members:** ${guild.approximateMemberCount?.toLocaleString() ?? 0} (${util.emojis.onlineCircle} ${
					guild.approximatePresenceCount?.toLocaleString() ?? 0
				}, ${util.emojis.offlineCircle} ${(
					(guild.approximateMemberCount ?? 0) - (guild.approximatePresenceCount ?? 0)
				).toLocaleString()})`,
				`**Emojis:** ${(guild as GuildPreview).emojis.size?.toLocaleString() ?? 0}`
				// `**Stickers:** ${(guild as GuildPreview).stickers.size}`
			);
		}

		const features = client.consts.mappings.features;
		const guildFeatures = guild.features.sort((a, b): number => {
			const aWeight = features[a]?.weight;
			const bWeight = features[b]?.weight;

			if (aWeight !== undefined && bWeight !== undefined) return aWeight - bWeight;
			else if (aWeight == undefined) return 1;
			else if (bWeight == undefined) return -1;
			return 0;
		});
		if (guildFeatures.length) {
			guildFeatures.forEach((feature) => {
				if (features[feature]?.emoji) emojis.push(`${features[feature].emoji}`);
				else if (features[feature]?.name) emojis.push(`\`${features[feature].name}\``);
				else emojis.push(`\`${feature}\``);
			});
		}

		if (guild.description) {
			emojis.push(`\n\n${guild.description}`);
		}

		const guildInfoEmbed = new MessageEmbed()
			.setTitle(guild.name)
			.setColor(util.colors.default)
			.addField('» About', guildAbout.join('\n'));
		if (guildStats.length) guildInfoEmbed.addField('» Stats', guildStats.join('\n'));
		const guildIcon = guild.iconURL({ size: 2048, format: 'png', dynamic: true });
		if (guildIcon) {
			guildInfoEmbed.setThumbnail(guildIcon);
		}
		if (!isPreview) {
			guildInfoEmbed.addField('» Security', guildSecurity.join('\n'));
		}
		if (emojis) {
			guildInfoEmbed.setDescription(`\u200B${/*zero width space*/ emojis.join('  ')}`);
		}
		return await message.util.reply({ embeds: [guildInfoEmbed] });
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
