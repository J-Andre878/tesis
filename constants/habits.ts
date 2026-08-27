export const CATEGORIES = [
  {
    id: 'health',
    name: 'Salud & Fitness',
    iconName: 'barbell-outline',
    color: '#FF6B6B',
    subcategories: ['Gym / Pesas', 'Calistenia', 'Correr', 'Yoga', 'Otro'],
  },
  {
    id: 'mind',
    name: 'Mente & Bienestar',
    iconName: 'body-outline',
    color: '#A29BFE',
    subcategories: ['Meditación', 'Control de impulsos', 'Salud mental', 'Otro'],
  },
  {
    id: 'study',
    name: 'Estudio & Productividad',
    iconName: 'book-outline',
    color: '#FDCB6E',
    subcategories: ['Idiomas', 'Programación', 'Lectura', 'Universidad', 'Otro'],
  },
  {
    id: 'art',
    name: 'Arte & Creatividad',
    iconName: 'color-palette-outline',
    color: '#FD79A8',
    subcategories: ['Guitarra', 'Piano', 'Canto', 'Dibujo', 'Escritura', 'Otro'],
  },
  {
    id: 'finance',
    name: 'Finanzas',
    iconName: 'cash-outline',
    color: '#00B894',
    subcategories: ['Ahorro', 'Control de gastos', 'Inversiones', 'Otro'],
  },
  {
    id: 'social',
    name: 'Social & Relaciones',
    iconName: 'people-outline',
    color: '#0984E3',
    subcategories: ['Familia', 'Amigos', 'Comunicación', 'Otro'],
  },
  {
    id: 'other',
    name: 'Otro',
    iconName: 'settings-outline',
    color: '#636E72',
    subcategories: [],
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