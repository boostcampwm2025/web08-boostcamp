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

  // =======================================================
  // Throttling (부하테스트 시 환경변수로 제한 우회 가능)
  // 운영 서버에서는 설정하지 않으면 기본값 적용
  // =======================================================
  // 방 생성 API: 1분당 N회 (기본값 2)
  ROOM_CREATE_THROTTLE_LIMIT: Joi.number().default(2),
  // 코드 실행 API: 1분당 N회 (기본값 6)
  EXECUTE_CODE_THROTTLE_LIMIT: Joi.number().default(6),
  // 채팅 메시지: 1초당 N회 (기본값 10)
  CHAT_MESSAGE_THROTTLE_LIMIT: Joi.number().default(10),
});
