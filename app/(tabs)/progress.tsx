import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getHabitIconName } from '../../constants/habits';
import { useHabits } from '../../hooks/useHabits';
import { useUser } from '../../hooks/useUser';

export default function ProgressScreen() {
  const { habits, loading } = useHabits();
  const { userData } = useUser();

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();

  const getConsistency = (habit: any) => {
    const total = habit.completedDates?.length || 0;
    const daysSinceCreated = Math.max(1, Math.floor(
      (new Date().getTime() - new Date(habit.createdAt?.toDate?.() || habit.createdAt).getTime())
      / (1000 * 60 * 60 * 24)
    ));
    const expected = habit.frequency === 'daily'
      ? daysSinceCreated
      : Math.floor(daysSinceCreated / 7) * (habit.weeklyDays || 3);
    return Math.min(100, Math.round((total / Math.max(1, expected)) * 100));
  };

  const getWeeklyCompleted = () => {
    return last7Days.map(day => ({
      day,
      count: habits.filter(h => h.completedDates?.includes(day)).length,
    }));
  };

  const weeklyData = getWeeklyCompleted();
  const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

  const dayLabels: Record<string, string> = {
    '0': 'Dom', '1': 'Lun', '2': 'Mar', '3': 'Mié', '4': 'Jue', '5': 'Vie', '6': 'Sáb'
  };

  if (loading) return <ActivityIndicator size="large" color="#6C63FF" style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mi Progreso</Text>

      {/* Gráfica semanal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hábitos completados esta semana</Text>
        <View style={styles.chart}>
          {weeklyData.map((item, index) => {
            const date = new Date(item.day + 'T12:00:00');
            const dayNum = date.getDay().toString();
            const barHeight = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            return (
              <View key={index} style={styles.barContainer}>
                <Text style={styles.barCount}>{item.count > 0 ? item.count : ''}</Text>
                <View style={styles.barBackground}>
                  <View style={[styles.barFill, { height: `${barHeight}%` }]} />
                </View>
                <Text style={styles.barLabel}>{dayLabels[dayNum]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Consistencia por hábito */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Consistencia por hábito</Text>
        {habits.length === 0 ? (
          <Text style={styles.emptyText}>Aún no tienes hábitos</Text>
        ) : (
          habits.map((habit) => {
            const consistency = getConsistency(habit);
            return (
              <View key={habit.id} style={styles.habitRow}>
                <Ionicons name={getHabitIconName(habit) as any} size={22} color={habit.color} style={styles.habitIcon} />
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <View style={styles.consistencyBar}>
                    <View style={[styles.consistencyFill, { width: `${consistency}%`, backgroundColor: habit.color }]} />
                  </View>
                </View>
                <Text style={[styles.consistencyPercent, { color: habit.color }]}>{consistency}%</Text>
              </View>
            );
          })
        )}
      </View>

      {/* Resumen general */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen general</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData?.xp || 0}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData?.level || 1}</Text>
            <Text style={styles.statLabel}>Nivel</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Total completados</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  barContainer: { flex: 1, alignItems: 'center', gap: 4 },
  barCount: { fontSize: 11, color: '#6C63FF', fontWeight: 'bold', height: 16 },
  barBackground: { width: 28, height: 80, backgroundColor: '#f0f0f0', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: '#6C63FF', borderRadius: 6 },
  barLabel: { fontSize: 11, color: '#999' },
  habitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  habitIcon: { width: 24 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
  consistencyBar: { height: 6, backgroundColor: '#f0f0f0', borderRadius: 3 },
  consistencyFill: { height: 6, borderRadius: 3 },
  consistencyPercent: { fontSize: 13, fontWeight: 'bold', width: 36, textAlign: 'right' },
  emptyText: { color: '#999', textAlign: 'center', padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#6C63FF' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 4 },
});