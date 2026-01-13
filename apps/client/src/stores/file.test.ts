import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useFileStore } from "./file";

describe("useFileStore CRUD", () => {
  beforeEach(() => {
    // 각 테스트 전 Store 초기화
    useFileStore.getState().destroy();
  });

  afterEach(() => {
    // 각 테스트 후 Store 정리
    useFileStore.getState().destroy();
  });

  describe("초기화 전 상태", () => {
    it("yDoc이 null이어야 한다", () => {
      const { yDoc } = useFileStore.getState();
      expect(yDoc).toBeNull();
    });

    it("초기화 전에는 getFilesMap이 null을 반환한다", () => {
      const filesMap = useFileStore.getState().getFilesMap();
      expect(filesMap).toBeNull();
    });

    it("초기화 전에는 createFile이 빈 문자열을 반환한다", () => {
      const fileId = useFileStore.getState().createFile("test.js");
      expect(fileId).toBe("");
    });
  });

  describe("initialize 후", () => {
    beforeEach(() => {
      // 테스트용 roomCode로 초기화
      useFileStore.getState().initialize("test-room");
    });

    it("yDoc이 생성되어야 한다", () => {
      const { yDoc } = useFileStore.getState();
      expect(yDoc).not.toBeNull();
    });

    it("getFilesMap이 Y.Map을 반환해야 한다", () => {
      const filesMap = useFileStore.getState().getFilesMap();
      expect(filesMap).not.toBeNull();
    });
  });

  describe("createFile", () => {
    beforeEach(() => {
      useFileStore.getState().initialize("test-room");
    });

    it("UUID 형식의 fileId를 반환해야 한다", () => {
      const fileId = useFileStore.getState().createFile("main.js");

      // UUID v7 형식 검증 (8-4-4-4-12)
      expect(fileId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("생성된 파일이 filesMap에 존재해야 한다", () => {
      const fileId = useFileStore.getState().createFile("main.js");
      const filesMap = useFileStore.getState().getFilesMap();

      expect(filesMap?.has(fileId)).toBe(true);
    });

    it("파일에 name 필드가 있어야 한다", () => {
      const fileId = useFileStore.getState().createFile("utils.js");
      const filesMap = useFileStore.getState().getFilesMap();
      const fileMap = filesMap?.get(fileId);

      expect(fileMap?.get("name")).toBe("utils.js");
    });

    it("파일에 content(Y.Text) 필드가 있어야 한다", () => {
      const fileId = useFileStore.getState().createFile("app.js");
      const filesMap = useFileStore.getState().getFilesMap();
      const fileMap = filesMap?.get(fileId);

      expect(fileMap?.has("content")).toBe(true);
    });

    it("초기 content가 있으면 삽입되어야 한다", () => {
      const fileId = useFileStore
        .getState()
        .createFile("hello.js", 'console.log("hi");');
      const filesMap = useFileStore.getState().getFilesMap();
      const fileMap = filesMap?.get(fileId);
      const content = fileMap?.get("content");

      expect(content?.toString()).toBe('console.log("hi");');
    });

    it("여러 파일을 생성할 수 있다", () => {
      useFileStore.getState().createFile("file1.js");
      useFileStore.getState().createFile("file2.js");
      useFileStore.getState().createFile("file3.js");

      const filesMap = useFileStore.getState().getFilesMap();
      expect(filesMap?.size).toBe(3);
    });
  });

  describe("deleteFile", () => {
    beforeEach(() => {
      useFileStore.getState().initialize("test-room");
    });

    it("파일이 filesMap에서 삭제되어야 한다", () => {
      const fileId = useFileStore.getState().createFile("to-delete.js");
      expect(useFileStore.getState().getFilesMap()?.has(fileId)).toBe(true);

      useFileStore.getState().deleteFile(fileId);

      expect(useFileStore.getState().getFilesMap()?.has(fileId)).toBe(false);
    });

    it("다른 파일은 영향받지 않아야 한다", () => {
      const fileId1 = useFileStore.getState().createFile("keep.js");
      const fileId2 = useFileStore.getState().createFile("delete.js");

      useFileStore.getState().deleteFile(fileId2);

      const filesMap = useFileStore.getState().getFilesMap();
      expect(filesMap?.has(fileId1)).toBe(true);
      expect(filesMap?.size).toBe(1);
    });
  });

  describe("renameFile", () => {
    beforeEach(() => {
      useFileStore.getState().initialize("test-room");
    });

    it("파일 이름이 변경되어야 한다", () => {
      const fileId = useFileStore.getState().createFile("old.js");

      useFileStore.getState().renameFile(fileId, "new.js");

      const filesMap = useFileStore.getState().getFilesMap();
      const fileMap = filesMap?.get(fileId);
      expect(fileMap?.get("name")).toBe("new.js");
    });

    it("content는 유지되어야 한다", () => {
      const fileId = useFileStore
        .getState()
        .createFile("test.js", "original content");

      useFileStore.getState().renameFile(fileId, "renamed.js");

      const filesMap = useFileStore.getState().getFilesMap();
      const fileMap = filesMap?.get(fileId);
      expect(fileMap?.get("content")?.toString()).toBe("original content");
    });

    it("fileId는 변경되지 않아야 한다", () => {
      const fileId = useFileStore.getState().createFile("before.js");

      useFileStore.getState().renameFile(fileId, "after.js");

      const filesMap = useFileStore.getState().getFilesMap();
      expect(filesMap?.has(fileId)).toBe(true);
    });
  });

  describe("getFilesMap", () => {
    beforeEach(() => {
      useFileStore.getState().initialize("test-room");
    });

    it("Y.Map 인스턴스를 반환해야 한다", () => {
      const filesMap = useFileStore.getState().getFilesMap();

      expect(filesMap).not.toBeNull();
      expect(typeof filesMap?.get).toBe("function");
      expect(typeof filesMap?.set).toBe("function");
      expect(typeof filesMap?.has).toBe("function");
    });

    it("CRUD 결과가 반영되어야 한다", () => {
      const filesMap = useFileStore.getState().getFilesMap();

      // 초기 상태
      expect(filesMap?.size).toBe(0);

      // 파일 생성
      const fileId = useFileStore.getState().createFile("test.js");
      expect(filesMap?.size).toBe(1);

      // 파일 삭제
      useFileStore.getState().deleteFile(fileId);
      expect(filesMap?.size).toBe(0);
    });
  });
});
