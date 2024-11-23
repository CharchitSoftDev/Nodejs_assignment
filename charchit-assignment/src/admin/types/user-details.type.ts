import { Projects, Role, Users } from '@prisma/client';

export type UserDetailsType = {
	role: Role;
};

export type ProjectDetailsType = Pick<Projects, 'name' | 'logo' | 'startDate'>;

export type GetUserDetailsType = Pick<
	Users,
	| 'id'
	| 'firstName'
	| 'lastName'
	| 'profilePic'
	| 'jobTitle'
	| 'email'
	| 'department'
> & {
	role: Role;
	lastActive: Date;
	githubUsername: string;
	projects: ProjectDetailsType[];
};
