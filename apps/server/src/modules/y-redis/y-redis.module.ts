/**
 * This module is based on `y-redis` by dmonad (Kevin Jahns)
 * @see https://www.npmjs.com/package/y-redis
 */
import { Module, Global } from '@nestjs/common';
import { YRedisService } from './y-redis.service';

@Global()
@Module({
  providers: [YRedisService],
  exports: [YRedisService],
})
export class YRedisModule {}
