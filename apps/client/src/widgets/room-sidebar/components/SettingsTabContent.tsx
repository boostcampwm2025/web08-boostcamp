import { useState, useEffect } from 'react';
import {
  RadixLabel as Label,
  RadixInput as Input,
  RadixSlider as Slider,
  RadixSwitch as Switch,
  RadixButton as Button,
  SidebarHeader,
  toast,
} from '@codejam/ui';
import {
  RotateCcw,
  MousePointer2,
  UserCircle,
  Type,
  Activity,
} from 'lucide-react';
import { useSettings } from '@/shared/lib/hooks/useSettings';

export function SettingsTabContent() {
  const {
    fontSize,
    setFontSize,
    resetSettings,
    showRemoteCursor,
    showGutterAvatars,
    alwaysShowCursorLabels,
    streamCodeExecutionOutput,
    toggleRemoteCursor,
    toggleGutterAvatars,
    toggleCursorLabels,
    toggleStreamCodeExecutionOutput,
  } = useSettings();

  const [inputValue, setInputValue] = useState(fontSize.toString());

  useEffect(() => {
    setInputValue(fontSize.toString());
  }, [fontSize]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      if (numValue > 30) toast.error('폰트 크기는 최대 30px입니다');
      else if (numValue < 10) toast.error('폰트 크기는 최소 10px입니다');
      else setFontSize(numValue);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 pb-4">
      <SidebarHeader title="에디터 설정" />

      <div className="grid gap-6">
        <section>
          <h4 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
            폰트
          </h4>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="fontSize">크기</Label>
              <span className="text-muted-foreground text-xs">10 - 30px</span>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                min={10}
                max={30}
                step={1}
                value={[fontSize]}
                onValueChange={(v) => {
                  setFontSize(v[0]);
                  setInputValue(v[0].toString());
                }}
                className="flex-1"
              />
              <Input
                value={inputValue}
                onChange={handleInputChange}
                className="h-8 w-12 px-1 text-center text-xs"
              />
            </div>
          </div>
        </section>

        <div className="border-border/50 border-t" />

        <section>
          <h4 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
            커서 & 외관
          </h4>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <MousePointer2 size={16} /> 원격 커서
              </div>
              <Switch
                checked={showRemoteCursor}
                onCheckedChange={toggleRemoteCursor}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <UserCircle size={16} /> 프로필 표시
              </div>
              <Switch
                checked={showGutterAvatars}
                onCheckedChange={toggleGutterAvatars}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Type size={16} /> 이름표 항상 보기
              </div>
              <Switch
                checked={alwaysShowCursorLabels}
                onCheckedChange={toggleCursorLabels}
              />
            </div>
          </div>
        </section>

        <div className="border-border/50 border-t" />

        <section>
          <h4 className="text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase">
            코드 실행
          </h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Activity size={16} /> 실시간 출력
            </div>
            <Switch
              checked={streamCodeExecutionOutput}
              onCheckedChange={toggleStreamCodeExecutionOutput}
            />
          </div>
        </section>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetSettings}
          className="text-muted-foreground hover:text-destructive mt-4 ml-auto w-fit"
        >
          <RotateCcw className="mr-2 h-3 w-3" />
          설정 초기화
        </Button>
      </div>
    </div>
  );
}
