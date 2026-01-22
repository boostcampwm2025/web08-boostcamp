import { useState, useEffect } from 'react';
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
import { Slider } from '@/shared/ui/slider';
import { Switch } from '@/shared/ui/switch';
import {
  Settings,
  RotateCcw,
  MousePointer2,
  UserCircle,
  Type,
} from 'lucide-react';
import { useSettings } from '@/shared/lib/hooks/useSettings';
import { toast } from 'sonner';

export function SettingsDialog() {
  const {
    fontSize,
    setFontSize,
    resetSettings,
    showRemoteCursor,
    showGutterAvatars,
    alwaysShowCursorLabels,
    toggleRemoteCursor,
    toggleGutterAvatars,
    toggleCursorLabels,
  } = useSettings();
  const [inputValue, setInputValue] = useState(fontSize.toString());

  // fontSize가 외부에서 변경되면 inputValue도 동기화
  useEffect(() => {
    setInputValue(fontSize.toString());
  }, [fontSize]);

  // Input 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      if (numValue > 30) {
        toast.error('폰트 크기는 최대 30px입니다');
      } else if (numValue < 10) {
        toast.error('폰트 크기는 최소 10px입니다');
      } else {
        setFontSize(numValue);
      }
    }
  };

  // Slider 변경 핸들러
  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setFontSize(newValue);
    setInputValue(newValue.toString());
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

        <div className="grid gap-6 py-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-1">
            Editor & Theme
          </h4>
          {/* 폰트 크기 설정 */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="fontSize">Font Size</Label>
              <span className="text-xs text-muted-foreground">10px - 30px</span>
            </div>

            <div className="flex items-center gap-4">
              <Slider
                id="fontSize-slider"
                min={10}
                max={30}
                step={1}
                value={[fontSize]}
                onValueChange={handleSliderChange}
                className="flex-1"
              />

              <div className="flex items-center gap-2 min-w-[4.5rem]">
                <Input
                  id="fontSize"
                  type="number"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="h-8 w-14 text-center px-1"
                />
                <span className="text-sm text-muted-foreground">px</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border my-2" />

        <div className="grid gap-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-1">
            Cursor & Appearance
          </h4>

          {/* 원격 커서 보이기/숨기기 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer2 className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="show-cursor" className="cursor-pointer">
                Show Remote Cursors
              </Label>
            </div>
            <Switch
              id="show-cursor"
              checked={showRemoteCursor}
              onCheckedChange={toggleRemoteCursor}
            />
          </div>

          {/* Gutter 아바타 보이기/숨기기 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="show-gutter" className="cursor-pointer">
                Show Gutter Avatars
              </Label>
            </div>
            <Switch
              id="show-gutter"
              checked={showGutterAvatars}
              onCheckedChange={toggleGutterAvatars}
            />
          </div>

          {/* 커서 이름 항상 보이기 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="show-labels" className="cursor-pointer">
                Always Show Labels
              </Label>
            </div>
            <Switch
              id="show-labels"
              checked={alwaysShowCursorLabels}
              onCheckedChange={toggleCursorLabels}
            />
          </div>
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
