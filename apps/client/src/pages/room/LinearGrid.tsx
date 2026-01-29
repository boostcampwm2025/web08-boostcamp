import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import {
  DraggingTabContext,
  DropSignalContext,
  FullWidthContext,
  LinearRefContext,
  LinearTabContext,
  LinearTabWidthContext,
  PositionContext,
  type LinearValue,
} from '@/contexts/TabProvider';
import { useTabStore } from '@/stores/tab';
import React, { useContext, useEffect, type HTMLAttributes } from 'react';

type LinearGridProps = {
  min: number;
  max: number;
  keyName: string;
  initialTabValue: {
    key: string | null;
    value: LinearValue;
  };
  convertProcessFn?: (key: string) => { [x: string]: LinearValue };
  convertKeyName?: (key: string) => string;
  control?: boolean;
  children: (tabKey: number) => React.ReactNode;
};

type LinearChildProps = {
  width: number;
  tabKey: number;
} & HTMLAttributes<HTMLDivElement>;

export function LinearGrid({
  min,
  max,
  keyName,
  initialTabValue,
  convertProcessFn,
  convertKeyName,
  children,
}: LinearGridProps) {
  const myRef = useContext(LinearRefContext);
  const position = useContext(PositionContext);
  const { linearTabWidth, setLinearTabWidth } = useContext(
    LinearTabWidthContext,
  );
  const { linearTab, setLinearTab } = useContext(LinearTabContext);
  const { draggingTab, setDraggingTab } = useContext(DraggingTabContext);
  const { dropSignal, setDropSignal } = useContext(DropSignalContext);
  const fullWidth = useContext(FullWidthContext);
  const { createLinearTab, appendLinear } = useContext(LinearTabApiContext);
  const setActiveTabKey = useTabStore((state) => state.setActiveTabKey);

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

    Array.from({ length: Math.max(1, min) }).forEach(() => {
      setActiveTabKey(
        createLinearTab(initialTabValue.key!, initialTabValue.value),
      );
    });
  }, [myRef, min, initialTabValue.key]);

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

      const { x } = position.current;
      const entries = Object.entries(linearTabWidth);
      const prevEnd = entries.length > 1 ? entries[entries.length - 2][1] : 0;
      const lastEnd = entries[entries.length - 1][1];
      const lastStart = prevEnd;
      const middle = (lastStart + lastEnd) / 2;
      const isHalfOver = x > middle;
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
      const newKey = convertKeyName ? convertKeyName(key) : key;
      if (isHalfOver && entries.length < max) {
        createLinearTab(newKey, input);
      } else {
        appendLinear(draggingTab, newKey, input);
      }
    } finally {
      setDropSignal({ signal: false });
    }
  }, [dropSignal.signal]);

  return (
    <div ref={myRef} className="flex h-screen w-full">
      {linearTab &&
        linearTabWidth &&
        Object.entries(linearTab).map(([tabKey]) => {
          const width = linearTabWidth[parseInt(tabKey)] as number;
          return (
            <LinearChild key={tabKey} width={width} tabKey={parseInt(tabKey)}>
              {children(parseInt(tabKey))}
            </LinearChild>
          );
        })}
    </div>
  );
}

function LinearChild({ width, tabKey, children }: LinearChildProps) {
  const setActiveTabKey = useTabStore((state) => state.setActiveTabKey);
  const setActiveTabContent = useTabStore((state) => state.setActiveTabContent);
  const { linearTab } = useContext(LinearTabContext);

  const handleClick = () => {
    if (!linearTab) {
      return;
    }

    setActiveTabKey(tabKey);
    setActiveTabContent(linearTab[tabKey]);
  };

  return (
    <div style={{ width }} className="h-full" onClick={handleClick}>
      {children}
    </div>
  );
}
