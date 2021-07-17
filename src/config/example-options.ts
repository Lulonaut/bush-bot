import { Snowflake } from 'discord.js';

// Credentials
export const credentials = {
	token: 'Token Here',
	devToken: 'Token Here',
	hypixelApiKey: 'API Key Here'
};

// Options
export const owners: Snowflake[] = [
	'322862723090219008', //IRONM00N
	'464970779944157204', //TrashCan
	'487443883127472129' //Tyman
];
export const prefix = '-' as string;
export const dev = true as boolean;
export const devGuild = '1000000000000000' as Snowflake;
export const channels: { log: Snowflake; error: Snowflake; dm: Snowflake; } = {
	log: '1000000000000000',
	error: '1000000000000000',
	dm: '1000000000000000',
};

// Database specific
export const db = {
	host: 'localhost',
	port: 5432,
	username: 'username here',
	password: 'password here'
};

// Logging
export const logging: { db: boolean; verbose: boolean; info: boolean } = {
	db: false,
	verbose: true,
	info: true
};
