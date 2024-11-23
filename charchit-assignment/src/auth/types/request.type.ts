import { Request as ExpressRequest } from 'express';
import { PayloadFromJWT } from './token.type';

export type Request = ExpressRequest & {
	user: PayloadFromJWT;
};
