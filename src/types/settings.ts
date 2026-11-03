export type SettingsItemType = 'link' | 'toggle' | 'value' | 'info';

export interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type?: SettingsItemType;
  value?: string;
  destructive?: boolean;
}

export interface SettingsSection {
  id: string;
  title?: string;
  items: SettingsItem[];
}
