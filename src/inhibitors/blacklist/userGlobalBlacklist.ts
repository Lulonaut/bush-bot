import { BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class UserGlobalBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('userGlobalBlacklist', {
			reason: 'userGlobalBlacklist',
			category: 'blacklist',
			type: 'all'
		});
	}

	public exec(message: BushMessage | BushSlashMessage): boolean {
		if (!message.author) return false;
		if (
			this.client.isOwner(message.author) ||
			this.client.isSuperUser(message.author) ||
			this.client.user.id === message.author.id
		)
			return false;
		if (this.client.cache.global.blacklistedUsers.includes(message.author.id)) {
			this.client.console.debug(`userGlobalBlacklist blocked message.`);
			return true;
		}
	}
}
