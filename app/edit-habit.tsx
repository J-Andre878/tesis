import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CATEGORIES, GOAL_OPTIONS } from '../constants/habits';
import { useHabits } from '../hooks/useHabits';

export default function EditHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, updateHabit } = useHabits();

  const habit = habits.find(h => h.id === id);

  const [name, setName] = useState(habit?.name || '');
  const [selectedCategory, setSelectedCategory] = useState<any>(
    habit ? CATEGORIES.find(c => c.name === habit.category) || null : null
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(habit?.subcategory || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(habit?.frequency || 'daily');
  const [weeklyDays, setWeeklyDays] = useState(habit?.weeklyDays || 3);
  const [goal, setGoal] = useState(habit?.goal || 21);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name || !selectedCategory || !id) return;
    setLoading(true);
    await updateHabit(id, {
      name,
      category: selectedCategory.name,
      subcategory: selectedSubcategory || undefined,
      frequency,
      weeklyDays: frequency === 'weekly' ? weeklyDays : undefined,
      goal,
      icon: selectedCategory.iconName,
      color: selectedCategory.color,
    });
    setLoading(false);
    router.back();
  };

  if (!habit) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>Editar hábito</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>Nombre del hábito</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Hacer ejercicio, Leer 20 minutos..."
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.question}>Categoría</Text>
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, selectedCategory?.id === cat.id && { borderColor: cat.color, borderWidth: 2 }]}
              onPress={() => { setSelectedCategory(cat); setSelectedSubcategory(''); }}
            >
              <Ionicons name={cat.iconName as any} size={30} color={cat.color} />
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCategory && selectedCategory.subcategories.length > 0 && (
          <>
            <Text style={styles.question}>Subcategoría <Text style={styles.optional}>(opcional)</Text></Text>
            <View style={styles.subcategoryContainer}>
              {selectedCategory.subcategories.map((sub: string) => (
                <TouchableOpacity
                  key={sub}
                  style={[styles.subButton, selectedSubcategory === sub && { backgroundColor: selectedCategory.color }]}
                  onPress={() => setSelectedSubcategory(selectedSubcategory === sub ? '' : sub)}
                >
                  <Text style={[styles.subText, selectedSubcategory === sub && { color: '#fff' }]}>{sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.question}>Frecuencia</Text>
        <View style={styles.row}>
          {['daily', 'weekly'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.freqButton, frequency === f && styles.freqButtonActive]}
              onPress={() => setFrequency(f as 'daily' | 'weekly')}
            >
              <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>{f === 'daily' ? 'Diario' : 'Semanal'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {frequency === 'weekly' && (
          <>
            <Text style={styles.question}>Días por semana</Text>
            <View style={styles.row}>
              {[2, 3, 4, 5, 6, 7].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayButton, weeklyDays === d && styles.dayButtonActive]}
                  onPress={() => setWeeklyDays(d)}
                >
                  <Text style={[styles.dayText, weeklyDays === d && styles.dayTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.question}>Meta</Text>
        <View style={styles.row}>
          {GOAL_OPTIONS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[styles.goalButton, goal === g.value && styles.goalButtonActive]}
              onPress={() => setGoal(g.value)}
            >
              <Text style={[styles.goalText, goal === g.value && styles.goalTextActive]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleUpdate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>Guardar cambios</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  back: { fontSize: 16, color: '#6C63FF' },
  stepText: { fontSize: 16, fontWeight: '600', color: '#333' },
  content: { padding: 24, paddingBottom: 60 },
  question: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  categoryCard: { width: '47%', backgroundColor: '#f8f8f8', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  categoryName: { fontSize: 12, textAlign: 'center', color: '#333', fontWeight: '500' },
  subcategoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  subButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  subText: { fontSize: 14, color: '#333' },
  nextButton: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  freqButton: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, alignItems: 'center' },
  freqButtonActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  freqText: { fontSize: 15, color: '#333' },
  freqTextActive: { color: '#fff', fontWeight: 'bold' },
  dayButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  dayButtonActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  dayText: { fontSize: 15, color: '#333' },
  dayTextActive: { color: '#fff', fontWeight: 'bold' },
  goalButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  goalButtonActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  goalText: { fontSize: 14, color: '#333' },
  goalTextActive: { color: '#fff', fontWeight: 'bold' },
});
