import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
} from '@codejam/ui';

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
      <ComboboxTrigger className="w-[200px]">
        <ComboboxInput placeholder="프레임워크 선택..." />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxEmpty>결과가 없습니다.</ComboboxEmpty>
        <ComboboxGroup>
          {frameworks.map((framework) => (
            <ComboboxItem key={framework.value} value={framework.value}>
              {framework.label}
            </ComboboxItem>
          ))}
        </ComboboxGroup>
      </ComboboxContent>
    </Combobox>
  ),
};

export const WithSearch: Story = {
  render: () => (
    <Combobox>
      <ComboboxTrigger className="w-[250px]">
        <ComboboxInput placeholder="검색..." />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
        <ComboboxGroup>
          {frameworks.map((framework) => (
            <ComboboxItem key={framework.value} value={framework.value}>
              {framework.label}
            </ComboboxItem>
          ))}
        </ComboboxGroup>
      </ComboboxContent>
    </Combobox>
  ),
};
