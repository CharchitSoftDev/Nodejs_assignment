import { IsOptional, IsString } from 'class-validator';

export class GooglePayload {
	@IsString()
	public email: string;

	@IsString()
	public firstName: string;

	@IsString()
	public lastName: string;

	@IsString()
	@IsOptional()
	public profile?: string;
}
