import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CATEGORIES, GOAL_OPTIONS } from '../constants/habits';
import { useHabits } from '../hooks/useHabits';

export default function CreateHabitScreen() {
  const router = useRouter();
  const { addHabit } = useHabits();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [weeklyDays, setWeeklyDays] = useState(3);
  const [goal, setGoal] = useState(21);
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!name || !selectedCategory) return;
    setLoading(true);
    await addHabit({
      name,
      category: selectedCategory.name,
      frequency,
      weeklyDays: frequency === 'weekly' ? weeklyDays : undefined,
      goal,
      icon: selectedCategory.iconName,
      color: selectedCategory.color,
    });
    setLoading(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(1)}>
          <Text style={styles.back}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.stepText}>Paso {step} de 2</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 ? (
          <>
            <Text style={styles.question}>¿Cómo se llama tu hábito?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Hacer ejercicio, Leer 20 minutos..."
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.question}>¿En qué categoría entra?</Text>
            <View style={styles.grid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, selectedCategory?.id === cat.id && { borderColor: cat.color, borderWidth: 2 }]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Ionicons name={cat.iconName as any} size={30} color={cat.color} />
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.nextButton, (!name || !selectedCategory) && styles.disabled]}
              onPress={() => setStep(2)}
              disabled={!name || !selectedCategory}
            >
              <Text style={styles.nextText}>Siguiente →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.question}>¿Con qué frecuencia?</Text>
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
                <Text style={styles.question}>¿Cuántos días a la semana?</Text>
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

            <Text style={styles.question}>¿Cuál es tu meta?</Text>
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

            <TouchableOpacity style={styles.nextButton} onPress={handleFinish} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>Crear hábito</Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  back: { fontSize: 16, color: '#6C63FF' },
  stepText: { fontSize: 14, color: '#999' },
  progressBar: { height: 4, backgroundColor: '#eee', marginHorizontal: 24, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#6C63FF', borderRadius: 2 },
  content: { padding: 24, paddingBottom: 60 },
  question: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  categoryCard: { width: '47%', backgroundColor: '#f8f8f8', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  categoryName: { fontSize: 12, textAlign: 'center', color: '#333', fontWeight: '500' },
  nextButton: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  nextText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabled: { backgroundColor: '#ccc' },
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