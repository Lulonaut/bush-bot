import { UserInfoCommand } from '#commands';
import { type BushGuild } from '#lib';
import { ContextMenuCommand } from 'discord-akairo';
import { ApplicationCommandType, type ContextMenuCommandInteraction } from 'discord.js';

export default class UserInfoContextMenuCommand extends ContextMenuCommand {
	public constructor() {
		super('userInfo', {
			name: 'User Info',
			type: ApplicationCommandType.User,
			category: 'user'
		});
	}

	public override async exec(interaction: ContextMenuCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const user = await client.users.fetch(interaction.targetId).catch(() => null);
		if (!user) return interaction.reply(`⁉ I couldn't find that user`);

		const guild = interaction.guild as BushGuild;

		const member = await guild.members.fetch(interaction.targetId).catch(() => null);
		if (!member) return interaction.reply(`${util.format.input(user.tag)} doesn't appear to be a member of this server anymore.`);

		const userEmbed = await UserInfoCommand.makeUserInfoEmbed(user, member, guild);

		return await interaction.editReply({ embeds: [userEmbed] });
	}
}
