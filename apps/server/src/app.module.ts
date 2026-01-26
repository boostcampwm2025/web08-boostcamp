import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { RoomModule } from './modules/room/room.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { FileModule } from './modules/file/file.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisModule } from './modules/redis/redis.module';
import { validationSchema } from './config/env.validation';
import { config as databaseConfig } from './config/database.config';
import { CleanupModule } from './modules/cleanup/cleanup.module';
import { YRedisModule } from './modules/y-redis/y-redis.module';
import { HealthModule } from './modules/health/health.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
        configService.get<TypeOrmModuleOptions>('database')!,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 6000, // 1분 (기본)
        limit: 10, // 10회 (기본)
      },
    ]),
    RedisModule,
    YRedisModule,
    AuthModule,
    RoomModule,
    CollaborationModule,
    FileModule,
    CleanupModule,
    HealthModule,
  ],
})
export class AppModule {}
