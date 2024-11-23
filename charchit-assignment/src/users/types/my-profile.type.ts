import { Role, Users } from '@prisma/client';

export type MyProfileType = Omit<
	Users,
	'createdAt' | 'updatedAt' | 'googleId' | 'isActive' | 'isDeleted'
> & {
	role: Role;
	lastActivityAt: Date;
	githubUsername: string;
	isGithubIntegrationMandatory: boolean;
	isGithubIntegrated: boolean;
	emailNotification: boolean;
};
