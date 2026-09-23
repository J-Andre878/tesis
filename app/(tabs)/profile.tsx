import { Ionicons } from '@expo/vector-icons';
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../config/firebase';
import { useHabits } from '../../hooks/useHabits';
import { useUser } from '../../hooks/useUser';
import { useAppTheme } from '../../contexts/ThemeContext';

export default function ProfileScreen() {
  const { userData, loading } = useUser();
  const { habits } = useHabits();
  const { theme, toggleTheme } = useAppTheme();
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

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

  const handleDeleteAccount = () => {
    setShowDeletePassword(true);
  };

  const confirmDelete = async () => {
    if (!deletePassword) {
      Alert.alert('Error', 'Ingresá tu contraseña');
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) return;
      const credential = EmailAuthProvider.credential(user.email!, deletePassword);
      await reauthenticateWithCredential(user, credential);
      const habitsSnapshot = await getDocs(query(collection(db, 'habits'), where('userId', '==', user.uid)));
      if (!habitsSnapshot.empty) {
        const batch = writeBatch(db);
        habitsSnapshot.docs.forEach(habitDoc => batch.delete(habitDoc.ref));
        await batch.commit();
      }
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      setShowDeletePassword(false);
      setDeletePassword('');
      Alert.alert('Cuenta eliminada');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo eliminar la cuenta');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#6C63FF" style={{ flex: 1 }} />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>

      {/* Avatar y nombre */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{userData?.name}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>
            {getLevelName(userData?.level || 1)} · Nivel {userData?.level}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.statNumber}>{userData?.xp}</Text>
          <Text style={styles.statLabel}>XP Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.statNumber}>{totalHabits}</Text>
          <Text style={styles.statLabel}>Hábitos</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.statNumber}>{totalCompleted}</Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>
      </View>

      {/* Info personal */}
      <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.infoTitle, { color: theme.text }]}>Información personal</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#999" />
          <Text style={[styles.infoText, { color: theme.mutedText }]}>{userData?.age ? `${userData.age} años` : 'Edad no especificada'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#999" />
          <Text style={[styles.infoText, { color: theme.mutedText }]}>{userData?.gender || 'Género no especificado'}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.themeButton, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={toggleTheme}>
        <Ionicons name={theme.dark ? 'sunny-outline' : 'moon-outline'} size={20} color={theme.primary} />
        <Text style={[styles.themeButtonText, { color: theme.text }]}>
          {theme.dark ? 'Usar modo claro' : 'Usar modo oscuro'}
        </Text>
      </TouchableOpacity>

{/* Cerrar sesión */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text style={styles.deleteAccountText}>Eliminar cuenta permanentemente</Text>
      </TouchableOpacity>

      {showDeletePassword && (
        <View style={styles.deletePasswordOverlay}>
          <View style={[styles.deletePasswordModal, { backgroundColor: theme.surface }]}>
            <Text style={[styles.deletePasswordTitle, { color: theme.text }]}>Ingresá tu contraseña</Text>
            <TextInput
              style={[styles.deletePasswordInput, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
              placeholder="Contraseña"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
            />
            <View style={styles.deletePasswordButtons}>
              <TouchableOpacity
                style={styles.deletePasswordCancel}
                onPress={() => { setShowDeletePassword(false); setDeletePassword(''); }}
              >
                <Text style={styles.deletePasswordCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deletePasswordConfirm} onPress={confirmDelete}>
                <Text style={styles.deletePasswordConfirmText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
  deleteAccountButton: { backgroundColor: '#D63031', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12 },
  deleteAccountText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  themeButton: { borderWidth: 1, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12 },
  themeButtonText: { fontSize: 16, fontWeight: 'bold' },
  deletePasswordOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  deletePasswordModal: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
  deletePasswordTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16, textAlign: 'center' },
  deletePasswordInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 20 },
  deletePasswordButtons: { flexDirection: 'row', gap: 12 },
  deletePasswordCancel: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, alignItems: 'center' },
  deletePasswordCancelText: { color: '#333', fontSize: 16, fontWeight: '600' },
  deletePasswordConfirm: { flex: 1, backgroundColor: '#D63031', borderRadius: 10, padding: 14, alignItems: 'center' },
  deletePasswordConfirmText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});