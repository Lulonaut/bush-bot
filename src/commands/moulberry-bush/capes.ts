import { BushCommand, ButtonPaginator, DeleteButton, type BushMessage, type OptionalArgType } from '#lib';
import assert from 'assert';
import { APIEmbed } from 'discord-api-types/v10';
import { ApplicationCommandOptionType, AutocompleteInteraction, PermissionFlagsBits } from 'discord.js';
import Fuse from 'fuse.js';
import got from 'got';

assert(Fuse);
assert(got);

export default class CapesCommand extends BushCommand {
	public constructor() {
		super('capes', {
			aliases: ['capes', 'cape'],
			category: "Moulberry's Bush",
			description: 'A command to see what a cape looks like.',
			usage: ['capes [cape]'],
			examples: ['capes', 'cape space'],
			args: [
				{
					id: 'cape',
					description: 'The cape to view.',
					type: 'string',
					prompt: 'What cape would you like to see?',
					retry: '{error} Choose a cape to see.',
					optional: true,
					slashType: ApplicationCommandOptionType.String,
					autocomplete: true
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage, args: { cape: OptionalArgType<'string'> }) {
		const { tree: neuFileTree }: GithubTreeApi = await got
			.get('https://api.github.com/repos/Moulberry/NotEnoughUpdates/git/trees/master?recursive=1')
			.json();
		const rawCapes = neuFileTree
			.map((f) => ({
				match: f.path.match(/src\/main\/resources\/assets\/notenoughupdates\/capes\/(?<name>\w+)_preview\.png/),
				f
			}))
			.filter((f) => f.match !== null);

		const capes: { name: string; url: string; index: number; purchasable?: boolean }[] = [
			...client.consts.mappings.capes
				.filter((c) => !rawCapes.some((gitCape) => gitCape.match!.groups!.name === c.name) && c.custom)
				.map((c) => ({ name: c.name, url: c.custom!, index: c.index, purchasable: c.purchasable })),
			...rawCapes.map((c) => {
				const mapCape = client.consts.mappings.capes.find((a) => a.name === c.match!.groups!.name);
				const url = mapCape?.custom ?? `https://github.com/Moulberry/NotEnoughUpdates/raw/master/${c.f.path}`;
				const index = mapCape?.index !== undefined ? mapCape.index : null;
				return { name: c.match!.groups!.name, url, index: index!, purchasable: mapCape?.purchasable };
			})
		].sort((a, b) => {
			if (a?.index !== undefined && b.index !== undefined) return a.index - b?.index;
			else if (a.index === undefined) return 1;
			else if (b.index === undefined) return -1;
			return 0;
		});

		if (args.cape) {
			const cape = capes.find((s_cape) => s_cape.name === args.cape);
			if (cape) {
				const embed = this.makeEmbed(cape);
				await DeleteButton.send(message, { embeds: [embed] });
			} else {
				await message.util.reply(`${util.emojis.error} Cannot find a cape called ${util.format.input(args.cape)}.`);
			}
		} else {
			const embeds: APIEmbed[] = capes.map(this.makeEmbed);
			await ButtonPaginator.send(message, embeds, null);
		}
	}

	private makeEmbed(cape: { name: string; url: string; index: number; purchasable?: boolean | undefined }): APIEmbed {
		return {
			title: `${cape.name} cape`,
			color: util.colors.default,
			timestamp: new Date().toISOString(),
			image: { url: cape.url },
			description: cape.purchasable
				? ':money_with_wings: **purchasable** (with preexisting cape points) :money_with_wings:'
				: undefined
		};
	}

	public override autocomplete(interaction: AutocompleteInteraction) {
		const capes = client.consts.mappings.capes.map((v) => v.name);

		const fuzzy = new Fuse(capes, {
			threshold: 0.5,
			isCaseSensitive: false,
			findAllMatches: true
		}).search(interaction.options.getFocused().toString());

		const res = (fuzzy.length ? fuzzy : capes.map((c) => ({ item: c })))
			.slice(0, fuzzy.length >= 25 ? 25 : undefined)
			.map((v) => ({ name: v.item, value: v.item }));

		void interaction.respond(res);
	}
}

export interface GithubFile {
	path: string;
	mode: string;
	type: string;
	sha: string;
	size: number;
	url: string;
}

export interface GithubBlob {
	encoding: string;
	content: string;
	sha: string;
	node_id: string;
	url: string;
	size: number;
}

export interface GithubTreeApi {
	sha: string;
	url: string;
	tree: GithubFile[];
	truncated: boolean;
}
