import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PtService } from '../pt/pt.service';
import { CreateQuickRoomResponseDto } from './dto/create-quick-room-response.dto';
import { API_ENDPOINTS } from '@codejam/common';
import { CommonThrottlerGuard } from '../../common/guards/common-throttler.guard';

describe('RoomController', () => {
  let controller: RoomController;
  let service: RoomService;

  const mockRoomService = {
    createQuickRoom: jest.fn(),
    findRoomByCode: jest.fn(),
    createCustomRoom: jest.fn(),
  };

  const mockPtService = {
    roomCounter: jest.fn(),
  };

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
    service = module.get<RoomService>(RoomService);
  });

  it('Controller가 정의되어야 한다', () => {
    expect(controller).toBeDefined();
  });

  describe(`createQuickRoom (POST ${API_ENDPOINTS.ROOM.CREATE_QUICK})`, () => {
    it('Service를 호출하고 생성된 방 정보를 반환해야 한다', async () => {
      const mockResponse: CreateQuickRoomResponseDto = {
        roomCode: 'ABCDEF',
      };

      mockRoomService.createQuickRoom.mockResolvedValue(mockResponse);

      const result = await controller.createQuickRoom();

      expect(service.createQuickRoom).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });
});
