import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { DataSource } from 'typeorm';
import { PtService } from '../pt/pt.service';
import { RoomTokenService } from '../auth/room-token.service';
import { FileService } from '../file/file.service';
import { ApiException } from '../../common/exceptions/api.exception';

// 테스트 상수
const MOCK_ROOM_ID = 100;
const MOCK_DOC_ID = 'mock-doc-id';

// QueryRunner Mock
const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    create: jest.fn((entity, data) => data),
    save: jest.fn((data) => Promise.resolve(data)),
  },
};

describe('RoomService', () => {
  let service: RoomService;
  let ptService: PtService;
  let roomTokenService: RoomTokenService;
  let fileService: FileService;
  let roomRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: getRepositoryToken(Room),
          useValue: {
            findOne: jest.fn(),
            exists: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
            // transaction 메서드 Mock: 콜백을 즉시 실행하여 로직 검증
            transaction: jest.fn(async (cb) => {
              return await cb(mockQueryRunner.manager);
            }),
          },
        },
        {
          provide: PtService,
          useValue: {
            generatePtHash: jest.fn().mockReturnValue('hash'),
            roomCounter: jest.fn(),
            createPt: jest.fn(),
          },
        },
        {
          provide: RoomTokenService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
        {
          provide: FileService,
          useValue: {
            generateInitialSnapshot: jest.fn(),
            removeDoc: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    ptService = module.get(PtService);
    roomTokenService = module.get(RoomTokenService);
    fileService = module.get(FileService);
    roomRepository = module.get(getRepositoryToken(Room));

    jest.clearAllMocks();
  });

  describe('createQuickRoom', () => {
    it('Transaction 내에서 Room과 Document만 저장해야 한다 (Pt 생성 X)', async () => {
      // Arrange
      jest.spyOn(service as any, 'generateRoomCode').mockReturnValue('QUICK');
      roomRepository.exists.mockResolvedValue(false);

      // Act
      const result = await service.createQuickRoom();

      // Assert
      expect(result.roomCode).toBe('QUICK');
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(2); // Room + Document
      expect(roomTokenService.sign).not.toHaveBeenCalled();
    });
  });

  describe('createCustomRoom', () => {
    it('Transaction 내에서 Room, Host Pt, Document를 저장하고 Token을 반환해야 한다', async () => {
      // Arrange
      const dto = { roomPassword: 'pw', maxPts: 5 };
      jest.spyOn(service as any, 'generateRoomCode').mockReturnValue('CUSTOM');
      roomRepository.exists.mockResolvedValue(false);

      // save 호출 순서에 따른 반환값 설정
      (mockQueryRunner.manager.save as jest.Mock)
        .mockResolvedValueOnce({ roomId: 1, roomCode: 'CUSTOM' }) // 1. Room
        .mockResolvedValueOnce({ ptId: 'host-pt' }) // 2. Pt
        .mockResolvedValueOnce({}); // 3. Document

      // Act
      const result = await service.createCustomRoom(dto as any);

      // Assert
      expect(result.roomCode).toBe('CUSTOM');
      expect(result.token).toBe('mock-token');
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(3);
    });
  });

  describe('joinRoom', () => {
    it('정원이 남았다면 Pt를 생성하고 Token을 발급해야 한다', async () => {
      // Arrange
      const room = { roomId: 10, roomCode: 'JOIN01', maxPts: 10 };
      roomRepository.findOne.mockResolvedValue(room);

      (ptService.roomCounter as jest.Mock).mockResolvedValue(5); // 현재 5명
      (ptService.createPt as jest.Mock).mockResolvedValue({ ptId: 'new-pt' });

      // Act
      const result = await service.joinRoom('JOIN01', 'Nick');

      // Assert
      expect(ptService.createPt).toHaveBeenCalledWith(10, 'Nick');
      expect(roomTokenService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
    });

    it('방을 찾을 수 없으면 404 예외를 던져야 한다', async () => {
      roomRepository.findOne.mockResolvedValue(null);

      await expect(service.joinRoom('NONE', 'Nick')).rejects.toThrow(
        ApiException,
      );
    });

    it('정원이 꽉 찼으면 409 예외를 던져야 한다', async () => {
      const room = { roomId: 10, maxPts: 2 };
      roomRepository.findOne.mockResolvedValue(room);
      (ptService.roomCounter as jest.Mock).mockResolvedValue(2); // 이미 2명

      await expect(service.joinRoom('FULL', 'Nick')).rejects.toThrow(
        ApiException,
      );
    });
  });

  describe('destroyRoom', () => {
    it('성공 시: DB에서 방을 삭제하고 Y.Doc을 메모리에서 해제한다', async () => {
      // Arrange
      roomRepository.delete.mockResolvedValue({ affected: 1, raw: [] });
      (fileService.removeDoc as jest.Mock).mockResolvedValue(true);

      // Act
      await service.destroyRoom(MOCK_ROOM_ID, MOCK_DOC_ID);

      // Assert
      // 1. DB 삭제 확인
      expect(roomRepository.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          roomId: expect.anything(),
        }),
      );

      // 2. Y.Doc 메모리 해제 확인
      expect(fileService.removeDoc).toHaveBeenCalledWith(MOCK_DOC_ID);
    });

    it('DB 삭제 후 Y.Doc 해제가 순차적으로 실행된다', async () => {
      // Arrange
      const callOrder: string[] = [];
      roomRepository.delete.mockImplementation(() => {
        callOrder.push('deleteRooms');
        return Promise.resolve({ affected: 1, raw: [] });
      });
      (fileService.removeDoc as jest.Mock).mockImplementation(() => {
        callOrder.push('removeDoc');
        return Promise.resolve(true);
      });

      // Act
      await service.destroyRoom(MOCK_ROOM_ID, MOCK_DOC_ID);

      // Assert
      expect(callOrder).toEqual(['deleteRooms', 'removeDoc']);
    });

    it('DB 삭제 실패 시 예외를 던진다', async () => {
      // Arrange
      roomRepository.delete.mockRejectedValue(new Error('DB Delete Error'));

      // Act & Assert
      await expect(
        service.destroyRoom(MOCK_ROOM_ID, MOCK_DOC_ID),
      ).rejects.toThrow('DB Delete Error');

      // Y.Doc 해제는 호출되지 않아야 함
      expect(fileService.removeDoc).not.toHaveBeenCalled();
    });
  });
});
