import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	PreconditionFailedException,
	InternalServerErrorException,
	RequestTimeoutException,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
	UnauthorizedException,
} from '@nestjs/common';
import { logger } from '@studiographene/nodejs-telemetry';
import { Observable, TimeoutError, catchError, map, throwError } from 'rxjs';
import { Prisma } from '@prisma/client';
import axios, { AxiosError } from 'axios';
import * as Sentry from '@sentry/node';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
	private readonly errorMessages = {
		P2002: (err: Prisma.PrismaClientKnownRequestError): string =>
			`DB error - Resource with ${JSON.stringify(err.meta.target)} already exists`,
		P2025: (): string => `DB error - one or more records were not found.`,
		default: (): string => 'Unrecognised DB error',
	};

	private getErrorMessage(err: Prisma.PrismaClientKnownRequestError): string {
		const errorMessageFn = this.errorMessages[err.code] || this.errorMessages.default;
		return errorMessageFn(err);
	}

	private getAxiosErrorMessage(err: AxiosError): string {
		const errorMessages = {
			404: 'Resource not found',
			403: 'Unauthorized',
			400: 'Bad request',
			429: 'Too many requests',
			default: 'Unrecognised axios error',
		};
		return errorMessages[err.response?.status || 'default'];
	}

	public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		return next.handle().pipe(
			catchError((err) => {
				let error;
				logger.error(err, context.getClass().name);

				if (err instanceof Prisma.PrismaClientKnownRequestError) {
					Sentry.captureException(err); // We should have proper trace of DB error to debug efficiently
					const message = this.getErrorMessage(err);
					error = new PreconditionFailedException(message);
				} else if (err instanceof TimeoutError) {
					error = new RequestTimeoutException();
				} else if (err instanceof BadRequestException) {
					error = new BadRequestException(err.getResponse());
				} else if (err instanceof TypeError) {
					Sentry.captureException(err); // We should have proper trace of type error to debug efficiently
					error = new BadRequestException('Bad Request');
				} else if (err instanceof NotFoundException) {
					error = new NotFoundException(err.getResponse());
				} else if (err instanceof ForbiddenException) {
					error = new ForbiddenException(err.getResponse());
				} else if (err instanceof UnauthorizedException) {
					error = new UnauthorizedException(err.getResponse());
				} else if (axios.isAxiosError(err)) {
					Sentry.captureException(err); // We should have full trace of axios error to debug efficiently
					const message = this.getAxiosErrorMessage(err);
					error = new InternalServerErrorException(message);
				} else {
					// Report unhandled errors to Sentry
					Sentry.captureException(err);
					error = new InternalServerErrorException();
				}
				return throwError(() => error || new InternalServerErrorException());
			}),
			map((data) => ({
				statusCode: 200,
				message: 'Success',
				data,
			}))
		);
	}
}
