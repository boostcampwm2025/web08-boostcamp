import {
  Bug,
  CircleHelp,
  FolderOpen,
  MoreHorizontal,
  Settings,
  Users,
} from 'lucide-react';
import type { SidebarTab } from './types';

export const SIDEBAR_TABS: {
  id: SidebarTab;
  icon: React.ReactNode;
  label: string;
}[] = [
  {
    id: 'PARTICIPANTS',
    icon: <Users size={22} />,
    label: '참가자',
  },
  {
    id: 'FILES',
    icon: <FolderOpen size={22} />,
    label: '파일',
  },
  {
    id: 'MORE',
    icon: <MoreHorizontal size={22} />,
    label: '더보기',
  },
];

export const SETTINGS_TAB = {
  id: 'SETTINGS' as SidebarTab,
  icon: <Settings size={22} />,
  label: '설정',
};

export const MORE_MENU_ITEMS = [
  {
    key: 'help',
    label: '도움말',
    icon: CircleHelp,
    href: 'https://introduction-to-codejam.vercel.app/docs/intro',
  },
  {
    key: 'bug-report',
    label: '버그신고',
    icon: Bug,
    href: 'https://docs.google.com/forms/d/e/1FAIpQLSdGDFbhIiuZt-cgUCCn82nwpdz9gSq5htistTdv2_MwdTfrtQ/viewform?usp=dialog',
  },
] as const;
