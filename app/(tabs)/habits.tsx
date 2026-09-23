import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { getHabitIconName } from '../../constants/habits';
import { MAX_HABITS, useHabits } from '../../hooks/useHabits';
import { useUser } from '../../hooks/useUser';
import { TutorialTooltip } from '../../components/TutorialTooltip';
import { useAppTheme } from '../../contexts/ThemeContext';
import { getLocalDateKey } from '../../utils/dates';

export default function HabitsScreen() {
  const { habits, loading, completeHabit, deleteHabit, isProcessing } = useHabits();
  const { userData } = useUser();
  const [tutorialVisible, setTutorialVisible] = useState(true);
  const { theme } = useAppTheme();
  const router = useRouter();

  const today = getLocalDateKey();

  const handleComplete = async (habit: any) => {
    const result = await completeHabit(habit.id, habit.streak, habit.completedDates);
    if (result?.alreadyDone) {
      alert('¡Ya completaste este hábito hoy!');
    } else if (result?.xpEarned) {
      alert(`+${result.xpEarned} XP ganados`);
    }
  };

  const handleDelete = (habit: any) => {
    Alert.alert(
      'Eliminar hábito',
      `Vas a eliminar "${habit.name}". Esta acción no se puede deshacer y perderás su progreso.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const removed = await deleteHabit(habit.id);
            if (!removed) {
              alert('No se pudo eliminar el hábito');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Mis Hábitos</Text>
        <TouchableOpacity
          style={[styles.addButton, habits.length >= MAX_HABITS && styles.addButtonDisabled]}
          onPress={() => {
            if (habits.length >= MAX_HABITS) {
              Alert.alert('Límite alcanzado', `Solo puedes tener hasta ${MAX_HABITS} hábitos.`);
              return;
            }
            router.push('/create-habit');
          }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 40 }} />
      ) : habits.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="trophy-outline" size={56} color="#6C63FF" />
          <Text style={styles.emptyText}>Aún no tienes hábitos</Text>
          <Text style={styles.emptySubtext}>Toca el + para crear tu primer hábito</Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => {
            const completedToday = item.completedDates?.includes(today);
            return (
              <View style={[styles.habitCard, { borderLeftColor: item.color, backgroundColor: theme.surface }]}>
                <Ionicons name={getHabitIconName(item) as any} size={28} color={item.color} style={styles.habitIcon} />
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={styles.habitCategory}>{item.category}</Text>
                  <Text style={styles.habitDays}>{item.completedDates?.length || 0} días completados</Text>
                </View>
                 <View style={styles.actions}>
                   <TouchableOpacity
                     style={[styles.checkButton, completedToday && styles.checkButtonDone]}
                     onPress={() => handleComplete(item)}
                     disabled={isProcessing}
                   >
                     <Ionicons
                       name={completedToday ? 'checkmark-circle' : 'ellipse-outline'}
                       size={36}
                       color={completedToday ? '#6C63FF' : '#ccc'}
                     />
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.editButton} onPress={() => router.push({ pathname: '/edit-habit', params: { id: item.id } })}>
                     <Ionicons name="pencil-outline" size={22} color="#6C63FF" />
                   </TouchableOpacity>
                   <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                     <Ionicons name="trash-outline" size={22} color="#D63031" />
                   </TouchableOpacity>
                 </View>
              </View>
            );
          }}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
      {userData?.tutorialActive && tutorialVisible && habits.length > 0 && (
        <TutorialTooltip
          position="bottom"
          text="El ícono de papelera elimina un hábito y también su progreso. Esta acción no se puede deshacer."
          onDismiss={() => setTutorialVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  addButton: { backgroundColor: '#6C63FF', borderRadius: 14, padding: 6 },
  addButtonDisabled: { opacity: 0.5 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  emptySubtext: { fontSize: 14, color: '#999' },
  habitCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  habitIcon: { marginRight: 12 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  habitCategory: { fontSize: 13, color: '#999', marginTop: 2 },
  habitDays: { fontSize: 12, color: '#6C63FF', marginTop: 4 },
  actions: { alignItems: 'center', gap: 8 },
  checkButton: { padding: 4 },
  checkButtonDone: { opacity: 0.8 },
  editButton: { padding: 6 },
  deleteButton: { padding: 6 },
});