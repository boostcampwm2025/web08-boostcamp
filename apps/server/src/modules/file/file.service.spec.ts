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

  describe('createFile', () => {
    it('Y.Map 계층 구조로 파일을 생성한다', async () => {
      // Arrange
      const docId = 'doc-1';
      await service.createDoc(docId);
      const fileId = 'test-uuid-123';
      const fileName = 'test.js';

      // Act
      service.createFile(docId, fileId, fileName, 'javascript');

      // Assert
      const roomDoc = service.getDoc(docId);
      const filesMap = roomDoc.doc.getMap('files');
      const fileMap = filesMap.get(fileId) as any;

      expect(fileMap).toBeDefined();
      expect(fileMap.get('name')).toBe(fileName);
      expect(fileMap.get('content')).toBeDefined();
    });

    it('JavaScript 파일에 기본 코드가 삽입된다', async () => {
      // Arrange
      const docId = 'doc-1';
      await service.createDoc(docId);
      const fileId = 'test-uuid-456';

      // Act
      service.createFile(docId, fileId, 'main.js', 'javascript');

      // Assert
      const roomDoc = service.getDoc(docId);
      const filesMap = roomDoc.doc.getMap('files');
      const fileMap = filesMap.get(fileId) as any;
      const content = fileMap.get('content');

      expect(content.toString()).toContain('console.log');
    });

    it('files Set에 fileId가 추가된다', async () => {
      // Arrange
      const docId = 'doc-1';
      await service.createDoc(docId);
      const fileId = 'test-uuid-789';

      // Act
      service.createFile(docId, fileId, 'style.css', 'css');

      // Assert
      const roomDoc = service.getDoc(docId);
      expect(roomDoc.files.has(fileId)).toBe(true);
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

  describe('Y.Map 구조 검증', () => {
    it('files Y.Map에 여러 파일을 저장할 수 있다', async () => {
      // Arrange
      const docId = 'doc-1';
      await service.createDoc(docId);

      // Act
      service.createFile(docId, 'file-1', 'main.js', 'javascript');
      service.createFile(docId, 'file-2', 'style.css', 'css');
      service.createFile(docId, 'file-3', 'index.html', 'html');

      // Assert
      const roomDoc = service.getDoc(docId);
      const filesMap = roomDoc.doc.getMap('files');
      expect(filesMap.size).toBe(3);
    });

    it('각 파일은 name과 content를 가진다', async () => {
      // Arrange
      const docId = 'doc-1';
      await service.createDoc(docId);
      const fileId = 'test-file';
      const fileName = 'app.js';

      // Act
      service.createFile(docId, fileId, fileName, 'javascript');

      // Assert
      const roomDoc = service.getDoc(docId);
      const filesMap = roomDoc.doc.getMap('files');
      const fileMap = filesMap.get(fileId) as any;

      expect(fileMap.has('name')).toBe(true);
      expect(fileMap.has('content')).toBe(true);
      expect(fileMap.get('name')).toBe(fileName);
    });
  });
});
