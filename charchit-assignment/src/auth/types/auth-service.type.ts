import { Users, Role, Accesses, Integrations } from '@prisma/client';

export type User = Omit<Users, 'createdAt' | 'updatedAt' | 'isDeleted'> & {
	access: Accesses;
	integrations: Array<Integrations>;
};

export type UserInfoWithToken = User & { token: string };

export type UserLoginResponse = Omit<UserInfoWithToken, 'access' | 'integrations'> & {
	role: Role;
	isGithubIntegrated: boolean;
	isGithubIntegrationMandatory: boolean;
};

