import {
  createContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

export type LinearValue =
  | string
  | number
  | null
  | boolean
  | undefined
  | {
      [x: string]: LinearValue;
    };

export type Position = {
  x: number;
  y: number;
};

export type LinearTab = {
  [tabKey: number]: {
    [linearKey: string]: LinearValue;
  };
};

export type LinearTabWidth = {
  [tabKey: number]: number;
};

export type DropSignal =
  | {
      signal: true;
      dataTransfer: DataTransfer | null;
      clientX: number;
      clientY: number;
    }
  | {
      signal: false;
    };

export interface LinearTabWidthInterface {
  linearTabWidth: LinearTabWidth | undefined;
  setLinearTabWidth: (value: LinearTabWidth | undefined) => void;
}

export interface LinearTabInterface {
  linearTab: LinearTab | undefined;
  setLinearTab: (value: LinearTab | undefined) => void;
}

export interface DraggingTabInterface {
  draggingTab: number | undefined;
  setDraggingTab: (value: number | undefined) => void;
}

export interface DropSignalInterface {
  dropSignal: DropSignal;
  setDropSignal: (dropSignal: DropSignal) => void;
}

export const DropSignalContext = createContext<DropSignalInterface>({
  dropSignal: { signal: false },
  setDropSignal: () => {},
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
  const eachWidthRef = useRef<LinearTabWidth | undefined>(undefined);
  const [dropSignal, setDropSignal] = useState<DropSignal>({ signal: false });

  const throttleRef = useRef<number>(null);
  const fullWidth = useRef(0);

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

        const diff = prevWidth - current.offsetWidth;
        setEachWidth((prev) => {
          if (!prev) {
            return prev;
          }

          return Object.fromEntries(
            Object.entries(prev).map(([key, width]) => [key, width + diff]),
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

      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        ev.preventDefault();
        positionRef.current = { x, y };
        throttle();
      }
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
                <DraggingTabContext.Provider
                  value={{ draggingTab, setDraggingTab }}
                >
                  {children}
                </DraggingTabContext.Provider>
              </LinearTabContext.Provider>
            </LinearTabWidthContext.Provider>
          </PositionContext.Provider>
        </FullWidthContext.Provider>
      </DropSignalContext.Provider>
    </LinearRefContext.Provider>
  );
}
