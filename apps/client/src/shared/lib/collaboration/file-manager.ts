import { Doc as YDoc, Map as YMap } from 'yjs';
import { v7 as uuidv7 } from 'uuid';
import {
  DEFAULT_LANGUAGE,
  getDefaultFileName,
  getDefaultFileTemplate,
} from '@codejam/common';
import { FileNode } from './file-node';

export interface FileMetadata {
  id: string;
  name: string;
}

export class FileManager {
  private yDoc: YDoc;
  private files: YMap<YMap<unknown>>;
  private fileIds: YMap<string>;
  private initialized: boolean = false;

  constructor(yDoc: YDoc) {
    this.yDoc = yDoc;
    this.files = yDoc.getMap('files') as YMap<YMap<unknown>>;
    this.fileIds = yDoc.getMap('map') as YMap<string>;

    this.initialize();
  }

  /**
   * Initialize Y.Doc structure
   * Creates the necessary maps: files, map (fileId lookup), meta
   */
  private initialize(): void {
    this.yDoc.getMap('files'); // Y.Map<fileId, Y.Map<name, content>>
    this.yDoc.getMap('map'); // File name -> File ID tracking
    this.yDoc.getMap('meta'); // Future: snapshot version management

    this.initialized = true;
  }

  private generateId(): string {
    return uuidv7();
  }

  getYDoc(): YDoc {
    return this.yDoc;
  }

  getFilesMap(): YMap<YMap<unknown>> {
    return this.files;
  }

  getFileIdsMap(): YMap<string> {
    return this.fileIds;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Register a callback when file change occurs
   * Triggers on: file add, remove, rename, and content changes
   * Use this when you need to track all changes including content edits
   */
  onFilesChange(callback: () => void): void {
    this.files.observeDeep(() => callback());
  }

  /**
   * Register a callback when file metadata changes
   * Triggers on: file add, remove, rename
   * Use this for UI file lists to avoid overhead from content edits
   */
  onFilesMetadataChange(callback: () => void): void {
    this.fileIds.observe(() => callback());
  }

  /**
   * Check if a file with the given name exists
   */
  hasFile(fileName: string): boolean {
    if (!this.fileIds) {
      return false;
    }
    return this.fileIds.has(fileName);
  }

  /**
   * Initializes the document with a default file if needed
   * Creates a default file only if:
   * - No files exist
   * - Document has not been previously initialized
   */
  initializeDefaultFile(): string | null {
    const meta = this.yDoc.getMap('meta');
    const isInitialized = meta.get('initialized');

    // Create if empty and not previously initialized
    if (this.files.size > 0 || isInitialized) return null;

    const language = DEFAULT_LANGUAGE;
    const name = getDefaultFileName(language);
    const template = getDefaultFileTemplate(language);
    const fileId = this.createFile(name, template);

    // Mark doc as initialized to prevent recreation after deletion
    meta.set('initialized', true);

    return fileId;
  }

  createFile(name: string, content?: string): string {
    const fileId = this.generateId();

    this.yDoc.transact(() => {
      const file = FileNode.create(fileId, name, content);
      this.files.set(fileId, file);
      this.fileIds.set(name, fileId);
    });

    return fileId;
  }

  deleteFile(fileId: string): void {
    const node = this.getFileNode(fileId);
    if (!node) return;

    const fileName = node.name;
    if (!fileName) return;

    this.yDoc.transact(() => {
      this.files.delete(fileId);
      this.fileIds.delete(fileName);
    });
  }

  renameFile(fileId: string, newName: string): void {
    const node = this.getFileNode(fileId);
    if (!node) return;

    const oldName = node.name;

    // Check if new name already exists
    if (!oldName || this.hasFile(newName)) {
      return;
    }

    this.yDoc.transact(() => {
      node.name = newName;
      this.fileIds.delete(oldName);
      this.fileIds.set(newName, fileId);
    });
  }

  overwriteFile(fileId: string, text: string): void {
    const node = this.getFileNode(fileId);
    if (!node) return;

    this.yDoc.transact(() => (node.text = text));
  }

  getFileNode(fileId: string): FileNode | null {
    const file = this.files.get(fileId);
    return file ? new FileNode(file) : null;
  }

  getFileId(name: string): string | null {
    if (!this.fileIds) return null;
    const fileId = this.fileIds.get(name);
    return fileId ?? null;
  }

  getFileName(fileId: string): string | null {
    const node = this.getFileNode(fileId);
    return node ? node.name : null;
  }

  getFileContent(fileId: string): string | null {
    const node = this.getFileNode(fileId);
    if (!node) return null;

    return node.text;
  }

  getFileTree(): FileMetadata[] {
    const result: FileMetadata[] = [];

    this.files.forEach((file) => {
      const node = new FileNode(file);
      const metadata = node.getMetadata();
      result.push(metadata);
    });

    return result;
  }

  getTotalCapacity(): number {
    let total = 0;

    this.files.forEach((file) => {
      const node = new FileNode(file);
      total += node.capacity;
    });

    return total;
  }
}
