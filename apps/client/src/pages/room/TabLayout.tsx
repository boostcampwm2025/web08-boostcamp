import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import {
  ActiveTabContext,
  DraggingSignalContext,
  DraggingTabContext,
  DropSignalContext,
  FullWidthContext,
  LinearRefContext,
  LinearTabContext,
  LinearTabWidthContext,
  PositionContext,
} from '@/contexts/TabProvider';
import type {
  LinearTabWidth,
  LinearValue,
  Position,
} from '@/types/tab-provider';
import React, {
  useContext,
  useEffect,
  useState,
  type HTMLAttributes,
} from 'react';

type TabLayoutProps = {
  min: number;
  max: number;
  keyName: string;
  initialTabValue: {
    key: string | null;
    value: LinearValue;
  };
  onCreateLinearTab?: (linearKey: number, tabKey: string) => void;
  onAppendLinearTab?: (linearKey: number, tabKey: string) => void;
  convertProcessFn?: (key: string) => { [x: string]: LinearValue };
  control?: boolean;
  children: (tabKey: number) => React.ReactNode;
};

type TabLayoutChildProps = {
  width: number;
  tabKey: number;
  halfOver: boolean;
} & HTMLAttributes<HTMLDivElement>;

function halfOver(position: Position, linearTabWidth: LinearTabWidth): boolean {
  const { x } = position;
  const entries = Object.entries(linearTabWidth);
  const prevEnd = entries.length > 1 ? entries[entries.length - 2][1] : 0;
  const lastEnd = entries[entries.length - 1][1];
  const lastStart = prevEnd;
  const middle = (lastStart + lastEnd) / 2;
  const isHalfOver = x > middle;

  return isHalfOver;
}

export function TabLayout({
  min,
  max,
  keyName,
  initialTabValue,
  onCreateLinearTab,
  onAppendLinearTab,
  convertProcessFn,
  children,
}: TabLayoutProps) {
  const myRef = useContext(LinearRefContext);
  const position = useContext(PositionContext);
  const { linearTabWidth } = useContext(LinearTabWidthContext);
  const { linearTab } = useContext(LinearTabContext);
  const { draggingTab, setDraggingTab } = useContext(DraggingTabContext);
  const { dropSignal, setDropSignal } = useContext(DropSignalContext);
  const fullWidth = useContext(FullWidthContext);
  const { createLinearTab, appendLinear } = useContext(LinearTabApiContext);
  const { setActiveTab } = useContext(ActiveTabContext);
  const { draggingSignal } = useContext(DraggingSignalContext);

  const [isHalfOver, setIsHalfOver] = useState(false);

  useEffect(() => {
    if (!myRef || !myRef.current) {
      return;
    }

    if (
      (linearTab && Object.keys(linearTab).length > 0) ||
      !initialTabValue.key
    ) {
      return;
    }

    for (let i = 0; i < Math.max(1, min); i++) {
      const now = Date.now();
      createLinearTab(now, initialTabValue.key, initialTabValue.value);
      setActiveTab(now, initialTabValue.key);
    }
  }, [
    createLinearTab,
    initialTabValue.key,
    initialTabValue.value,
    linearTab,
    min,
    myRef,
    setActiveTab,
  ]);

  useEffect(() => {
    if (!dropSignal.signal) {
      return;
    }

    const { dataTransfer } = dropSignal;
    try {
      if (
        !dataTransfer ||
        !position?.current ||
        !linearTabWidth ||
        !position ||
        !draggingTab ||
        !fullWidth
      ) {
        return;
      }

      const entries = Object.entries(linearTabWidth);
      const raw = dataTransfer.getData('application/json');
      if (!raw) {
        return;
      }
      const json = JSON.parse(raw);
      const key = json[keyName] as string;

      if (!key) {
        return;
      }

      const input = convertProcessFn ? convertProcessFn(key) : json;
      if (isHalfOver && entries.length < max) {
        const now = Date.now();
        createLinearTab(now, key, input);
        onCreateLinearTab?.(now, key);
      } else {
        appendLinear(draggingTab, key, input);
        onAppendLinearTab?.(draggingTab, key);
      }
    } finally {
      setDropSignal({ signal: false });
      setDraggingTab(undefined);
    }
  }, [dropSignal]);

  useEffect(() => {
    if (!draggingSignal.signal || !linearTabWidth || !draggingTab) {
      return;
    }
    const { position } = draggingSignal;
    const entries = Object.entries(linearTabWidth);
    const isHalfOver = halfOver(position, linearTabWidth);

    if (isHalfOver && entries.length < max) {
      setIsHalfOver(true);
    } else {
      setIsHalfOver(false);
    }
  }, [draggingSignal]);

  return (
    <div ref={myRef} className="flex h-full min-h-0 w-full flex-1">
      {linearTab &&
        linearTabWidth &&
        Object.entries(linearTab).map(([tabKey]) => {
          const width = linearTabWidth[parseInt(tabKey)] as number;
          return (
            <TabLayoutChildren
              key={tabKey}
              width={width}
              tabKey={parseInt(tabKey)}
              halfOver={isHalfOver}
            >
              {children(parseInt(tabKey))}
            </TabLayoutChildren>
          );
        })}
    </div>
  );
}

function TabLayoutChildren({
  width,
  tabKey,
  halfOver,
  children,
}: TabLayoutChildProps) {
  const { setActiveTab } = useContext(ActiveTabContext);
  const { linearTab } = useContext(LinearTabContext);
  const { draggingTab } = useContext(DraggingTabContext);
  const { draggingSignal } = useContext(DraggingSignalContext);

  const handleClick = () => {
    if (!linearTab) {
      return;
    }

    setActiveTab(tabKey);
  };

  return (
    <div
      style={{
        flex: `${width} 1 0%`,
        minWidth: 0,
      }}
      className="relative flex min-h-0 flex-1"
      onClick={handleClick}
    >
      {tabKey == draggingTab && draggingSignal.signal && (
        <div
          className="absolute h-screen"
          style={{
            backgroundColor: 'rgba(0, 0, 255, 0.1)',
            width: `${halfOver ? width / 2 : width}px`,
            zIndex: 9999,
            ...(halfOver && { left: `${width / 2}px` }),
          }}
        ></div>
      )}
      {children}
    </div>
  );
}
