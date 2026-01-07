import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DefaultRolePolicy, HostTransferPolicy, Room } from './room.entity';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

const mockRoomRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
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

    it('룸 코드가 중복되면 최대 3번까지 재시도하고, 성공하면 저장한다', async () => {
      jest
        .spyOn(service as any, 'generateRoomCode')
        .mockReturnValueOnce('DUP001')
        .mockReturnValueOnce('UNI002');

      repository.findOne.mockResolvedValueOnce({ roomId: 1 } as Room);
      repository.findOne.mockResolvedValueOnce(null);

      const mockRoom = { roomCode: 'UNI002' } as Room;
      repository.create.mockReturnValue(mockRoom);
      repository.save.mockResolvedValue(mockRoom);

      await service.createQuickRoom();

      expect(repository.findOne).toHaveBeenCalledTimes(2);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ roomCode: 'UNI002' }),
      );
    });

    it('3번 모두 중복되면 InternalServerErrorException을 던진다', async () => {
      jest.spyOn(service as any, 'generateRoomCode').mockReturnValue('DUP999');

      repository.findOne.mockResolvedValue({ roomId: 999 } as Room);

      await expect(service.createQuickRoom()).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(repository.findOne).toHaveBeenCalledTimes(3);
    });
  });
});
