import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { RoomModule } from './modules/room/room.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { FileModule } from './modules/file/file.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisModule } from './config/redis.module';
import { validationSchema } from './config/env.validation';
import { config as databaseConfig } from './config/database.config';

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
    RedisModule,
    AuthModule,
    RoomModule,
    CollaborationModule,
    FileModule,
  ],
})
export class AppModule {}
