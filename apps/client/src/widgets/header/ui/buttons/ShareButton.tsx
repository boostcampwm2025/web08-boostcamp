import { Share2 } from 'lucide-react';
import { ShareDialog } from '@/widgets/dialog/ShareDialog';
import { HeaderActionButton } from './HeaderActionButton';

export function ShareButton() {
  return (
    <ShareDialog>
      <HeaderActionButton>
        <Share2 className="h-4 w-4" />
        <span className="hidden lg:inline">Share</span>
      </HeaderActionButton>
    </ShareDialog>
  );
}
