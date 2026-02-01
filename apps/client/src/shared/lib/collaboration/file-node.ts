import { Map as YMap, Text as YText } from 'yjs';

/**
 * FileNode - Wrapper for Y.Map file structure
 *
 * This class is a lightweight wrapper that holds a REFERENCE to a Y.Map
 * from Y.Doc's file structure. It provides type-safe, object-oriented
 * access to file properties (name, content, capacity).
 *
 * Important:
 * - FileNode does NOT copy the Y.Map, it references it
 * - All mutations modify the underlying Y.Map directly
 * - FileNode instances are created on-demand and not cached
 * - Use FileNode.create() to initialize a new file's Y.Map structure
 */

const textEncoder = new TextEncoder();

export class FileNode {
  private file: YMap<unknown>;

  constructor(file: YMap<unknown>) {
    this.file = file;
  }

  /**
   * Create and initialize a new file Y.Map
   * Used by FileManager when creating new files
   */
  static create(id: string, name: string, content?: string): YMap<unknown> {
    const file = new YMap<unknown>();
    const yText = new YText();

    file.set('id', id);
    file.set('name', name);
    file.set('content', yText);

    if (content) yText.insert(0, content || '');
    return file;
  }

  get id(): string {
    return this.file.get('id') as string;
  }

  get name(): string {
    return this.file.get('name') as string;
  }

  set name(value: string) {
    this.file.set('name', value);
  }

  get content(): YText {
    return this.file.get('content') as YText;
  }

  get text(): string {
    const content = this.content;
    return content ? content.toString() : '';
  }

  set text(value: string) {
    const yText = new YText();
    this.file.set('content', yText);

    if (!value) return;
    yText.insert(0, value);
  }

  get capacity(): number {
    const content = this.content;
    const text = content.toString(); // Inefficient
    const bytes = textEncoder.encode(text).length;
    return bytes;
  }

  getMetadata(): { id: string; name: string } {
    return {
      id: this.id,
      name: this.name,
    };
  }
}
