import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !age || !gender) {
      setError('Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        age: parseInt(age),
        gender,
        photoURL: null,
        xp: 0,
        level: 1,
        currentConstellation: 0,
        activeConstellation: 'orion',
        constellations: [
          { id: 'orion', constellationStars: 0, smallStars: 0, completed: false, locked: false },
          { id: 'osa-mayor', constellationStars: 0, smallStars: 0, completed: false, locked: true },
          { id: 'casiopea', constellationStars: 0, smallStars: 0, completed: false, locked: true },
          { id: 'cruz-del-sur', constellationStars: 0, smallStars: 0, completed: false, locked: true },
          { id: 'escorpio', constellationStars: 0, smallStars: 0, completed: false, locked: true },
        ],
        tutorialSessions: 0,
        tutorialActive: false,
        lastCompletedDate: null,
        createdAt: new Date(),
      });
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Inicia sesión.');
      } else if (e.code === 'auth/weak-password') {
        setError('La contraseña es muy débil. Usa al menos 6 caracteres.');
      } else if (e.code === 'auth/invalid-email') {
        setError('El correo electrónico no es válido.');
      } else if (e.code === 'auth/operation-not-allowed') {
        setError('No se puede crear cuenta. Contacta al administrador.');
      } else {
        setError(e.message || 'Error al crear la cuenta, intenta de nuevo');
      }
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = ['Masculino', 'Femenino', 'Prefiero no decir'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Habit Galaxy</Text>
      <Text style={styles.subtitle}>Crea tu cuenta</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput style={styles.input} placeholder="Nombre completo" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Edad" value={age} onChangeText={setAge} keyboardType="numeric" />

      <Text style={styles.label}>Género</Text>
      <View style={styles.genderContainer}>
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.genderButton, gender === option && styles.genderButtonActive]}
            onPress={() => setGender(option)}
          >
            <Text style={[styles.genderText, gender === option && styles.genderTextActive]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrarse</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#6C63FF' },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 32, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#6C63FF', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  error: { color: 'red', textAlign: 'center', marginBottom: 16 },
  link: { textAlign: 'center', color: '#6C63FF', fontSize: 14 },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  genderContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  genderButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, flex: 1, alignItems: 'center' },
  genderButtonActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  genderText: { color: '#333', fontSize: 14 },
  genderTextActive: { color: '#fff' },
});