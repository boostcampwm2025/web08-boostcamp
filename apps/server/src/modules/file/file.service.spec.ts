import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  afterEach(() => {
    // 각 테스트 후 모든 문서 정리
    service['docs'].clear();
  });

  it('Service가 정의되어야 한다', () => {
    expect(service).toBeDefined();
  });

  describe('createDoc', () => {
    it('Y.Doc을 생성하고 files, meta Y.Map을 초기화한다', () => {
      // Arrange
      const roomId = 1;

      // Act
      const roomDoc = service.createDoc(roomId);

      // Assert
      expect(roomDoc).toBeDefined();
      expect(roomDoc.doc).toBeDefined();
      expect(roomDoc.awareness).toBeDefined();
      expect(roomDoc.files).toBeDefined();
      expect(roomDoc.doc.getMap('files')).toBeDefined();
      expect(roomDoc.doc.getMap('meta')).toBeDefined();
    });

    it('이미 존재하는 roomId에 대해 동일한 RoomDoc을 반환한다', () => {
      // Arrange
      const roomId = 1;

      // Act
      const roomDoc1 = service.createDoc(roomId);
      const roomDoc2 = service.createDoc(roomId);

      // Assert
      expect(roomDoc1).toBe(roomDoc2);
    });
  });

  describe('createFile', () => {
    it('Y.Map 계층 구조로 파일을 생성한다', () => {
      // Arrange
      const roomId = 1;
      service.createDoc(roomId);
      const fileId = 'test-uuid-123';
      const fileName = 'test.js';

      // Act
      service.createFile(roomId, fileId, fileName, 'javascript');

      // Assert
      const roomDoc = service.getDoc(roomId);
      const filesMap = roomDoc.doc.getMap('files');
      const fileMap = filesMap.get(fileId) as any;

      expect(fileMap).toBeDefined();
      expect(fileMap.get('name')).toBe(fileName);
      expect(fileMap.get('content')).toBeDefined();
    });

    it('JavaScript 파일에 기본 코드가 삽입된다', () => {
      // Arrange
      const roomId = 1;
      service.createDoc(roomId);
      const fileId = 'test-uuid-456';

      // Act
      service.createFile(roomId, fileId, 'main.js', 'javascript');

      // Assert
      const roomDoc = service.getDoc(roomId);
      const filesMap = roomDoc.doc.getMap('files');
      const fileMap = filesMap.get(fileId) as any;
      const content = fileMap.get('content');

      expect(content.toString()).toContain('console.log');
    });

    it('files Set에 fileId가 추가된다', () => {
      // Arrange
      const roomId = 1;
      service.createDoc(roomId);
      const fileId = 'test-uuid-789';

      // Act
      service.createFile(roomId, fileId, 'style.css', 'css');

      // Assert
      const roomDoc = service.getDoc(roomId);
      expect(roomDoc.files.has(fileId)).toBe(true);
    });
  });

  describe('ensureFile', () => {
    it('파일이 존재하지 않으면 새로 생성한다', () => {
      // Arrange
      const roomId = 1;
      service.createDoc(roomId);
      const fileId = 'new-file-id';

      // Act
      service.ensureFile(roomId, fileId, 'new.js', 'javascript');

      // Assert
      const roomDoc = service.getDoc(roomId);
      const filesMap = roomDoc.doc.getMap('files');
      expect(filesMap.has(fileId)).toBe(true);
    });

    it('파일이 이미 존재하면 새로 생성하지 않는다', () => {
      // Arrange
      const roomId = 1;
      service.createDoc(roomId);
      const fileId = 'existing-file';
      service.createFile(roomId, fileId, 'main.js', 'javascript');

      // 기존 내용 변경
      const roomDoc = service.getDoc(roomId);
      const filesMap = roomDoc.doc.getMap('files');
      const fileMap = filesMap.get(fileId) as any;
      const originalContent = fileMap.get('content').toString();

      // Act
      service.ensureFile(roomId, fileId, 'main.js', 'javascript');

      // Assert
      const newContent = fileMap.get('content').toString();
      expect(newContent).toBe(originalContent); // 내용이 변경되지 않음
      expect(filesMap.size).toBe(1); // 중복 생성 안됨
    });
  });

  describe('getDoc', () => {
    it('존재하는 roomId에 대해 RoomDoc을 반환한다', () => {
      // Arrange
      const roomId = 1;
      service.createDoc(roomId);

      // Act
      const roomDoc = service.getDoc(roomId);

      // Assert
      expect(roomDoc).toBeDefined();
    });

    it('존재하지 않는 roomId에 대해 에러를 던진다', () => {
      // Arrange
      const roomId = 999;

      // Act & Assert
      expect(() => service.getDoc(roomId)).toThrow(
        'Y.Doc not found for room: 999',
      );
    });
  });

  describe('Y.Map 구조 검증', () => {
    it('files Y.Map에 여러 파일을 저장할 수 있다', () => {
      // Arrange
      const roomId = 1;
      service.createDoc(roomId);

      // Act
      service.createFile(roomId, 'file-1', 'main.js', 'javascript');
      service.createFile(roomId, 'file-2', 'style.css', 'css');
      service.createFile(roomId, 'file-3', 'index.html', 'html');

      // Assert
      const roomDoc = service.getDoc(roomId);
      const filesMap = roomDoc.doc.getMap('files');
      expect(filesMap.size).toBe(3);
    });

    it('각 파일은 name과 content를 가진다', () => {
      // Arrange
      const roomId = 1;
      service.createDoc(roomId);
      const fileId = 'test-file';
      const fileName = 'app.js';

      // Act
      service.createFile(roomId, fileId, fileName, 'javascript');

      // Assert
      const roomDoc = service.getDoc(roomId);
      const filesMap = roomDoc.doc.getMap('files');
      const fileMap = filesMap.get(fileId) as any;

      expect(fileMap.has('name')).toBe(true);
      expect(fileMap.has('content')).toBe(true);
      expect(fileMap.get('name')).toBe(fileName);
    });
  });
});
