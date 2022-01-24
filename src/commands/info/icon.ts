import { BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { MessageEmbed, Permissions } from 'discord.js';

export default class IconCommand extends BushCommand {
	constructor() {
		super('icon', {
			aliases: ['icon', 'guildavatar', 'severicon', 'guildicon'],
			category: 'info',
			description: "A command to get the server's icon",
			usage: ['icon'],
			examples: ['icon'],
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [Permissions.FLAGS.EMBED_LINKS], true),
			userPermissions: [],
			channel: 'guild',
			slash: true
		});
	}

	override async exec(message: BushMessage | BushSlashMessage) {
		const embed = new MessageEmbed()
			.setTimestamp()
			.setColor(util.colors.default)
			.setImage(
				message.guild!.iconURL({
					size: 2048,
					format: 'png'
				})!
			)
			.setTitle(util.discord.escapeMarkdown(message.guild!.name));
		await message.util.reply({ embeds: [embed] });
	}
}
