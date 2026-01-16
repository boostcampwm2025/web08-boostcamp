import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { Doc, encodeStateAsUpdate } from 'yjs';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async createDoc(roomId: number, doc: Doc): Promise<Document> {
    const docEntity = this.documentRepository.create({
      roomId,
      content: encodeStateAsUpdate(doc),
    });

    const document = await this.documentRepository.save(docEntity);
    return document;
  }

  async updateDocByRoomId(roomId: number, doc: Doc) {
    await this.documentRepository.update(
      { roomId },
      { content: encodeStateAsUpdate(doc) },
    );
  }

  async getDocByRoomId(roomId: number): Promise<Document | null> {
    const document = await this.documentRepository.findOne({
      where: { roomId },
    });

    return document;
  }

  async getDocById(docId: string): Promise<Document | null> {
    const document = await this.documentRepository.findOne({
      where: { docId },
    });

    return document;
  }

  async getDocContentById(docId: string): Promise<Buffer | null> {
    const document = await this.documentRepository.findOne({
      where: { docId },
      select: ['docId', 'content'],
    });

    return document?.content ?? null;
  }

  async removeDocByRoomId(roomId: number): Promise<void> {
    await this.documentRepository.delete({ roomId });
  }

  async removeDocById(docId: string): Promise<void> {
    await this.documentRepository.delete({ docId });
  }

  async getDocIdsByRoomIds(roomIds: number[]): Promise<string[]> {
    if (roomIds.length === 0) return [];

    const documents = await this.documentRepository.find({
      where: roomIds.map((roomId) => ({ roomId })),
      select: ['docId'],
    });

    return documents.map((doc) => doc.docId);
  }
}
