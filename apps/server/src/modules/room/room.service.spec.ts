import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { Repository } from 'typeorm';

const mockRoomRepository = () => ({});

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
});
