import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DefaultRolePolicy, HostTransferPolicy, Room } from './room.entity';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { PtRole } from '../pt/pt.entity';

// 테스트 상수
const MOCK_ROOM_CODE = 'UNI001';
const MOCK_ROOM_ID = 100;
const MOCK_PT_ID = 'uuid-host-1';

const createMockQueryRunner = () => ({
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    create: jest.fn(),
    save: jest.fn(),
  },
});

describe('RoomService', () => {
  let service: RoomService;
  let repository: jest.Mocked<Repository<Room>>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    // 각 테스트마다 새로운 QueryRunner Mock 생성
    const mockQueryRunnerInstance = createMockQueryRunner();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: getRepositoryToken(Room),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest
              .fn()
              .mockReturnValue(mockQueryRunnerInstance),
          },
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    repository = module.get(getRepositoryToken(Room));
    dataSource = module.get(DataSource);
    queryRunner = dataSource.createQueryRunner() as jest.Mocked<QueryRunner>;

    // 셋업 과정에서 생긴 호출 기록 초기화
    (dataSource.createQueryRunner as jest.Mock).mockClear();

    // 공통 Mock 동작
    (queryRunner.manager.create as jest.Mock).mockImplementation(
      (entity, data) => data,
    );
  });

  it('Service가 정의되어야 한다', () => {
    expect(service).toBeDefined();
  });

  describe('createQuickRoom', () => {
    it('성공 시: 트랜잭션 내에서 Room과 방장(Pt)을 저장하고 결과를 반환한다', async () => {
      // Arrange
      jest
        .spyOn(service as any, 'generateRoomCode')
        .mockReturnValue(MOCK_ROOM_CODE);
      repository.findOne.mockResolvedValue(null); // 중복 없음

      const savedRoom = { roomId: MOCK_ROOM_ID, roomCode: MOCK_ROOM_CODE };
      const savedPt = {
        ptId: MOCK_PT_ID,
        roomId: MOCK_ROOM_ID,
        role: PtRole.HOST,
      };

      (queryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce(savedRoom) // Room 저장 성공
        .mockResolvedValueOnce(savedPt); // Pt 저장 성공

      // Act
      const result = await service.createQuickRoom();

      // Assert
      // 1. 흐름 검증
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();

      // 2. 데이터 저장 검증
      expect(queryRunner.manager.save).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          roomCode: MOCK_ROOM_CODE,
          hostTransferPolicy: HostTransferPolicy.AUTO_TRANSFER,
          defaultRolePolicy: DefaultRolePolicy.VIEWER,
        }),
      );

      expect(queryRunner.manager.save).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          role: PtRole.HOST,
          code: '0000',
        }),
      );

      // 3. 반환값 검증
      expect(result).toEqual({
        roomCode: MOCK_ROOM_CODE,
        myPtId: MOCK_PT_ID,
      });
    });

    it('룸 코드가 중복되면 최대 3번까지 재시도하고, 성공하면 저장한다', async () => {
      // Arrange
      jest
        .spyOn(service as any, 'generateRoomCode')
        .mockReturnValueOnce('DUP001') // 1차 시도 (중복)
        .mockReturnValueOnce('UNI002'); // 2차 시도 (성공)

      repository.findOne
        .mockResolvedValueOnce({ roomId: 1 } as Room) // 1차 결과: 존재함
        .mockResolvedValueOnce(null); // 2차 결과: 없음

      const mockRoom = { roomCode: 'UNI002' } as Room;
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(mockRoom);

      // Act
      await service.createQuickRoom();

      // Assert
      expect(repository.findOne).toHaveBeenCalledTimes(2); // 재시도 확인
      expect(queryRunner.manager.create).toHaveBeenCalledWith(
        Room,
        expect.objectContaining({ roomCode: 'UNI002' }),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('3번 모두 중복되면 예외를 던지고 트랜잭션은 시작되지 않는다', async () => {
      // Arrange
      jest.spyOn(service as any, 'generateRoomCode').mockReturnValue('DUP999');
      repository.findOne.mockResolvedValue({ roomId: 999 } as Room); // 계속 중복

      // Act & Assert
      await expect(service.createQuickRoom()).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(repository.findOne).toHaveBeenCalledTimes(3);
      expect(dataSource.createQueryRunner).not.toHaveBeenCalled(); // 트랜잭션 시작 X
    });

    it('저장 중 DB 에러가 발생하면 롤백해야 한다', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);
      (queryRunner.manager.save as jest.Mock).mockRejectedValue(
        new Error('DB Error'),
      );

      // Act & Assert
      await expect(service.createQuickRoom()).rejects.toThrow('DB Error');

      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled(); // 롤백 확인
      expect(queryRunner.release).toHaveBeenCalled(); // 리소스 해제 확인
    });
  });
});
