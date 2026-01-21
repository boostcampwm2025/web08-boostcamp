import { createAvatarElement } from '@/shared/ui/avatar-dom';
import { gutter, GutterMarker, ViewPlugin } from '@codemirror/view';
import type { Awareness } from 'y-protocols/awareness.js';
import * as Y from 'yjs';

class AvatarMarker extends GutterMarker {
  private users: { ptHash: string; color: string }[];

  constructor(users: { ptHash: string; color: string }[]) {
    super();
    this.users = users;
  }

  toDOM() {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'flex-end';
    wrapper.style.gap = '-4px'; // 겹치기
    wrapper.style.paddingRight = '4px';

    // 최대 3명까지만 표시
    this.users.slice(0, 3).forEach((user) => {
      const el = createAvatarElement(user.ptHash, user.color, 20);
      wrapper.appendChild(el);
    });

    return wrapper;
  }
}

/**
 * Awareness 기반 Line Avatar Extension
 * @param awareness Yjs Awareness 인스턴스
 * @param yText Y.Text 인스턴스 (좌표 변환용)
 */
export const lineAvatarExtension = (awareness: Awareness, yText: Y.Text) => {
  /**
   * TODO: Awareness 변경 감지용 플러그인
   */
  const updatePlugin = ViewPlugin.fromClass(class {});

  /**
   * TODO: 실제 Gutter 설정
   */
  const avatarGutter = gutter({});
};
