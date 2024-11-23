import { IsBoolean } from 'class-validator';

export class EmailToggleDto {
	@IsBoolean({ message: 'Boolean value accepted - true, false' })
	public emailToggle: boolean;
}
