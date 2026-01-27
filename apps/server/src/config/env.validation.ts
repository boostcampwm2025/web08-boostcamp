import * as Joi from 'joi';
import { JWT_ROOM_TOKEN_DEFAULT_EXPIRES } from '@codejam/common';

export const validationSchema = Joi.object({
  // App
  PORT: Joi.number().valid().default(3000),

  // Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),

  // Database
  DB_TYPE: Joi.string().valid('postgres').default('postgres'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),

  // JWT
  JWT_ROOM_TOKEN_SECRET: Joi.string().required(),
  JWT_ROOM_TOKEN_EXPIRES_IN: Joi.string().default(
    JWT_ROOM_TOKEN_DEFAULT_EXPIRES,
  ),

  // Piston (Code Execution)
  PISTON_API_URL: Joi.string().required(),

  // Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
});
