import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@codejam/ui';
import { useState, useEffect } from 'react';

const meta = {
  title: 'Base/Combobox',
  component: Combobox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const frameworks = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'next', label: 'Next.js' },
];

export const Default: Story = {
  render: () => (
    <Combobox>
      <ComboboxInput className="w-[200px]" placeholder="Select framework..." />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
          <ComboboxGroup>
            {frameworks.map((framework) => (
              <ComboboxItem key={framework.value} value={framework.value}>
                {framework.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const Async: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
      if (!open) return;
      setLoading(true);
      const timer = setTimeout(() => {
        setItems([
          { value: 'next.js', label: 'Next.js' },
          { value: 'sveltekit', label: 'SvelteKit' },
          { value: 'nuxt.js', label: 'Nuxt.js' },
          { value: 'remix', label: 'Remix' },
          { value: 'astro', label: 'Astro' },
        ]);
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }, [open]);

    return (
      <Combobox open={open} onOpenChange={setOpen}>
        <ComboboxInput className="w-[200px]" placeholder="Select framework..." />
        <ComboboxContent>
          <ComboboxList>
            {loading ? (
              <div className="text-muted-foreground p-2 text-sm">Loading...</div>
            ) : (
              <ComboboxGroup>
                {items.map((item) => (
                  <ComboboxItem key={item.value} value={item.value}>
                    {item.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};

export const Form: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Language
        </label>
        <Combobox>
          <ComboboxInput className="w-[200px]" placeholder="Select language" />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxGroup>
                <ComboboxItem value="en">English</ComboboxItem>
                <ComboboxItem value="fr">French</ComboboxItem>
                <ComboboxItem value="de">German</ComboboxItem>
                <ComboboxItem value="es">Spanish</ComboboxItem>
                <ComboboxItem value="pt">Portuguese</ComboboxItem>
                <ComboboxItem value="ru">Russian</ComboboxItem>
                <ComboboxItem value="ja">Japanese</ComboboxItem>
                <ComboboxItem value="ko">Korean</ComboboxItem>
                <ComboboxItem value="zh">Chinese</ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <p className="text-muted-foreground text-sm">
          This is the language that will be used in the dashboard.
        </p>
      </div>
    </div>
  ),
};
