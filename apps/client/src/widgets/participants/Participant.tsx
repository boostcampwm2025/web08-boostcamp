import {
  useParticipant,
  ParticipantContext,
} from "@/widgets/participants/useParticipant";
import {
  useParticipant as useParticipantById,
  useParticipantStore,
} from "@/stores/participants";

export interface ParticipantProps {
  id: string;
}

export function Participant({ id }: ParticipantProps) {
  const participant = useParticipantById(id);
  if (!participant) return null;

  const isOnline = participant.presence === "online";
  const opacity = isOnline ? "opacity-100" : "opacity-40";

  return (
    <ParticipantContext.Provider value={participant}>
      <div className="flex items-center justify-between p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
        <div className={`flex items-center space-x-3 ${opacity}`}>
          <Avatar />
          <Info />
        </div>
        <Menu />
      </div>
    </ParticipantContext.Provider>
  );
}

/**
 * 참가자의 아바타, 온라인 상태, 방장 여부 표시
 */

export function Avatar() {
  const participant = useParticipant();
  const { avatar, nickname, color, role } = participant;

  const image = (
    <img
      src={avatar}
      alt={`${nickname}'s avatar`}
      className="w-10 h-10 rounded-full object-cover"
    />
  );

  const placeholder = (
    <div
      className="w-10 h-10 rounded-full"
      style={{ backgroundColor: color }}
    />
  );

  const roleIcon =
    role === "host" ? (
      <span className="absolute -top-2 -right-1 text-yellow-500 text-s">
        👑
      </span>
    ) : null;

  return (
    <div className={`relative w-10 h-10 rounded-full`}>
      {avatar ? image : placeholder}
      {roleIcon}
    </div>
  );
}

/**
 * 참가자의 닉네임과 역할 표시
 */

const roleTextColors = {
  host: "orangered",
  editor: "royalblue",
  viewer: "gray",
};

export function Info() {
  const { id, nickname, role } = useParticipant();
  const currentParticipantId = useParticipantStore(
    (state) => state.currentParticipantId
  );

  const roleText = role.charAt(0).toUpperCase() + role.slice(1);
  const roleTextColor = roleTextColors[role] ?? "transparent";

  const isCurrentUser = currentParticipantId === id;

  const you = (
    <span className="ml-1.5 text-xs font-normal text-gray-500 dark:text-gray-400">
      (You)
    </span>
  );

  return (
    <div>
      <div className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-100">
        {nickname}
        {isCurrentUser && you}
      </div>
      <div className="text-xs font-medium" style={{ color: roleTextColor }}>
        {roleText}
      </div>
    </div>
  );
}

/**
 * 추가 옵션 메뉴 버튼 UI
 */
export function Menu() {
  return (
    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
      {/* SVG for more-vertical icon */}
    </button>
  );
}
