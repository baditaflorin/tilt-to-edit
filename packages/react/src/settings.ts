export interface TiltSettingItem {
  id?: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
  formatValue?: ((value: number, item: TiltSettingItem) => string) | undefined;
}

export interface TiltSettingChangeEvent {
  index: number;
  direction: -1 | 1;
  item: TiltSettingItem;
  nextItem: TiltSettingItem;
  items: TiltSettingItem[];
}

export interface TiltSettingSection {
  id?: string;
  label: string;
  description?: string;
  items: TiltSettingItem[];
}

export interface TiltSubmenuChangeEvent {
  sectionIndex: number;
  itemIndex: number;
  direction: -1 | 1;
  section: TiltSettingSection;
  item: TiltSettingItem;
  nextItem: TiltSettingItem;
  sections: TiltSettingSection[];
}

export function clampSettingValue(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

export function formatSettingValue(item: TiltSettingItem, value = item.value) {
  const formatted = item.formatValue?.(value, item);
  if (formatted) {
    return formatted;
  }

  const isWholeNumber =
    Number.isInteger(value) && Number.isInteger(item.step ?? 1);
  const baseValue = isWholeNumber ? value.toString() : value.toFixed(1);
  return item.unit ? `${baseValue} ${item.unit}` : baseValue;
}

export function adjustSettingItem(
  item: TiltSettingItem,
  direction: -1 | 1,
) {
  const min = item.min ?? 0;
  const max = item.max ?? 100;
  const step = item.step ?? 1;
  const nextValue = clampSettingValue(item.value + direction * step, min, max);

  return {
    ...item,
    value: nextValue,
  };
}

export function replaceSettingItem(
  items: TiltSettingItem[],
  index: number,
  nextItem: TiltSettingItem,
) {
  return items.map((item, itemIndex) => (itemIndex === index ? nextItem : item));
}

export function replaceSectionSettingItem(
  sections: TiltSettingSection[],
  sectionIndex: number,
  itemIndex: number,
  nextItem: TiltSettingItem,
) {
  return sections.map((section, currentSectionIndex) => {
    if (currentSectionIndex !== sectionIndex) {
      return section;
    }

    return {
      ...section,
      items: replaceSettingItem(section.items, itemIndex, nextItem),
    };
  });
}

export function clampIndex(index: number, length: number) {
  if (length <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), length - 1);
}

export function createItemIndexMap(
  sections: TiltSettingSection[],
  initialItemIndex = 0,
) {
  return sections.map((section) => clampIndex(initialItemIndex, section.items.length));
}
