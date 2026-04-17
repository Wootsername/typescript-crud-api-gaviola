import cors from 'cors';
import express, { Application } from 'express';
import { initialize } from './_helpers/db';
import { errorHandler } from './_middleware/errorHandler';
import usersController from './_users/users.controller';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/users', usersController);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

initialize()
	.then(() => {
		app.listen(PORT, () => {
			console.log(` Server running on http://localhost:${PORT}`);
			console.log(' Test with: POST /users with { email, password, ... }');
		});
	})
	.catch((error) => {
		console.error(' Failed to initialize database:', error);
		process.exit(1);
	});