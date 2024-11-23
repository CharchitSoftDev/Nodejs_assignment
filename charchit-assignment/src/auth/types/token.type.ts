import { Role } from 'prisma/prisma-client';

export type PayloadForJWT = {
	sub: string;
	email: string;
	role: Role;
	readPermissions: string[];
	writePermissions: string[];
	org: string;
	iss: string;
};
export type PayloadFromJWT = PayloadForJWT & {
	iat: number;
	exp: number;
};
