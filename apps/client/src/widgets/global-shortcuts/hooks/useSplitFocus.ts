import { useCallback, useContext } from 'react';
import { ActiveTabContext } from '@/contexts/TabProvider';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';

export function useSplitFocus() {
  const { setActiveTab } = useContext(ActiveTabContext);
  const { tabKeys } = useContext(LinearTabApiContext);

  const handleFocusSplit = useCallback(
    (index: number) => {
      const keys = tabKeys();
      if (keys[index]) {
        // 해당 인덱스의 스플릿으로 포커스 이동
        setActiveTab(keys[index]);
      }
    },
    [tabKeys, setActiveTab],
  );

  return { handleFocusSplit };
}
