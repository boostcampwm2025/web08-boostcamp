import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DefaultRolePolicy, HostTransferPolicy, Room } from './room.entity';
import { Repository } from 'typeorm';

const mockRoomRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

describe('RoomService', () => {
  let service: RoomService;
  let repository: jest.Mocked<Repository<Room>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: getRepositoryToken(Room),
          useFactory: mockRoomRepository,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    repository = module.get(getRepositoryToken(Room));
  });

  it('Service와 Repository가 정의되어야 한다', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('createQuickRoom', () => {
    it('Quick Room 생성 시 기본 정책이 설정된 상태로 저장된다', async () => {
      const mockSavedRoom = {
        roomId: 1,
        roomCode: 'abc123',
        roomPassword: null,
        hostPassword: null,
        hostTransferPolicy: HostTransferPolicy.AUTO_TRANSFER,
        defaultRolePolicy: DefaultRolePolicy.VIEWER,
        createdAt: new Date(),
        expiresAt: new Date(),
      };

      repository.create.mockReturnValue(mockSavedRoom);
      repository.save.mockResolvedValue(mockSavedRoom);

      await service.createQuickRoom();

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          hostTransferPolicy: HostTransferPolicy.AUTO_TRANSFER,
          defaultRolePolicy: DefaultRolePolicy.VIEWER,
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });
  });
});
