import { Test, TestingModule } from '@nestjs/testing';
import { CleanupService } from './cleanup.service';
import { RoomService } from '../room/room.service';
import { CollaborationGateway } from '../collaboration/collaboration.gateway';
import { Room } from '../room/room.entity';

describe('CleanupService', () => {
  let service: CleanupService;
  let roomService: RoomService;
  let collaborationGateway: CollaborationGateway;

  const mockRoomService = {
    findExpiredRooms: jest.fn(),
    deleteRooms: jest.fn(),
  };

  const mockCollaborationGateway = {
    notifyAndDisconnectRoom: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CleanupService,
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: CollaborationGateway,
          useValue: mockCollaborationGateway,
        },
      ],
    }).compile();

    service = module.get<CleanupService>(CleanupService);
    roomService = module.get<RoomService>(RoomService);
    collaborationGateway =
      module.get<CollaborationGateway>(CollaborationGateway);

    // 호출 기록 리셋
    jest.clearAllMocks();
  });

  it('Service가 정의되어야 한다', () => {
    expect(service).toBeDefined();
  });

  describe('handleRoomCleanup', () => {
    it('만료된 방이 없으면 알림이나 삭제 로직을 수행하지 않고 종료해야 한다', async () => {
      // Given
      mockRoomService.findExpiredRooms.mockResolvedValue([]);

      // When
      await service.handleRoomCleanup();

      // Then
      expect(mockRoomService.findExpiredRooms).toHaveBeenCalled();
      expect(
        mockCollaborationGateway.notifyAndDisconnectRoom,
      ).not.toHaveBeenCalled(); // 알림 X
      expect(mockRoomService.deleteRooms).not.toHaveBeenCalled(); // 삭제 X
    });

    it('만료된 방이 있으면 알림을 보내고 방을 삭제해야 한다', async () => {
      // Given
      const expiredRooms = [
        { roomId: 1, roomCode: 'ROOM_A' },
        { roomId: 2, roomCode: 'ROOM_B' },
      ] as Room[];

      mockRoomService.findExpiredRooms.mockResolvedValue(expiredRooms);
      mockRoomService.deleteRooms.mockResolvedValue(2); // 2개 삭제됨 리턴

      // When
      await service.handleRoomCleanup();

      // Then
      expect(mockRoomService.findExpiredRooms).toHaveBeenCalled();

      expect(
        mockCollaborationGateway.notifyAndDisconnectRoom,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockCollaborationGateway.notifyAndDisconnectRoom,
      ).toHaveBeenCalledWith('ROOM_A');
      expect(
        mockCollaborationGateway.notifyAndDisconnectRoom,
      ).toHaveBeenCalledWith('ROOM_B');

      expect(mockRoomService.deleteRooms).toHaveBeenCalledWith([1, 2]);
    });

    it('에러가 발생해도 프로세스가 죽지 않고 에러를 로깅해야 한다', async () => {
      // Given
      mockRoomService.findExpiredRooms.mockRejectedValue(new Error('DB Error'));

      const loggerSpy = jest
        .spyOn((service as any).logger, 'error')
        .mockImplementation();

      // When
      await expect(service.handleRoomCleanup()).resolves.not.toThrow();

      // THen
      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});
