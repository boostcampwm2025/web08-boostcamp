import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Settings, RotateCcw } from 'lucide-react';
import { useSettings } from '@/stores/settings';

export function SettingsDialog() {
  const { fontSize, setFontSize, resetSettings } = useSettings();

  // 폰트 사이즈 변경 핸들러 (최소 10, 최대 30 제한)
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      if (value > 30) setFontSize(30);
      else if (value < 10) setFontSize(10);
      else setFontSize(value);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs h-8 px-2 sm:px-3"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden lg:inline">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editor Settings</DialogTitle>
          <DialogDescription>
            에디터의 환경설정을 변경합니다. 변경 사항은 즉시 반영됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 폰트 크기 설정 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fontSize" className="text-right">
              Font Size
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFontSize(Math.max(10, fontSize - 1))}
              >
                -
              </Button>
              <Input
                id="fontSize"
                type="number"
                value={fontSize}
                onChange={handleFontSizeChange}
                className="h-8 w-16 text-center"
              />
              <span className="text-sm text-muted-foreground">px</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFontSize(Math.min(30, fontSize + 1))}
              >
                +
              </Button>
            </div>
          </div>

          {/* 추후 다른 설정들(테마, 탭 사이즈 등)이 여기 추가됨 */}
        </div>

        {/* 하단 초기화 버튼 */}
        <div className="flex justify-end border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSettings}
            className="text-muted-foreground hover:text-red-500"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset to Default
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
