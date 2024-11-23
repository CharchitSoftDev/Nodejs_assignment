import { HttpException } from '@nestjs/common';

export class ReIssueTokenException extends HttpException {
	constructor(message: string) {
		super(message, 419);
	}
}
