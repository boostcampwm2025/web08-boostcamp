import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PtService } from '../pt/pt.service';
import { CreateRoomResponseDto } from './dto/create-room-response.dto';

describe('RoomController', () => {
  let controller: RoomController;
  let service: RoomService;

  const mockRoomService = {
    createQuickRoom: jest.fn(),
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
    }).compile();

    controller = module.get<RoomController>(RoomController);
    service = module.get<RoomService>(RoomService);
  });

  it('Controller가 정의되어야 한다', () => {
    expect(controller).toBeDefined();
  });

  describe('createQuickRoom (POST /api/room/quick)', () => {
    it('Service를 호출하고 생성된 방 정보를 반환해야 한다', async () => {
      const mockResponse: CreateRoomResponseDto = {
        roomCode: 'ABCDEF',
        token: 'RoomToken',
      };

      mockRoomService.createQuickRoom.mockResolvedValue(mockResponse);

      const result = await controller.createQuickRoom();

      expect(service.createQuickRoom).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });
});
