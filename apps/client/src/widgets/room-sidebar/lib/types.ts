import type { LucideIcon } from 'lucide-react';

export type SidebarTab = 'PARTICIPANTS' | 'FILES' | 'MORE' | 'SETTINGS' | null;

export type MoreMenuItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  type: 'link' | 'action';
  href?: string;
};
