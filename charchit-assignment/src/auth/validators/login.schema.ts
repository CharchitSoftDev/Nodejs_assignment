import * as Joi from 'joi';

export const LoginSchema = Joi.object({
	idToken: Joi.string().required().messages({
		'any.required': 'idToken is required',
	}),
});
