export interface ColumnConfig {
  label: string;
  key: string;
  render?: (value: any, item: any) => React.ReactNode;
}

export const getItemTableConfig = (translang: any): ColumnConfig[] => [
  { label: translang.name, key: 'name' },
  { label: translang.unit, key: 'unit.name', render: (_, item) => item.unit ? item.unit.name : 'N/A' },
];

export const getOpeningStockTableConfig = (translang: any): ColumnConfig[] => [
  { label: translang.date, key: 'date' },
  { label: translang.item_name, key: 'material.name', render: (_, item) => item.material ? item.material.name : 'N/A' },
  { label: translang.quantity, key: 'qty', render: (val) => Number(val).toFixed(3) },
];
