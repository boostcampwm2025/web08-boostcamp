import { createAvatarElement } from '@/shared/ui/avatar-dom';
import { gutter, GutterMarker } from '@codemirror/view';

export interface AvatarUser {
  hash: string;
  color: string;
  name?: string;
}

export type LineToUsersMap = Map<number, AvatarUser[]>;

class AvatarMarker extends GutterMarker {
  private users: AvatarUser[];

  constructor(users: AvatarUser[]) {
    super();
    this.users = users;
  }

  eq(other: AvatarMarker) {
    if (this.users.length !== other.users.length) return false;
    return this.users.every((u, i) => u.hash === other.users[i].hash);
  }

  toDOM() {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'flex-end';
    wrapper.style.paddingRight = '4px';

    // 최대 3명까지만 표시
    this.users.slice(0, 3).forEach((user, index) => {
      const el = createAvatarElement(user.hash, user.color, 24);

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
 * 데이터를 주입받아 Gutter를 생성하는 함수
 * @param lineUsersMap 라인 번호(1-based)를 키로 하고 유저 배열을 값으로 갖는 Map
 */
export const lineAvatarExtension = (lineUsersMap: LineToUsersMap) => {
  return gutter({
    // 각 라인마다 실행되어 마커를 반환할지 결정
    lineMarker(view, line) {
      // line.from(인덱스)을 라인 번호로 변환
      const lineNo = view.state.doc.lineAt(line.from).number;
      const users = lineUsersMap.get(lineNo);

      if (users && users.length > 0) {
        return new AvatarMarker(users);
      }
      return null;
    },
    initialSpacer: () => {
      return new AvatarMarker([]);
    },
  });
};
