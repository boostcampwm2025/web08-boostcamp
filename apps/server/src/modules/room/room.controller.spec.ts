import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PtService } from '../pt/pt.service';
import { ROOM_CONFIG } from '@codejam/common';
import { CommonThrottlerGuard } from '../../common/guards/common-throttler.guard';
import { Response } from 'express';

describe('RoomController', () => {
  let controller: RoomController;
  let roomService: any;

  const mockRoomService = {
    createQuickRoom: jest.fn(),
    createCustomRoom: jest.fn(),
    findRoomByCode: jest.fn(),
    joinRoom: jest.fn(),
    verifyRoomPassword: jest.fn(),
  };

  const mockPtService = {
    roomCounter: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: PtService,
          useValue: mockPtService,
        },
      ],
    })
      .overrideGuard(CommonThrottlerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<RoomController>(RoomController);
    roomService = module.get<RoomService>(RoomService);

    jest.clearAllMocks();
  });

  it('Controller가 정의되어야 한다', () => {
    expect(controller).toBeDefined();
  });

  describe('createQuickRoom', () => {
    it('Service를 호출하고 생성된 방 정보를 반환해야 한다', async () => {
      const mockResult = { roomCode: 'QUICK1' };
      mockRoomService.createQuickRoom.mockResolvedValue(mockResult);

      const result = await controller.createQuickRoom();

      expect(roomService.createQuickRoom).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('createCustomRoom', () => {
    it('Service 호출 후 쿠키를 설정하고 roomCode를 반환해야 한다', async () => {
      const dto = { roomPassword: '123', maxPts: 4 };
      const serviceResult = { roomCode: 'CUSTOM1', token: 'jwt-token' };

      mockRoomService.createCustomRoom.mockResolvedValue(serviceResult);

      const result = await controller.createCustomRoom(
        dto as any,
        mockResponse,
      );

      expect(roomService.createCustomRoom).toHaveBeenCalledWith(dto);

      // Cookie 설정 확인
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        `auth_${serviceResult.roomCode}`,
        serviceResult.token,
        expect.objectContaining({
          httpOnly: true,
          maxAge: ROOM_CONFIG.COOKIE_MAX_AGE,
        }),
      );

      expect(result).toEqual({ roomCode: serviceResult.roomCode });
    });
  });

  describe('joinRoom', () => {
    it('입장 성공 시 쿠키를 설정하고 success: true를 반환해야 한다', async () => {
      const roomCode = 'JOIN01';
      const body = { nickname: 'User1', password: '123' };
      const serviceResult = { token: 'new-token', ptId: 'pt-1' };

      mockRoomService.joinRoom.mockResolvedValue(serviceResult);

      const result = await controller.joinRoom(roomCode, body, mockResponse);

      expect(roomService.joinRoom).toHaveBeenCalledWith(
        roomCode,
        body.nickname,
        body.password,
      );

      // Cookie 설정 확인
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        `auth_${roomCode}`,
        serviceResult.token,
        expect.anything(),
      );

      expect(result).toEqual({ success: true });
    });
  });
});
