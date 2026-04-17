import config from '../../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';

export interface Database {
	User: any;
}

export const db: Database = {} as Database;

function formatConnectionError(error: unknown): string {
	if (!error || typeof error !== 'object') {
		return String(error);
	}

	const anyError = error as any;
	const code = anyError.code ? String(anyError.code) : undefined;
	const errno = anyError.errno ? String(anyError.errno) : undefined;
	const message = anyError.message ? String(anyError.message) : undefined;

	return [code, errno ? `errno ${errno}` : undefined, message].filter(Boolean).join(' | ');
}

export async function initialize(): Promise<void> {
	const databaseConfig = config as unknown as {
		database: {
			host: string;
			port: number;
			user: string;
			password: string;
			database: string;
		};
	};

	const { host, port, user, password, database } = databaseConfig.database;
	let connection: any;

	try {
		connection = (await mysql.createConnection({
			host,
			port,
			user,
			password,
			connectTimeout: 10_000,
		})) as any;
	} catch (error) {
		const details = formatConnectionError(error);
		throw new Error(
			`Unable to connect to MySQL at ${host}:${port}. ` +
				`(details: ${details || 'unknown'}) ` +
				`Make sure the MySQL server is running and reachable (and that config.json values are correct).`,
		);
	}

	await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
	await connection.end();

	let sequelize: Sequelize;

	try {
		sequelize = new Sequelize(database, user, password, {
			host,
			port,
			dialect: 'mysql',
			logging: false,
		});
		await sequelize.authenticate();
	} catch (error) {
		const details = formatConnectionError(error);
		throw new Error(
			`Unable to initialize Sequelize for database "${database}" on ${host}:${port}. ` +
				`(details: ${details || 'unknown'}) ` +
				`Check that MySQL is available and that the database exists or can be created.`,
		);
	}

	const { default: userModel } = await import('../_users/user.model');
	db.User = userModel(sequelize);

	await sequelize.sync({ alter: true });
	console.log('✅ Database initialized and models synced');
}
