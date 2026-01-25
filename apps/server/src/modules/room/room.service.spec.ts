import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { PtService } from '../pt/pt.service';
import { RoomTokenService } from '../auth/room-token.service';
import { FileService } from '../file/file.service';
import { DEFAULT_ROLE, ROLE, ROOM_TYPE, type PtRole } from '@codejam/common';

// 테스트 상수
const MOCK_ROOM_CODE = 'UNI001';
const MOCK_ROOM_ID = 100;
const MOCK_PT_HASH = '1234';
const MOCK_TOKEN = 'mock-jwt-token';
const MOCK_DOC_ID = 'mock-doc-id';

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
  let roomTokenService: jest.Mocked<RoomTokenService>;
  let fileService: jest.Mocked<FileService>;

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
            delete: jest.fn(),
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
        {
          provide: PtService,
          useValue: {
            generatePtHash: jest.fn().mockReturnValue(MOCK_PT_HASH),
            checkRole: jest.fn(),
          },
        },
        {
          provide: RoomTokenService,
          useValue: {
            sign: jest.fn().mockReturnValue(MOCK_TOKEN),
            verify: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            generateInitialSnapshot: jest.fn().mockReturnValue(Buffer.from([])),
            removeDoc: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    repository = module.get(getRepositoryToken(Room));
    dataSource = module.get(DataSource);
    roomTokenService = module.get(RoomTokenService);
    fileService = module.get(FileService);
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
    it('성공 시: 트랜잭션 내에서 Room과 Document를 저장하고 결과를 반환한다 (Pt 생성 없음)', async () => {
      // Arrange
      jest
        .spyOn(service as any, 'generateRoomCode')
        .mockReturnValue(MOCK_ROOM_CODE);
      repository.findOne.mockResolvedValue(null); // 중복 없음

      const savedRoom = { roomId: MOCK_ROOM_ID, roomCode: MOCK_ROOM_CODE };
      const savedDocument = {
        docId: 'mock-doc-id',
        room: savedRoom,
        roomId: MOCK_ROOM_ID,
      };

      (queryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce(savedRoom) // Room 저장 성공
        .mockResolvedValueOnce(savedDocument); // Document 저장 성공

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

      // 2. 데이터 저장 검증 (Quick room은 Pt 생성 없이 Room과 Document만 저장)
      expect(queryRunner.manager.save).toHaveBeenCalledTimes(2);

      expect(queryRunner.manager.save).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          roomCode: MOCK_ROOM_CODE,
          defaultRolePolicy: DEFAULT_ROLE[ROOM_TYPE.QUICK],
        }),
      );

      expect(queryRunner.manager.save).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          room: savedRoom,
          roomId: MOCK_ROOM_ID,
        }),
      );

      // 3. Quick room은 토큰 생성하지 않음
      expect(roomTokenService.sign).not.toHaveBeenCalled();

      // 4. 반환값 검증 (token 없음)
      expect(result).toEqual({
        roomCode: MOCK_ROOM_CODE,
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

      const mockRoom = { roomId: 1, roomCode: 'UNI002' } as Room;
      const mockPt = { ptId: 'mock-pt-id', room: mockRoom, role: ROLE.HOST };
      const mockDocument = { docId: 'mock-doc-id', room: mockRoom, roomId: 1 };

      (queryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce(mockRoom)
        .mockResolvedValueOnce(mockPt)
        .mockResolvedValueOnce(mockDocument);

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

  describe('destroyRoom', () => {
    it('성공 시: DB에서 방을 삭제하고 Y.Doc을 메모리에서 해제한다', async () => {
      // Arrange
      repository.delete.mockResolvedValue({ affected: 1, raw: [] });

      // Act
      await service.destroyRoom(MOCK_ROOM_ID, MOCK_DOC_ID);

      // Assert
      // 1. DB 삭제 확인
      expect(repository.delete).toHaveBeenCalledWith({
        roomId: expect.objectContaining({ _value: [MOCK_ROOM_ID] }),
      });

      // 2. Y.Doc 메모리 해제 확인
      expect(fileService.removeDoc).toHaveBeenCalledWith(MOCK_DOC_ID);
    });

    it('DB 삭제 후 Y.Doc 해제가 순차적으로 실행된다', async () => {
      // Arrange
      const callOrder: string[] = [];
      repository.delete.mockImplementation(() => {
        callOrder.push('deleteRooms');
        return Promise.resolve({ affected: 1, raw: [] });
      });
      fileService.removeDoc.mockImplementation(() => {
        callOrder.push('removeDoc');
        return Promise.resolve(true);
      });

      // Act
      await service.destroyRoom(MOCK_ROOM_ID, MOCK_DOC_ID);

      // Assert - 순서 확인
      expect(callOrder).toEqual(['deleteRooms', 'removeDoc']);
    });

    it('DB 삭제 실패 시 예외를 던진다', async () => {
      // Arrange
      repository.delete.mockRejectedValue(new Error('DB Delete Error'));

      // Act & Assert
      await expect(
        service.destroyRoom(MOCK_ROOM_ID, MOCK_DOC_ID),
      ).rejects.toThrow('DB Delete Error');

      // Y.Doc 해제는 호출되지 않아야 함
      expect(fileService.removeDoc).not.toHaveBeenCalled();
    });
  });
});
