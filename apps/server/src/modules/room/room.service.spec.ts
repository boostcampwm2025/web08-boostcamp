import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DefaultRolePolicy, HostTransferPolicy, Room } from './room.entity';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';

const mockRoomRepository = () => ({
  findOne: jest.fn(),
});

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    create: jest.fn(),
    save: jest.fn(),
  },
};

const mockDataSource = () => ({
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
});

describe('RoomService', () => {
  let service: RoomService;
  let repository: jest.Mocked<Repository<Room>>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: typeof mockQueryRunner;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: getRepositoryToken(Room),
          useFactory: mockRoomRepository,
        },
        {
          provide: DataSource,
          useFactory: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    repository = module.get(getRepositoryToken(Room));
    dataSource = module.get(DataSource);
    queryRunner = mockQueryRunner;

    queryRunner.manager.create.mockImplementation((entity, data) => data);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Service와 의존성들이 정의되어야 한다', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  describe('createQuickRoom', () => {
    it('룸 코드를 생성한 후 트랜잭션을 시작하여 저장한다', async () => {
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

      repository.findOne.mockResolvedValue(null);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockSavedRoom);

      await service.createQuickRoom();

      expect(repository.findOne).toHaveBeenCalled();

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();

      expect(queryRunner.manager.create).toHaveBeenCalledWith(
        Room,
        expect.objectContaining({
          hostTransferPolicy: HostTransferPolicy.AUTO_TRANSFER,
          defaultRolePolicy: DefaultRolePolicy.VIEWER,
        }),
      );
      expect(queryRunner.manager.save).toHaveBeenCalled();

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });

    it('룸 코드가 중복되면 최대 3번까지 재시도하고, 성공하면 저장한다', async () => {
      jest
        .spyOn(service as any, 'generateRoomCode')
        .mockReturnValueOnce('DUP001')
        .mockReturnValueOnce('UNI002');

      repository.findOne
        .mockResolvedValueOnce({ roomId: 1 } as Room)
        .mockResolvedValueOnce(null);

      const mockRoom = { roomCode: 'UNI002' } as Room;
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockRoom);

      await service.createQuickRoom();

      expect(repository.findOne).toHaveBeenCalledTimes(2);

      expect(queryRunner.manager.create).toHaveBeenCalledWith(
        Room,
        expect.objectContaining({ roomCode: 'UNI002' }),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('3번 모두 중복되면 예외를 던지고 트랜잭션은 시작되지 않는다', async () => {
      jest.spyOn(service as any, 'generateRoomCode').mockReturnValue('DUP999');

      repository.findOne.mockResolvedValue({ roomId: 999 } as Room);

      await expect(service.createQuickRoom()).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(repository.findOne).toHaveBeenCalledTimes(3);

      expect(dataSource.createQueryRunner).not.toHaveBeenCalled();
      expect(queryRunner.startTransaction).not.toHaveBeenCalled();
    });

    it('저장 중 에러가 발생하면 롤백해야 한다', async () => {
      repository.findOne.mockResolvedValue(null);

      (queryRunner.manager.save as jest.Mock).mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(service.createQuickRoom()).rejects.toThrow('DB Error');

      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
