import { BushListener, type BushClientEvents } from '#lib';

export default class DiscordJsWarnListener extends BushListener {
	public constructor() {
		super('discordJsWarn', {
			emitter: 'client',
			event: 'warn',
			category: 'client'
		});
	}

	public override async exec(...[message]: BushClientEvents['warn']): Promise<void> {
		void client.console.superVerbose('dc.js-warn', message);
	}
}
