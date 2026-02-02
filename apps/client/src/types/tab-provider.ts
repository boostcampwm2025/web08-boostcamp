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

export type ActiveTab = {
  [tabKey: number]: string;
  active: number;
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

export interface ActiveTabInterface {
  activeTab: ActiveTab;
  setActiveTab: (tabKey: number, activeTabKey?: string) => void;
}
