import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/app.module';
import { GoogleService } from '@src/third-party/google.service';
import { PrismaClient } from '@prisma/client';
import { StartedPostgreSqlContainer, PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { User } from '@src/auth/types/auth-service.type';
import { createMockUsers } from '../../project/__test__/common-functions';

describe('UsersController (e2e)', () => {
	let app: INestApplication;
	let container: StartedPostgreSqlContainer;
	let prismaClient: PrismaClient;
	let googleService: GoogleService;
	let users: User[];
	let yourAuthToken;
	let userId;

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
		googleService = moduleFixture.get<GoogleService>(GoogleService);

		app = moduleFixture.createNestApplication();
		await app.init();

		// CREATE MOCK USERS
		users = await createMockUsers(prismaClient);
	}, 80000);

	// First test case
	it('/users/unlink-github   (GET)', async () => {
		// MOCK RESOLVING GOOGLE ID TOKEN VERIFICATION FOR LOGIN
		jest.spyOn(googleService, 'verifyToken').mockResolvedValueOnce({
			googleId: 'adminGoogleIdToken',
			email: users[0].email,
			firstName: users[0].firstName,
			lastName: users[0].lastName,
			profile: users[0].profilePic,
		});

		// LOGIN TO SET JWT AUTH TOKEN VALUE
		await request(app.getHttpServer())
			.post('/login')
			.send({ idToken: 'adminGoogleIdToken' })
			.expect(201)
			.then((response) => {
				yourAuthToken = response.body.data.token;
				userId = response.body.data.id;
			});

		await request(app.getHttpServer())
			.delete(`/users/unlink-github`)
			.set('Authorization', `Bearer ${yourAuthToken}`)
			.expect(200)
			.then((response) => {
				expect(response.status).toBe(200);
			});
	});

	it('should return 401 for invalid token (GET)', async () => {
		await request(app.getHttpServer())
			.delete(`/users/unlink-github`)
			.set('Authorization', 'Bearer invalid-token')
			.send({ emailToggle: true })
			.expect(401)
			.then((response) => {
				expect(response.status).toBe(401);
			});
	});

	afterAll(async () => {
		await app.close();
		await prismaClient.$disconnect();
		await container.stop();
	});
});
