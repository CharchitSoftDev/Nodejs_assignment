import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { ReIssueTokenExceptionFilter } from '@common/exception-filters/ReIssueTokenExceptionFilter';
import { BASE_URL, SENTRY_DSN, STAGE } from '@configs/secrets';
import { CustomLogger } from '@configs/logger';
import { AppModule } from './app.module';


async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, {
		logger: new CustomLogger(),
	});

	// Setting server port
	const PORT = process.env.PORT || 3333;

	// Setting CORS
	app.enableCors({
		origin:
			STAGE === 'dev' ? ['http://localhost:8000', `https://${BASE_URL}`] : [`https://${BASE_URL}`],
		credentials: true,
		methods: '*',
		optionsSuccessStatus: 201,
	});

	app.useGlobalFilters(new ReIssueTokenExceptionFilter());

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		})
	);

	useContainer(app.select(AppModule), { fallbackOnErrors: true });

	/**
	 * Creates a new DocumentBuilder instance and sets the title, description,
	 * and version for the Swagger documentation.
	 * Also adds a bearer authentication scheme to the Swagger documentation.
	 * @returns A new DocumentBuilder instance with the specified configuration.
	 */
	const config = new DocumentBuilder()
		.setTitle('Pulse Swagger Docs')
		.setDescription('Pulse APIs Swagger')
		.setVersion('1.0')
		.addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('/docs', app, document);

	await app.listen(PORT);
	CustomLogger.info(`Server running on http://localhost:${PORT}`, 'App');
}
bootstrap();
