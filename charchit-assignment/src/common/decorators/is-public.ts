/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'IsPublic';
export const IsPublic = () => SetMetadata(IS_PUBLIC, true);
