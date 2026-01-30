import { QRCodeSVG } from 'qrcode.react';

export const QRCodeSection = ({ inviteUrl }: { inviteUrl: string }) => (
  <div className="border-border/50 flex flex-col items-center justify-center space-y-3 border-l pl-4">
    <span className="text-muted-foreground mb-1 text-[11px] font-bold tracking-widest uppercase">
      Scan to Join
    </span>
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <QRCodeSVG value={inviteUrl} size={110} />
    </div>
    <p className="text-muted-foreground text-center text-[11px] leading-tight">
      모바일에서 빠르게 접속하세요.
    </p>
  </div>
);
