export interface ColumnConfig {
  label: string;
  key: string;
  render?: (value: any, item: any) => React.ReactNode;
}

export const getItemTableConfig = (translang: any): ColumnConfig[] => [
  { label: translang.id, key: 'id', render: (val) => `#${val}` },
  { label: translang.name, key: 'name' },
  { label: translang.unit, key: 'unit.name', render: (_, item) => item.unit ? item.unit.name : 'N/A' },
];
