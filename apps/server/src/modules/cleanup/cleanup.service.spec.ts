import { Test, TestingModule } from '@nestjs/testing';
import { CleanupService } from './cleanup.service';
import { RoomService } from '../room/room.service';
import { CollaborationGateway } from '../collaboration/collaboration.gateway';

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
});
