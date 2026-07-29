import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../config/firebase';
import { useHabits } from '../../hooks/useHabits';
import { useUser } from '../../hooks/useUser';

export default function ProfileScreen() {
  const { userData, loading } = useUser();
  const { habits } = useHabits();

  const today = new Date().toISOString().split('T')[0];
  const totalCompleted = habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0);
  const totalHabits = habits.length;

  const getLevelName = (level: number) => {
    if (level < 5) return 'Novato';
    if (level < 10) return 'Aprendiz';
    if (level < 20) return 'Constante';
    if (level < 35) return 'Disciplinado';
    return 'Maestro';
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (loading) return <ActivityIndicator size="large" color="#6C63FF" style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Avatar y nombre */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{userData?.name}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>
            {getLevelName(userData?.level || 1)} · Nivel {userData?.level}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userData?.xp}</Text>
          <Text style={styles.statLabel}>XP Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalHabits}</Text>
          <Text style={styles.statLabel}>Hábitos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCompleted}</Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>
      </View>

      {/* Info personal */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Información personal</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#999" />
          <Text style={styles.infoText}>{userData?.age ? `${userData.age} años` : 'Edad no especificada'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#999" />
          <Text style={styles.infoText}>{userData?.gender || 'Género no especificado'}</Text>
        </View>
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#999', marginTop: 4 },
  levelBadge: { backgroundColor: '#E0DEFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 8 },
  levelText: { color: '#6C63FF', fontWeight: 'bold', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#6C63FF' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoText: { fontSize: 14, color: '#555' },
  signOutButton: { backgroundColor: '#FF6B6B', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  signOutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});