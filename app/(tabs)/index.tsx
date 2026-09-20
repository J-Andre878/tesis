import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getHabitIconName } from '../../constants/habits';
import { useHabits } from '../../hooks/useHabits';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../hooks/useUser';

export default function HomeScreen() {
  const { userData, loading: loadingUser } = useUser();
  const { habits, loading: loadingHabits, completeHabit, isProcessing } = useHabits();
  const { theme } = useAppTheme();

  const today = new Date().toISOString().split('T')[0];
  const todayHabits = habits.filter(h => h.frequency === 'daily' || true);
  const completedToday = todayHabits.filter(h => h.completedDates?.includes(today)).length;
  const totalToday = todayHabits.length;
  const progressPercent = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getLevelName = (level: number) => {
    if (level < 5) return 'Novato';
    if (level < 10) return 'Aprendiz';
    if (level < 20) return 'Constante';
    if (level < 35) return 'Disciplinado';
    return 'Maestro';
  };

  const handleComplete = async (habit: any) => {
    const result = await completeHabit(habit.id, habit.streak, habit.completedDates);
    if (result?.alreadyDone) {
      alert('¡Ya completaste este hábito hoy!');
    }
  };

  if (loadingUser || loadingHabits) {
    return <ActivityIndicator size="large" color="#6C63FF" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>

      {/* Saludo */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={[styles.name, { color: theme.text }]}>{userData?.name?.split(' ')[0]}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Nv. {userData?.level}</Text>
          <Text style={styles.levelName}>{getLevelName(userData?.level || 1)}</Text>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.xpContainer}>
        <Text style={styles.xpText}>{userData?.xp} XP</Text>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${(userData?.xp || 0) % 100}%` }]} />
        </View>
        <Text style={styles.xpNext}>{100 - ((userData?.xp || 0) % 100)} XP para el siguiente nivel</Text>
      </View>

      {/* Resumen del día */}
      <View style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
        <Text style={styles.summaryTitle}>Hoy</Text>
        <Text style={[styles.summaryCount, { color: theme.text }]}>
          {completedToday} / {totalToday} hábitos completados
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        {completedToday === totalToday && totalToday > 0 && (
          <Text style={styles.perfectDay}>Día perfecto</Text>
        )}
      </View>

      {/* Hábitos de hoy */}
      <Text style={styles.sectionTitle}>Tus hábitos de hoy</Text>
      {habits.length === 0 ? (
        <View style={styles.emptyHabits}>
          <Text style={styles.emptyText}>No tienes hábitos aún</Text>
          <Text style={styles.emptySubtext}>Ve a la tab Hábitos para crear uno</Text>
        </View>
      ) : (
        habits.map((habit) => {
          const completedToday = habit.completedDates?.includes(today);
          return (
            <View key={habit.id} style={[styles.habitCard, { borderLeftColor: habit.color, backgroundColor: theme.surface }]}>
              <Ionicons name={getHabitIconName(habit) as any} size={28} color={habit.color} style={styles.habitIcon} />
              <View style={styles.habitInfo}>
                <Text style={[styles.habitName, { color: theme.text }]}>{habit.name}</Text>
                <Text style={styles.habitDays}>{habit.completedDates?.length || 0} días completados</Text>
              </View>
              <TouchableOpacity onPress={() => handleComplete(habit)} disabled={isProcessing}>
                <Ionicons
                  name={completedToday ? 'checkmark-circle' : 'ellipse-outline'}
                  size={36}
                  color={completedToday ? '#6C63FF' : '#ccc'}
                />
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 16, color: '#999' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  levelBadge: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 10, alignItems: 'center' },
  levelText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  levelName: { color: '#E0DEFF', fontSize: 11 },
  xpContainer: { marginBottom: 20 },
  xpText: { fontSize: 13, color: '#6C63FF', fontWeight: 'bold', marginBottom: 4 },
  xpBar: { height: 6, backgroundColor: '#E0DEFF', borderRadius: 3 },
  xpFill: { height: 6, backgroundColor: '#6C63FF', borderRadius: 3 },
  xpNext: { fontSize: 11, color: '#999', marginTop: 4 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  summaryTitle: { fontSize: 14, color: '#999', marginBottom: 4 },
  summaryCount: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  progressBar: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: '#6C63FF', borderRadius: 4 },
  perfectDay: { fontSize: 14, color: '#6C63FF', fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  emptyHabits: { backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  emptySubtext: { fontSize: 13, color: '#999', marginTop: 4 },
  habitCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  habitIcon: { marginRight: 12 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  habitDays: { fontSize: 12, color: '#6C63FF', marginTop: 2 },
});