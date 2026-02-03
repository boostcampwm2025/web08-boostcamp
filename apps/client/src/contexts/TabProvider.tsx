import {
  type ActiveTab,
  type ActiveTabInterface,
  type DraggingSignal,
  type DraggingSignalInterface,
  type DraggingTabInterface,
  type DropSignal,
  type DropSignalInterface,
  type LinearTab,
  type LinearTabInterface,
  type LinearTabWidth,
  type LinearTabWidthInterface,
  type Position,
} from '@/types/tab-provider';
import {
  createContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

export const DropSignalContext = createContext<DropSignalInterface>({
  dropSignal: { signal: false },
  setDropSignal: () => {},
});

export const DraggingSignalContext = createContext<DraggingSignalInterface>({
  draggingSignal: { signal: false },
  setDraggingSignal: () => {},
});

export const PositionContext = createContext<
  RefObject<Position | undefined> | undefined
>(undefined);
export const LinearTabWidthContext = createContext<LinearTabWidthInterface>({
  linearTabWidth: undefined,
  setLinearTabWidth: () => {},
});
export const LinearTabContext = createContext<LinearTabInterface>({
  linearTab: undefined,
  setLinearTab: () => {},
});
export const DraggingTabContext = createContext<DraggingTabInterface>({
  draggingTab: undefined,
  setDraggingTab: () => {},
});
export const FullWidthContext = createContext<RefObject<number> | undefined>(
  undefined,
);

export const ActiveTabContext = createContext<ActiveTabInterface>({
  activeTab: {
    active: 0,
  },
  setActiveTab: () => {},
});

export const LinearRefContext =
  createContext<RefObject<HTMLDivElement | null> | null>(null);

type ProviderProps = {
  children: React.ReactNode;
};

export function TabProvider({ children }: ProviderProps) {
  const myRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef<Position>(undefined);

  const [draggingTab, setDraggingTab] = useState<number>();
  const [linearTab, setLinearTab] = useState<LinearTab>();
  const [eachWidth, setEachWidth] = useState<LinearTabWidth>();
  const [dropSignal, setDropSignal] = useState<DropSignal>({ signal: false });
  const [draggingSignal, setDraggingSignal] = useState<DraggingSignal>({
    signal: false,
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>({ active: 0 });

  const throttleRef = useRef<number>(null);
  const fullWidth = useRef(0);
  const eachWidthRef = useRef<LinearTabWidth | undefined>(undefined);

  useEffect(() => {
    eachWidthRef.current = eachWidth;
  }, [eachWidth]);

  const throttle = () => {
    if (!eachWidthRef || throttleRef.current) {
      return;
    }

    throttleRef.current = setTimeout(() => {
      throttleRef.current = null;
      if (!positionRef.current) {
        return;
      }

      const entries = Object.entries(eachWidthRef.current!);
      const { x } = positionRef.current;

      if (x < 0) {
        setDraggingTab(undefined);
        setDraggingSignal({ signal: false });
        return;
      }

      const find = entries.find(([, value], idx) => {
        if (idx === entries.length - 1) {
          return true;
        }

        if (value >= x && x <= entries[idx + 1][1]) {
          return true;
        }
      });

      if (find) {
        setDraggingTab(parseInt(find[0]));
      }

      setDraggingSignal({
        signal: true,
        position: positionRef.current,
      });
    }, 60);
  };

  useEffect(() => {
    if (!myRef || !myRef.current) {
      return;
    }

    const update = () => {
      const current = myRef.current!;
      const prevWidth = fullWidth.current;

      if (prevWidth > 0 && eachWidthRef.current) {
        if (prevWidth === current.offsetWidth) {
          return;
        }

        setEachWidth((prev) => {
          if (!prev) {
            return prev;
          }
          const length = Object.keys(prev).length;
          return Object.fromEntries(
            Object.entries(prev).map(([key]) => [
              key,
              current.offsetWidth / length,
            ]),
          );
        });
      }

      fullWidth.current = current.offsetWidth;
    };

    const handleMove = (ev: DragEvent) => {
      if ((ev.clientX === 0 && ev.clientY === 0) || !myRef.current) {
        return;
      }

      const rect = myRef.current.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;

      ev.preventDefault();
      positionRef.current = { x, y };
      throttle();
    };

    const handleDrop = (ev: DragEvent) => {
      if ((ev.clientX === 0 && ev.clientY === 0) || !myRef.current) {
        return;
      }

      const rect = myRef.current.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const dataTransfer = ev.dataTransfer;

      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        setDropSignal({
          clientX: x,
          clientY: y,
          dataTransfer,
          signal: true,
        });
        setDraggingSignal({ signal: false });
        clearTimeout(throttleRef.current ?? undefined);
        throttleRef.current = null;
      }
    };

    const observer = new ResizeObserver(update);
    observer.observe(myRef.current);
    document.addEventListener('dragover', handleMove);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleMove);
      document.removeEventListener('drop', handleDrop);
      observer.disconnect();
    };
  }, [myRef]);

  return (
    <LinearRefContext.Provider value={myRef}>
      <DropSignalContext.Provider value={{ dropSignal, setDropSignal }}>
        <FullWidthContext.Provider value={fullWidth}>
          <PositionContext.Provider value={positionRef}>
            <LinearTabWidthContext.Provider
              value={{
                linearTabWidth: eachWidth,
                setLinearTabWidth: setEachWidth,
              }}
            >
              <LinearTabContext.Provider
                value={{
                  linearTab,
                  setLinearTab,
                }}
              >
                <DraggingSignalContext.Provider
                  value={{ draggingSignal, setDraggingSignal }}
                >
                  <ActiveTabContext.Provider
                    value={{
                      activeTab,
                      setActiveTab: (tabKey: number, activeTabKey?: string) => {
                        setActiveTab((prev) => {
                          return activeTabKey
                            ? {
                                ...prev,
                                [tabKey]: activeTabKey,
                                active: tabKey,
                              }
                            : {
                                ...prev,
                                active: tabKey,
                              };
                        });
                      },
                    }}
                  >
                    <DraggingTabContext.Provider
                      value={{ draggingTab, setDraggingTab }}
                    >
                      {children}
                    </DraggingTabContext.Provider>
                  </ActiveTabContext.Provider>
                </DraggingSignalContext.Provider>
              </LinearTabContext.Provider>
            </LinearTabWidthContext.Provider>
          </PositionContext.Provider>
        </FullWidthContext.Provider>
      </DropSignalContext.Provider>
    </LinearRefContext.Provider>
  );
}
