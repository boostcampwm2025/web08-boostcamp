import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { YRedisService } from '../y-redis/y-redis.service';
import { DocumentService } from '../document/document.service';

const mockYRedisService = {
  bind: jest.fn().mockReturnValue({
    synced: Promise.resolve(),
  }),
  hasDocInRedis: jest.fn().mockResolvedValue(false),
  closeDoc: jest.fn().mockResolvedValue(undefined),
};

const mockDocumentService = {
  getDocContentById: jest.fn().mockResolvedValue(null),
  getLatestDocState: jest.fn().mockResolvedValue({
    docId: 'doc-1',
    content: null,
    clock: 0,
  }),
  updateDocState: jest.fn().mockResolvedValue(undefined),
};

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: YRedisService,
          useValue: mockYRedisService,
        },
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  afterEach(() => {
    // 각 테스트 후 모든 문서 정리
    service['docs'].clear();
    jest.clearAllMocks();
  });

  it('Service가 정의되어야 한다', () => {
    expect(service).toBeDefined();
  });

  describe('createDoc', () => {
    it('Y.Doc을 생성하고 files, meta Y.Map을 초기화한다', async () => {
      // Arrange
      const docId = 'doc-1';

      // Act
      const roomDoc = await service.createDoc(docId);

      // Assert
      expect(roomDoc).toBeDefined();
      expect(roomDoc.doc).toBeDefined();
      expect(roomDoc.awareness).toBeDefined();
      expect(roomDoc.files).toBeDefined();
      expect(roomDoc.doc.getMap('files')).toBeDefined();
      expect(roomDoc.doc.getMap('meta')).toBeDefined();
    });

    it('이미 존재하는 docId에 대해 동일한 RoomDoc을 반환한다', async () => {
      // Arrange
      const docId = 'doc-1';

      // Act
      const roomDoc1 = await service.createDoc(docId);
      const roomDoc2 = await service.createDoc(docId);

      // Assert
      expect(roomDoc1).toBe(roomDoc2);
    });
  });

  describe('getDoc', () => {
    it('존재하는 docId에 대해 RoomDoc을 반환한다', async () => {
      // Arrange
      const docId = 'doc-1';
      await service.createDoc(docId);

      // Act
      const roomDoc = service.getDoc(docId);

      // Assert
      expect(roomDoc).toBeDefined();
    });

    it('존재하지 않는 docId에 대해 에러를 던진다', () => {
      // Arrange
      const docId = 'doc-999';

      // Act & Assert
      expect(() => service.getDoc(docId)).toThrow(
        'Y.Doc not found for document: doc-999',
      );
    });
  });
});
