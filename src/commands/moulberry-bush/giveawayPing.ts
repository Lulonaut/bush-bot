import { AllowedMentions, BushCommand, type BushMessage } from '#lib';
import { PermissionFlagsBits } from 'discord.js';

export default class GiveawayPingCommand extends BushCommand {
	public constructor() {
		super('giveawayPing', {
			aliases: ['giveaway-ping', 'giveaway-pong'],
			category: "Moulberry's Bush",
			description: 'Pings the giveaway role.',
			usage: ['giveaway-ping'],
			examples: ['giveaway-ping'],
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.ManageMessages], true),
			userPermissions: [
				PermissionFlagsBits.ManageGuild,
				PermissionFlagsBits.ManageMessages,
				PermissionFlagsBits.BanMembers,
				PermissionFlagsBits.KickMembers,
				PermissionFlagsBits.ViewChannel
			],
			channel: 'guild',
			ignoreCooldown: [],
			ignorePermissions: [],
			cooldown: 1.44e7, //4 hours
			ratelimit: 1,
			editable: false,
			restrictedGuilds: ['516977525906341928'],
			restrictedChannels: ['767782084981817344', '833855738501267456']
		});
	}

	public override async exec(message: BushMessage) {
		if (!message.member!.permissions.has(PermissionFlagsBits.ManageGuild) && !message.member!.user.isOwner())
			await message.util.reply(`${util.emojis.error} You are missing the **ManageGuild** permission.`);

		await message.delete().catch(() => {});

		return await message.channel.send({
			content:
				'🎉 <@&767782793261875210> Giveaway.\n\n<:mad:783046135392239626> Spamming, line breaking, gibberish etc. disqualifies you from winning. We can and will ban you from giveaways. Winners will all be checked and rerolled if needed.',
			allowedMentions: AllowedMentions.roles()
		});

		//! Broken
		/* const webhooks = await (message.channel as TextChannel | NewsChannel).fetchWebhooks();
		let webhookClient: WebhookClient;
		if (webhooks.size < 1) {
			const webhook = await (message.channel as TextChannel | NewsChannel).createWebhook('Giveaway ping webhook');
			webhookClient = new WebhookClient(webhook.id, webhook.token);
		} else {
			const webhook = webhooks.first();
			webhookClient = new WebhookClient(webhook.id, webhook.token);
		}
		return await webhookClient.send({
			content:
				'🎉 <@&767782793261875210> Giveaway.\n\n<:mad:783046135392239626> Spamming, line breaking, gibberish etc. disqualifies you from winning. We can and will ban you from giveaways. Winners will all be checked and rerolled if needed.',
			username: `${message.member.nickname || message.author.username}`,
			avatarURL: message.author.avatarURL(),
			allowedMentions: AllowedMentions.roles()
		}); */
	}
}
