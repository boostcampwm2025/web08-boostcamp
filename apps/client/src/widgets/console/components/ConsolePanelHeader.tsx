import { AlignLeft } from 'lucide-react';

export function ConsolePanelHeader() {
  return (
    <div className="border-border flex items-center justify-between border-b bg-white px-3 py-2 dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <AlignLeft size={16} className="text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Output
        </span>
      </div>
    </div>
  );
}
