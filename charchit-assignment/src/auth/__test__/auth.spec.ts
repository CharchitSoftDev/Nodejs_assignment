/* eslint-disable max-len */
/* eslint-disable max-lines-per-function */
/* eslint-disable import/no-extraneous-dependencies */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';
import { GoogleService } from '@src/third-party/google.service';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { HiBobService } from '@src/third-party/hi-bob.service';
describe('AuthController (e2e)', () => {
	let app: INestApplication;
	let googleService: GoogleService;
	let container: StartedPostgreSqlContainer;
	let prismaClient: PrismaClient;
	let hiBobService: HiBobService;

	beforeAll(async () => {
		// RUNNING TEST CONTAINER FOR POSTGRESQL
		container = await new PostgreSqlContainer().start();
		const dbHost = container.getHost();
		const dbPort = container.getPort();
		const db = container.getDatabase();
		const dbUser = container.getUsername();
		const dbPwd = container.getPassword();

		const url = `postgresql://${dbUser}:${dbPwd}@${dbHost}:${dbPort}/${db}?schema=public`;
		process.env.DATABASE_URL = url;

		// CONNECTING TO THE DATABASE
		prismaClient = new PrismaClient({
			datasources: {
				db: {
					url,
				},
			},
		});
		await prismaClient.$connect();

		// RUNNING MIGRATIONS
		execSync(`npx prisma migrate deploy`, {
			env: {
				...process.env,
				DATABASE_URL: url,
			},
		});

		// INITIATING APP
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();
		app = moduleFixture.createNestApplication();

		googleService = moduleFixture.get<GoogleService>(GoogleService);
		hiBobService = moduleFixture.get<HiBobService>(HiBobService);

		await app.init();
	}, 50000);
	it('/login (POST) with valid inputs', async () => {
		const idToken = 'mockGoogleIdToken123';
		jest.spyOn(googleService, 'verifyToken').mockResolvedValueOnce({
			googleId: 'mockGoogleId123',
			email: 'manas@studiographene.com',
			firstName: 'Manas',
			lastName: 'Aggrawal',
			profile: 'mockProfileString',
		});
		jest.spyOn(hiBobService, 'getEmployeesProfile').mockResolvedValueOnce({
			department: 'department',
			jobTitle: 'jobTitle',
			firstName: 'firstName',
			surname: 'surname',
			avatarUrl: 'avatarUrl',
		});
		await request(app.getHttpServer())
			.post('/login')
			.send({ idToken })
			.expect(201)
			.then((response) => response);
	});

	it('/login (POST) with wrong google token', async () => {
		const idToken = 'mockGoogleIdToken123';

		await request(app.getHttpServer())
			.post('/login')
			.send({ idToken })
			.expect(401)
			.then((response) => response);
	});

	afterAll(async () => {
		await prismaClient.$disconnect();
		await container.stop();
		await app.close();
	});
});
