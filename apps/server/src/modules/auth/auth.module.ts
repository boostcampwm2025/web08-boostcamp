import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RoomTokenService } from './room-token.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [RoomTokenService],
  exports: [RoomTokenService],
})
export class AuthModule {}
