export const CATEGORIES = [
  {
    id: 'health',
    name: 'Salud & Fitness',
    iconName: 'barbell-outline',
    color: '#FF6B6B',
  },
  {
    id: 'nutrition',
    name: 'Alimentación & Nutrición',
    iconName: 'nutrition-outline',
    color: '#FF8C42',
  },
  {
    id: 'mind',
    name: 'Mente & Bienestar',
    iconName: 'body-outline',
    color: '#A29BFE',
  },
  {
    id: 'spiritual',
    name: 'Espiritualidad',
    iconName: 'sparkles-outline',
    color: '#A29BFE',
  },
  {
    id: 'study',
    name: 'Estudio & Productividad',
    iconName: 'book-outline',
    color: '#FDCB6E',
  },
  {
    id: 'tech',
    name: 'Tecnología & Programación',
    iconName: 'laptop-outline',
    color: '#0984E3',
  },
  {
    id: 'art',
    name: 'Arte & Creatividad',
    iconName: 'color-palette-outline',
    color: '#FD79A8',
  },
  {
    id: 'finance',
    name: 'Finanzas',
    iconName: 'cash-outline',
    color: '#00B894',
  },
  {
    id: 'social',
    name: 'Social & Relaciones',
    iconName: 'people-outline',
    color: '#0984E3',
  },
];

const CATEGORY_ICON_NAMES = new Set(CATEGORIES.map((category) => category.iconName));

export function getHabitIconName(habit: { icon?: string; category?: string }) {
  if (habit.icon && CATEGORY_ICON_NAMES.has(habit.icon)) {
    return habit.icon;
  }

  const category = CATEGORIES.find((item) => item.name === habit.category);
  return category?.iconName || 'ellipse-outline';
}

export const GOAL_OPTIONS = [
  { label: '1 semana', value: 7 },
  { label: '1 mes', value: 30 },
  { label: '3 meses', value: 90 },
];

export const FREQUENCY_OPTIONS = [
  { label: 'Diario', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
];