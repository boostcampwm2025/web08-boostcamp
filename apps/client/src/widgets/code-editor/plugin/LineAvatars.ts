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
    wrapper.style.paddingRight = '4px';

    // 최대 3명까지만 표시
    this.users.slice(0, 3).forEach((user, index) => {
      const el = createAvatarElement(user.ptHash, user.color, 24);

      el.style.position = 'relative';
      el.style.boxSizing = 'border-box';
      el.style.border = '1px solid #fff';
      el.style.borderRadius = '50%';

      if (index > 0) {
        el.style.marginLeft = '-10px'; // 24px 크기 기준 10px 겹치기
      }

      // 0번(맨 왼쪽)이 가장 위로 오게 함
      el.style.zIndex = (10 - index).toString();

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
