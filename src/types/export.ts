export type ExportType =
  | 'all'
  | 'missing'
  | 'raw_materials'
  | 'craftable'
  | 'crafting_list'
  | 'storage_list';

export type ExportFormat = 'csv' | 'txt';

export interface ExportOptions {
  type: ExportType;
  format: ExportFormat;
  language?: 'es' | 'en';
}
