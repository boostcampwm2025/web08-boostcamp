import { DialogDescription } from '@codejam/ui';
import { QRCodeSVG } from 'qrcode.react';

export const QRCodeSection = ({ inviteUrl }: { inviteUrl: string }) => (
  <div className="flex h-full flex-col space-y-2">
    <DialogDescription>Scan to Join</DialogDescription>
    <div className="flex w-full items-center justify-center">
      <QRCodeSVG
        value={inviteUrl}
        size={140}
        className="border-border rounded-sm p-2 shadow-lg ring-3 ring-gray-100"
      />
    </div>
    <p className="text-muted-foreground text-center text-xs">
      모바일에서 빠르게 접속하세요.
    </p>
  </div>
);
