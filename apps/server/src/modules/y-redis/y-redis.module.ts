/**
 * This module is based on `y-redis` by dmonad (Kevin Jahns)
 * @see https://www.npmjs.com/package/y-redis
 */
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YRedisService } from './y-redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [YRedisService],
  exports: [YRedisService],
})
export class YRedisModule {}
