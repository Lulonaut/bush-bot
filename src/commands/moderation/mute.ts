import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage, BushUser } from '@lib';
import { Moderation } from '../../lib/common/Moderation';

export default class MuteCommand extends BushCommand {
	public constructor() {
		super('mute', {
			aliases: ['mute'],
			category: 'moderation',
			description: {
				content: 'Mute a user.',
				usage: 'mute <member> [reason] [duration]',
				examples: ['mute ironm00n 1 day commands in #general']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to mute?',
						retry: '{error} Choose a valid user to mute.'
					}
				},
				{
					id: 'reason',
					type: 'contentWithDuration',
					match: 'rest',
					prompt: {
						start: 'Why should this user be muted and for how long?',
						retry: '{error} Choose a valid mute reason and duration.',
						optional: true
					}
				},
				{
					id: 'force',
					flag: '--force',
					match: 'flag'
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'user',
					description: 'What user would you like to mute?',
					type: 'USER',
					required: true
				},
				{
					name: 'reason',
					description: 'Why should this user be muted and for how long?',
					type: 'STRING',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['MANAGE_ROLES']),
			userPermissions: (m) => util.userGuildPermCheck(m, ['MANAGE_MESSAGES'])
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		{
			user,
			reason,
			force
		}: { user: BushUser; reason?: { duration: number | null; contentWithoutTime: string }; force: boolean }
	): Promise<unknown> {
		if (reason?.duration === null) reason.duration = 0;
		const member = await message.guild!.members.fetch(user.id).catch(() => null);
		if (!member)
			return await message.util.reply(
				`${util.emojis.error} The user you selected is not in the server or is not a valid user.`
			);

		if (!message.member) throw new Error(`message.member is null`);
		const useForce = force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, 'mute', true, useForce);
		const victimBoldTag = `**${member.user.tag}**`;

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		let time: number;
		if (reason) {
			time =
				typeof reason === 'string'
					? await util.arg.cast('duration', client.commandHandler.resolver, message as BushMessage, reason)
					: reason.duration;
		}
		const parsedReason = reason?.contentWithoutTime ?? '';

		const responseCode = await member.mute({
			reason: parsedReason,
			moderator: message.member,
			duration: time! ?? 0
		});

		const responseMessage = async () => {
			const prefix = await message.guild!.getSetting('prefix');
			switch (responseCode) {
				case 'missing permissions':
					return `${util.emojis.error} Could not mute ${victimBoldTag} because I am missing the **Manage Roles** permission.`;
				case 'no mute role':
					return `${util.emojis.error} Could not mute ${victimBoldTag}, you must set a mute role with \`${prefix}config muteRole\`.`;
				case 'invalid mute role':
					return `${util.emojis.error} Could not mute ${victimBoldTag} because the current mute role no longer exists. Please set a new mute role with \`${prefix}config muteRole\`.`;
				case 'mute role not manageable':
					return `${util.emojis.error} Could not mute ${victimBoldTag} because I cannot assign the current mute role, either change the role's position or set a new mute role with \`${prefix}config muteRole\`.`;
				case 'error giving mute role':
					return `${util.emojis.error} Could not mute ${victimBoldTag}, there was an error assigning them the mute role.`;
				case 'error creating modlog entry':
					return `${util.emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
				case 'error creating mute entry':
					return `${util.emojis.error} There was an error creating a punishment entry, please report this to my developers.`;
				case 'failed to dm':
					return `${util.emojis.warn} Muted **${member.user.tag}** however I could not send them a dm.`;
				case 'success':
					return `${util.emojis.success} Successfully muted **${member.user.tag}**.`;
			}
		};
		return await message.util.reply({ content: await responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
