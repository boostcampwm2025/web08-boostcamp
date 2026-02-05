import {
  Button,
  DialogDescription,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@codejam/ui';
import { Check, Copy, Share2 } from 'lucide-react';

interface Props {
  inviteUrl: string;
  linkCopied: boolean;
  onCopy: () => void;
  onShare: () => void;
}

export const InviteLinkSection = ({
  inviteUrl,
  linkCopied,
  onCopy,
  onShare,
}: Props) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <DialogDescription>Invite Link</DialogDescription>
      <InputGroup className="h-full w-full">
        <InputGroupInput
          type="text"
          value={inviteUrl}
          readOnly
          className="text-muted-foreground truncate text-xs"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            onClick={onCopy}
            type="button"
            title="초대 링크 복사"
          >
            {linkCopied ? <Check className="text-green-500" /> : <Copy />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
    <div className="space-y-2">
      <DialogDescription>Share Via</DialogDescription>
      <Button
        onClick={onShare}
        variant="secondary"
        className="w-full gap-2"
        size="lg"
      >
        <Share2 />
        <span className="text-sm font-medium">기기 공유하기</span>
      </Button>
    </div>
  </div>
);
