export interface ColumnConfig {
  label: string;
  key: string;
  render?: (value: any, item: any) => React.ReactNode;
}

export const getItemTableConfig = (translang: any): ColumnConfig[] => [
  { label: translang.name, key: 'name' },
  { label: translang.unit, key: 'unit_name', render: (_, item) => item.unit_name ? item.unit_name : 'N/A' },
];

export const getOpeningStockTableConfig = (translang: any): ColumnConfig[] => [
  { label: translang.date, key: 'date' },
  { label: translang.item_name, key: 'item_name', render: (_, item) => item.item_name ? item.item_name : 'N/A' },
  { label: translang.quantity, key: 'qty', render: (val) => Number(val).toFixed(3) },
];

export const getItemInwardTableConfig = (translang: any): ColumnConfig[] => [
  { label: translang.date, key: 'date' },
  { label: translang.item_name, key: 'item_name', render: (_, item) => item.item_name ? item.item_name : 'N/A' },
  { label: translang.quantity, key: 'qty', render: (val) => Number(val).toFixed(3) },
];
