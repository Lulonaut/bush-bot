import { BushListener, type BushClientEvents } from '#lib';
import { Embed, GuildMember } from 'discord.js';

export default class BushRemoveTimeoutListener extends BushListener {
	public constructor() {
		super('bushRemoveTimeout', {
			emitter: 'client',
			event: 'bushRemoveTimeout',
			category: 'member-custom'
		});
	}

	public override async exec(...[victim, moderator, guild, reason, caseID, dmSuccess]: BushClientEvents['bushRemoveTimeout']) {
		const logChannel = await guild.getLogChannel('moderation');
		if (!logChannel) return;
		const user = victim instanceof GuildMember ? victim.user : victim;

		const logEmbed = new Embed()
			.setColor(util.colors.Green)
			.setTimestamp()
			.setFooter({ text: `CaseID: ${caseID}` })
			.setAuthor({ name: user.tag, iconURL: user.avatarURL({ extension: 'png', size: 4096 }) ?? undefined })
			.addFields({ name: '**Action**', value: `${'Remove Timeout'}` })
			.addFields({ name: '**User**', value: `${user} (${user.tag})` })
			.addFields({ name: '**Moderator**', value: `${moderator} (${moderator.tag})` })
			.addFields({ name: '**Reason**', value: `${reason ? reason : '[No Reason Provided]'}` });
		if (dmSuccess === false) logEmbed.addFields({ name: '**Additional Info**', value: 'Could not dm user.' });
		return await logChannel.send({ embeds: [logEmbed] });
	}
}
