import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { Room } from './../src/modules/room/room.entity';
import { CleanupService } from './../src/modules/cleanup/cleanup.service';
import { CollaborationGateway } from './../src/modules/collaboration/collaboration.gateway';
import { RoomService } from './../src/modules/room/room.service';
import Redis from 'ioredis';

describe('Room Cleanup Scheduler (E2E)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let roomRepository: Repository<Room>;
  let cleanupService: CleanupService;
  let collaborationGateway: CollaborationGateway;
  let roomService: RoomService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    cleanupService = moduleFixture.get<CleanupService>(CleanupService);
    collaborationGateway =
      moduleFixture.get<CollaborationGateway>(CollaborationGateway);
    roomService = moduleFixture.get<RoomService>(RoomService);

    roomRepository = dataSource.getRepository(Room);
  });

  afterAll(async () => {
    try {
      const redisClient = app.get<Redis>('REDIS_CLIENT');
      const redisSubscriber = app.get<Redis>('REDIS_SUBSCRIBER');

      if (redisClient) redisClient.disconnect();
      if (redisSubscriber) redisSubscriber.disconnect();
    } catch (e) {
      // Redis Provider를 못 찾거나 이미 닫혔으면 무시
    }

    if (app) {
      await app.close();
    }
  });

  describe('handleRoomCleanup', () => {
    it('만료된 방을 감지하고, 알림을 보낸 뒤 DB에서 삭제해야 한다', async () => {
      const { roomCode } = await roomService.createQuickRoom();

      const room = await roomRepository.findOne({ where: { roomCode } });
      expect(room).toBeDefined();

      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 2);

      await roomRepository.update(room!.roomId, {
        expiresAt: pastDate,
      });

      const notifySpy = jest.spyOn(
        collaborationGateway,
        'notifyAndDisconnectRoom',
      );

      // Cron이 돌 때까지 기다릴 수 없으므로 메서드를 직접 호출
      await cleanupService.handleRoomCleanup();

      expect(notifySpy).toHaveBeenCalledWith(roomCode);

      const deletedRoom = await roomRepository.findOne({ where: { roomCode } });
      expect(deletedRoom).toBeNull();
    });

    it('만료되지 않은 방은 삭제되지 않아야 한다', async () => {
      const { roomCode } = await roomService.createQuickRoom();

      // 스케줄러 실행
      await cleanupService.handleRoomCleanup();

      const room = await roomRepository.findOne({ where: { roomCode } });
      expect(room).toBeDefined();

      // 테스트 후 데이터 정리를 위해 수동 삭제
      await roomRepository.delete({ roomCode });
    });
  });
});
