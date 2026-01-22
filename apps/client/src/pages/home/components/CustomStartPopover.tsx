import type { CustomRoomData } from '@/shared/api/room';
import { Button, Input } from '@/shared/ui';
import { Slider } from '@/shared/ui/slider';
import { ArrowRight, Check, ChevronLeft, Lock, Users } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onCreate: (data: CustomRoomData) => void;
  isLoading: boolean;
}

export function CustomStartPopover({ onCreate, isLoading }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [data, setData] = useState({
    maxPts: 6,
    roomPassword: '',
    hostPassword: '',
  });

  const handleSliderChange = (value: number[]) => {
    setData({ ...data, maxPts: value[0] });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (val > 150) val = 150;
    if (val < 2) val = 2;
    setData({ ...data, maxPts: val });
  };

  return (
    <div className="p-1">
      {/* Header: 단계 표시 */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          {step === 1 ? (
            <>
              <Users size={16} className="text-blue-500" />
              <span>인원 설정</span>
            </>
          ) : (
            <>
              <Lock size={16} className="text-purple-500" />
              <span>보안 설정</span>
            </>
          )}
        </h4>
        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-full">
          {step}/2
        </span>
      </div>

      {/* Step 1: 인원 설정 */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            함께 작업할 최대 인원을 설정해주세요.
          </p>
          <div className="flex items-center gap-3">
            <Slider
              defaultValue={[6]}
              value={[data.maxPts]}
              min={2}
              max={150}
              step={1}
              onValueChange={handleSliderChange}
              className="flex-1 cursor-pointer"
            />
            <div className="flex items-center gap-2 shrink-0">
              <Input
                type="number"
                min={2}
                max={20}
                value={data.maxPts}
                onChange={handleInputChange}
                className="w-16 text-center font-mono h-9"
              />
              <span className="text-sm text-gray-500 font-medium">명</span>
            </div>
          </div>
          <Button
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setStep(2)}
          >
            다음
            <ArrowRight />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              방 비밀번호 (선택)
            </label>
            <Input
              type="password"
              placeholder="참여자 입장용"
              value={data.roomPassword}
              onChange={(e) =>
                setData({ ...data, roomPassword: e.target.value })
              }
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 ml-1">
              호스트 비밀번호 (선택)
            </label>
            <Input
              type="password"
              placeholder="방장 관리용"
              value={data.hostPassword}
              onChange={(e) =>
                setData({ ...data, hostPassword: e.target.value })
              }
              className="text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="px-3"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => onCreate(data)}
              disabled={isLoading}
            >
              {isLoading ? '생성 중...' : '방 만들기'}
              {!isLoading && <Check className="ml-2 w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
