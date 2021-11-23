import { type Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel.js';
import { jsonBigint } from './__helpers.js';
const { DataTypes } = (await import('sequelize')).default;

type Environment = 'production' | 'development' | 'beta';

export interface StatModel {
	environment: Environment;
	commandsUsed: bigint;
}

export interface StatModelCreationAttributes {
	environment: Environment;
	commandsUsed?: bigint;
}

export class Stat extends BaseModel<StatModel, StatModelCreationAttributes> implements StatModel {
	/**
	 * The bot's environment.
	 */
	public declare environment: Environment;

	/**
	 * The number of commands used
	 */
	public declare commandsUsed: bigint;

	public static initModel(sequelize: Sequelize): void {
		Stat.init(
			{
				environment: { type: DataTypes.STRING, primaryKey: true },
				commandsUsed: jsonBigint('commandsUsed')
			},
			{ sequelize }
		);
	}
}
