import { createAvatarElement } from '@/shared/ui/avatar-dom';
import { gutter, GutterMarker } from '@codemirror/view';
import * as Y from 'yjs';

// React에서 넘겨줄 데이터 타입 (위치 정보 포함)
export interface RemoteUser {
  hash: string;
  color: string;
  name?: string;
  cursor: Y.RelativePosition; // 위치 계산을 위해 필요
}

export interface AvatarUser {
  hash: string;
  color: string;
  name?: string;
}

type OnAvatarClick = (params: {
  event: MouseEvent;
  users: AvatarUser[];
}) => void;

class AvatarMarker extends GutterMarker {
  private users: AvatarUser[];
  private onClick: OnAvatarClick | null;
  private fontSize: number;

  constructor(
    users: AvatarUser[],
    onClick: OnAvatarClick | null,
    fontSize: number,
  ) {
    super();
    this.users = users;
    this.onClick = onClick;
    this.fontSize = fontSize;
  }

  eq(other: AvatarMarker) {
    if (this.users.length !== other.users.length) return false;
    return this.users.every((u, i) => u.hash === other.users[i].hash);
  }

  toDOM() {
    const size = this.fontSize;
    const avatarSize = Math.round(size * 1.2); // 아바타 크기
    const gutterWidth = Math.round(avatarSize + 10); // 좌우 여백 포함 Gutter 너비
    const lineHeight = Math.round(size * 1.5); // 라인 높이 추정

    const wrapper = document.createElement('div');

    wrapper.style.width = `${gutterWidth}px`;
    wrapper.style.height = `${lineHeight}px`;
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.cursor = 'pointer';

    if (this.users.length === 0) return wrapper;

    const firstUser = this.users[0];
    const userCount = this.users.length;

    const avatarContainer = document.createElement('div');
    avatarContainer.style.position = 'relative';
    avatarContainer.style.width = `${avatarSize}px`;
    avatarContainer.style.height = `${avatarSize}px`;
    avatarContainer.style.borderRadius = '50%';
    avatarContainer.style.overflow = 'hidden'; // 둥근 테두리 밖으로 나가는 것 방지
    avatarContainer.style.border = '1px solid rgba(255, 255, 255, 0.5)'; // 테두리 살짝

    const avatarEl = createAvatarElement(
      firstUser.hash,
      firstUser.color,
      avatarSize,
    );
    avatarEl.style.width = '100%';
    avatarEl.style.height = '100%';

    avatarContainer.appendChild(avatarEl);

    if (userCount > 1) {
      const extraCount = userCount - 1;

      // 베이스 아바타를 흐리게/어둡게 처리
      avatarEl.style.filter = 'brightness(0.6) contrast(1.2)'; // 밝기를 낮추고 대비를 높임
      avatarEl.style.opacity = '0.9';

      // 오버레이 텍스트 컨테이너 생성
      const overlayEl = document.createElement('div');
      overlayEl.textContent = `+${extraCount}`;

      // 스타일링: 아바타 컨테이너를 기준으로 절대 위치 중앙 정렬
      overlayEl.style.position = 'absolute';
      overlayEl.style.top = '0';
      overlayEl.style.left = '0';
      overlayEl.style.width = '100%';
      overlayEl.style.height = '100%';
      overlayEl.style.display = 'flex';
      overlayEl.style.alignItems = 'center';
      overlayEl.style.justifyContent = 'center';

      // 텍스트 스타일
      overlayEl.style.color = '#ffffff';
      overlayEl.style.fontSize = `${Math.max(10, Math.round(avatarSize * 0.5))}px`;
      overlayEl.style.fontWeight = '700';
      overlayEl.style.textShadow = '0px 1px 2px rgba(0,0,0,0.8)';
      overlayEl.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // 전체적으로 살짝 어두운 막 추가

      // 컨테이너에 오버레이 추가 (아바타 위에 쌓임)
      avatarContainer.appendChild(overlayEl);
    }

    wrapper.appendChild(avatarContainer);

    if (this.onClick) {
      wrapper.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.onClick!({ event: e, users: this.users });
      };
    }

    return wrapper;
  }
}

/**
 * @param users - React에서 넘어온 유저 리스트 (RelativePosition 포함)
 * @param yText - 위치 변환을 위한 Y.Text 객체
 */
export const lineAvatarExtension = (
  users: RemoteUser[],
  yText: Y.Text | null,
  onAvatarClick: OnAvatarClick,
  fontSize: number = 14,
) => {
  return gutter({
    // 각 라인마다 실행되어 마커를 반환할지 결정
    lineMarker(_, line) {
      if (!yText || !yText.doc || users.length === 0) return null;

      const usersOnThisLine: AvatarUser[] = [];

      for (const user of users) {
        try {
          const absPos = Y.createAbsolutePositionFromRelativePosition(
            user.cursor,
            yText.doc,
          );

          if (absPos) {
            const index = absPos.index;
            // 유저의 커서 위치가 현재 라인 범위 안에 있는지 확인
            if (index >= line.from && index <= line.to) {
              usersOnThisLine.push({
                hash: user.hash,
                color: user.color,
                name: user.name,
              });
            }
          }
        } catch (e) {
          // Yjs 변환 에러 무시
        }
      }

      if (usersOnThisLine.length > 0) {
        return new AvatarMarker(usersOnThisLine, onAvatarClick, fontSize);
      }
      return null;
    },
    initialSpacer: () => {
      return new AvatarMarker([], null, fontSize);
    },
  });
};
