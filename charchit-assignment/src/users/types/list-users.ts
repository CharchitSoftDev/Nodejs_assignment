import { Accesses, Users } from '@prisma/client';

export type ListUsersType = Pick<
	Users,
	'id' | 'firstName' | 'lastName' | 'jobTitle' | 'profilePic'
> &
	Pick<Accesses, 'role'>;
