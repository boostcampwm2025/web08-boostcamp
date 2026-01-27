import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import '@codejam/ui/styles.css';

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const bg = context.globals.backgrounds?.value;
      const isDark = bg === 'dark';

      useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
      }, [isDark]);

      return Story();
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
